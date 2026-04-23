# React Conventions — Hersa

## Component structure

- One component per file
- File name matches the component name: `UserCard.tsx`
- Props typed with `interface` above the component: `interface UserCardProps {}`
- Component as a `function` declaration — never a top-level arrow function
- Default export only for pages and layouts; named exports for everything else
- Components ≤ 300 lines — extract hooks or subcomponents if exceeded

```typescript
interface EventCardProps {
  event: GraduationEvent;
  onSelect: (id: string) => void;
}

function EventCard({ event, onSelect }: EventCardProps) {
  return (...)
}

export default EventCard;
```

## Feature structure

```
features/<feature-name>/
├── api/
│   ├── get<Resource>Query.ts     # one hook per file
│   └── <method><Resource>Mutation.ts
├── components/                   # PascalCase
├── hooks/                        # camelCase: useXxx.ts
├── helpers/                      # camelCase: business logic (Hersa domain)
├── utils/                        # camelCase: code utilities (generic)
├── types.ts                      # domain types for this feature
└── index.ts                      # public exports (barrel)
```

## Helpers vs Utils

Every feature (and `shared/`) separates auxiliary logic into two folders:

| Folder | Contains | Rule |
|--------|----------|------|
| `helpers/` | **Business logic** — Hersa domain rules | References domain types, pricing, status transitions, or Hersa-specific concepts |
| `utils/` | **Code utilities** — generic, reusable anywhere | Could be copy-pasted to any project unchanged |

```typescript
// helpers/calculatePackageTotal.ts — knows the Hersa domain
export function calculatePackageTotal(booking: Booking): number { ... }
export function getEventStatusLabel(status: EventStatus): string { ... }
export function buildTogaSizeLabel(height: number): string { ... }

// utils/formatDate.ts — generic, domain-agnostic
export function formatDate(iso: string, locale?: string): string { ... }
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> { ... }
export function clamp(value: number, min: number, max: number): number { ... }
```

- Components and hooks call helpers; helpers may call utils — never the reverse
- If a helper needs to fetch data, extract it to `hooks/` instead
- Promote to `shared/helpers/` or `shared/utils/` only when used across more than one feature

## Imports

- Never deep relative imports (`../../../`) — always path aliases
- Mandatory order: React → third-party (alphabetical) → internal aliases

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import { AuthContext } from '@shared/contexts/AuthContext';
import { getEventsQuery } from './api/getEventsQuery';
```

## React Query hooks

- One file per hook, in `features/<n>/api/`
- Naming: `get<Resource>Query.ts` for queries, `<method><Resource>Mutation.ts` for mutations
- Always type the generic: `useQuery<GraduationEvent[]>(...)`

```typescript
// features/events/api/getEventsQuery.ts
export const getEventsQuery = () =>
  useQuery<GraduationEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/v1/graduation-events/');
      return data;
    },
  });
```

## State — decision tree

```
Need to share state?
├── Auth / cross-app UI   → useContext + Context API
├── Complex global state  → Redux Toolkit
└── Server / async data   → React Query (always preferred for API data)
```

- Never `useState` + `useEffect` for API calls

## Forms

- Always `react-hook-form` — never manual form state
- Integrate with MUI using `Controller`
- Validation with Zod integrated with RHF
- Server error messages displayed inline on the corresponding field

## Error handling

- Error boundaries on main routes
- MUI Snackbar/Alert for global errors
- Loading: `Skeleton` for initial content, `CircularProgress` for in-flight actions

## TypeScript

- `strict: true` — never `any`; use `unknown` + narrowing when the shape is truly unknown
- `interface` for domain objects, `type` for unions and primitives
- API types in camelCase (the interceptor transforms automatically)
- Never use `as` to cast — prefer type guards
- All feature types in `features/<n>/types.ts`; shared types in `shared/types/`

## HTTP

- Never use `fetch()` directly — always use the axios instance at `src/api/axiosInstance.ts`
- The interceptor attaches the JWT token and transforms casing automatically
- Never attach tokens manually per request

## Lists

- Never use array indices as `key` — always use the resource `id`
