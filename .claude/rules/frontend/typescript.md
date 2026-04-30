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
