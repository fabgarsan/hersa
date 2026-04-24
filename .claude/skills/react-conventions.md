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
