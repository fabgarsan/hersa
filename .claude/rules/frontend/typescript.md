---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# TypeScript rules

- `strict: true` — never use `any`; use `unknown` + narrowing when the shape is truly unknown.
- `interface` for object shapes and domain types; `type` for unions and computed types.
- Component props typed with `interface`, named `<ComponentName>Props`, defined in the co-located `types.ts` — never inlined in the `.tsx` file.
- Hook return types named `Use<HookName>Return`, defined in the co-located `types.ts` — the hook must explicitly annotate its return type.
- **No `interface` or `type` declaration in hook files (`use*.ts`, `use*.tsx`)** — all types (return types, parameter types, internal shapes) must live in the co-located `types.ts` and be imported from there.
- Use `import type` for all type-only imports.
- Never use `as` to cast — prefer type guards or narrowing.
- Named exports by default; default export only for pages and layouts.
- Components as `function` declarations, not top-level arrow functions.
- Components must stay under **300 lines** — extract hooks or subcomponents if exceeded.
- Never use array indices as `key` in lists.

## Types location

- Each feature has its own `types.ts` at the feature root.
- Types shared across features go in `src/shared/types/`.
- All API response shapes must be typed in camelCase (the axios interceptor handles transformation).
- Types defined in `types.ts` are re-exported through the folder's `index.ts`.
- **Hook files are type-free**: every `interface` and `type` a hook needs — parameters, internal shapes, return types — is declared in `types.ts` and imported. This applies equally to module hooks, shared hooks, and component-local hooks.

## Test file structure

Apply these rules to every `*.test.ts` / `*.test.tsx` file to eliminate duplication before it appears:

**Shared state per `describe` block** — `QueryClient`, wrappers, and mocks live in `let` variables initialized in `beforeEach`, not recreated inline per test.

```typescript
// ✅
describe("usePermissions", () => {
  let qc: QueryClient;
  let wrapper: ReturnType<typeof createWrapper>;
  beforeEach(() => {
    qc = createTestQueryClient();
    wrapper = createWrapper(qc);
    vi.clearAllMocks();
  });
  it("...", () => { /* uses qc and wrapper directly */ });
});

// ❌ inline per test — duplicates 4 lines in every it()
it("...", () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = createWrapper(qc);
  ...
});
```

**Render helpers** — when ≥2 tests `renderHook` the same hook with the same boilerplate, extract a `renderXxx()` helper inside the `describe` block. The helper closes over the `let mockFn` from `beforeEach` — this is intentional.

```typescript
function renderAdapter(initialPageSize?: number) {
  const qc = createTestQueryClient();
  const wrapper = createWrapper(qc);
  return renderHook(
    () => useDrfAdapter({ queryFn: mockQueryFn, queryKey: ["test"], initialPageSize }),
    { wrapper },
  );
}
```

**Mock data factories** — replace repeated literal objects with a factory that accepts only the varying fields.

```typescript
// ✅ factory inside describe
function emptyPage(count = 0): DrfPaginatedResponse<TestRow> {
  return { count, next: null, previous: null, results: [] };
}
// usage: mockQueryFn.mockResolvedValue(emptyPage(100));

// ❌ copy-pasted 14 times
mockQueryFn.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
```

**Typed mocks** — always type `vi.fn()` with the function signature it replaces; never use `ReturnType<typeof vi.fn>` (untyped).

```typescript
// ✅
type QueryFn = (params: DrfQueryParams) => Promise<DrfPaginatedResponse<TestRow>>;
let mockQueryFn: ReturnType<typeof vi.fn<QueryFn>> = vi.fn<QueryFn>();
beforeEach(() => { mockQueryFn = vi.fn<QueryFn>(); });

// ❌ untyped — breaks assignability to typed parameters
let mockQueryFn: ReturnType<typeof vi.fn>;
```

**Shared helpers across `describe` blocks** — `createTestQueryClient()` and `createWrapper()` belong at module level (top of the test file), not copied into each describe block.

## Import order

```typescript
// 1. React
import { useContext, useState } from 'react';
// 2. Third-party (alphabetical within the group)
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';        // direct — never { Box } from '@mui/material'
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
// 3. Internal aliases
import { AuthContext } from '@shared/contexts/AuthContext';
import { UserCard } from '@shared/components/UserCard';
import { fetchUser } from './api/userQueries';
```

MUI imports must be direct (never barrel) for tree shaking. See `mui-conventions.md`.
