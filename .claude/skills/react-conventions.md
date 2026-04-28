# React Conventions — Hersa

> **Agents:** react-developer, tdd-writer, test-writer
> **Load when:** Writing data-fetching code, wiring up axios/React Query, or structuring global state
> **Summary:** Axios instance pattern, React Query file conventions, state management decision tree

## HTTP client — axios

Centralized instance at `src/api/axiosInstance.ts`. **Never use the native `fetch` API.**

```typescript
import axios from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request: camelCase → snake_case + attach JWT
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data) config.data = snakecaseKeys(config.data, { deep: true });
  return config;
});

// Response: snake_case → camelCase
axiosInstance.interceptors.response.use((response) => {
  if (response.data) response.data = camelcaseKeys(response.data, { deep: true });
  return response;
});

export default axiosInstance;
```

- Never attach tokens manually per request — the interceptor handles it.
- Never convert casing manually — the interceptor handles it in both directions.

## Authentication (JWT)

- Tokens in `localStorage`: keys `accessToken` and `refreshToken`.
- On 401: attempt a silent refresh with `refreshToken`; if it fails, redirect to login.
- Auth state (user info, isAuthenticated) lives in `AuthContext` — **not in Redux**.

## State management decision tree

```
Need to share state?
├── Small / medium scope      → useContext + Context API
├── Complex global state      → Redux Toolkit
└── Server / async data       → React Query (always preferred for API data)
```

## React Query — file conventions

Each file exports a single hook. Files live in `features/<feature>/api/`:

```typescript
// features/rooms/api/getRoomsQuery.ts
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@api/axiosInstance';
import type { Room } from '@features/rooms/types';

export const getRoomsQuery = () =>
  useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/rooms/');
      return data;
    },
  });
```

- Queries: `get<Name>Query.ts` — one hook per file.
- Mutations: `<method><Name>Mutation.ts` — one hook per file.
- Never mix query and mutation logic in the same file.
- Never use generic names like `roomApi.ts`.

## Offline mutation handling

All mutations get offline error detection automatically via `MutationCache.onError` in `main.tsx`. When a network error occurs, a global `<OfflineMutationDialog>` in `App.tsx` is shown — no extra work needed in individual mutation files or components.

### MutationButton — always use for mutation submit buttons

Every form that triggers a mutation must use `<MutationButton>` instead of `<SubmitButton>`. It reads `useOnlineStatus` internally and disables itself automatically when offline, showing a WifiOff icon and the label "Sin conexión".

```typescript
import { MutationButton } from '@shared/components';

<MutationButton
  isPending={isPending}
  label="Guardar"
  pendingLabel="Guardando…"
  fullWidth
/>
```

Props: `isPending`, `label`, `pendingLabel`, `fullWidth?` — identical API to `SubmitButton`. Never add extra `disabled` logic for connectivity — the component handles it.

`SubmitButton` is still available for non-mutation submits (e.g. search filters, navigation steps) that should not be blocked when offline.

### onError guard for local UI

If a mutation component's `onError` renders local error UI (alerts, `setError`), guard against network errors — the global dialog already handles those:

```typescript
import { isNetworkError } from '@api/offlineMutationEvents';

mutate(values, {
  onError: (err) => {
    if (isNetworkError(err)) return;
    // ...local error handling
  },
});
```

Components with no `onError` (or only `onSuccess`) require no changes.

**Never:**
- Render `<OfflineMutationDialog>` inside a component — there is exactly one global instance in `App.tsx`.
- Use `useOfflineMutation` for new mutations — it exists for specialized cases only.

## Types — always in types.ts, never inline

**Rule:** All `interface` and `type` definitions must live in `types.ts` — never declared inside `.tsx` or `.ts` logic files.

- Component props (`<ComponentName>Props`) → feature `types.ts` or `shared/components/types.ts`
- Hook return types (`Use<HookName>Return`) → feature `types.ts`
- API shapes → feature `types.ts`

```typescript
// ✅ features/password/types.ts
export interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

// ✅ ChangePasswordForm.tsx
import type { ChangePasswordFormProps } from '../types';

// ❌ never declare interfaces inside .tsx files
interface ChangePasswordFormProps { ... }  // wrong — belongs in types.ts
```
