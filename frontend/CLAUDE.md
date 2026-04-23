# frontend/

React 19 + TypeScript + Vite. Loaded only when Claude works on files inside this directory.

## Brand & Theme — Togas HERSA

The application follows the **Togas HERSA** brand identity. Always use these tokens when styling components; never introduce arbitrary colors.

### Color tokens (define in `src/shared/styles/theme.ts` using MUI `createTheme`)

```ts
// src/shared/styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const hersaTheme = createTheme({
  palette: {
    primary: {
      main:  '#0B1F3A',   // Deep navy — headers, AppBar, primary buttons
      dark:  '#122640',   // Dark navy — sidebar, drawers, secondary surfaces
      light: '#1E3A5F',   // Mid navy — hover states, emphasized borders
      contrastText: '#C9A227',
    },
    secondary: {
      main:  '#C9A227',   // Gold — CTAs, accents, highlighted icons, active links
      light: '#E8D49A',   // Light gold — hover on gold elements, chips
      dark:  '#A07B10',   // Dark gold — pressed/active states
      contrastText: '#0B1F3A',
    },
    background: {
      default: '#F5F5F5', // App-wide page background
      paper:   '#FFFFFF', // Cards, modals, drawers
    },
    text: {
      primary:   '#1A1A1A', // Primary text (brand black)
      secondary: '#5F5E5A', // Secondary / muted text
    },
    // Semantic states — always use standard MUI color props, never hardcode
    success: { main: '#3B6D11', light: '#EAF3DE' },  // Delivered / Active
    warning: { main: '#854F0B', light: '#FAEEDA' },  // Pending / In progress
    error:   { main: '#A32D2D', light: '#FCEBEB' },  // Overdue / Error
    info:    { main: '#185FA5', light: '#E6F1FB' },  // Informational
  },
});
```

### Usage rules

| Context | Token |
|---------|-------|
| AppBar / Header | `primary.main` (#0B1F3A) with `secondary.main` (#C9A227) text |
| Sidebar / Drawer | `primary.dark` (#122640) |
| Primary button | `variant="contained" color="primary"` → navy background, gold text |
| Secondary button | `variant="outlined" color="primary"` → navy border |
| Accent / floating CTA | `color="secondary"` → gold with navy text |
| Active nav item | `secondary.main` text, `borderBottom: 2px solid secondary.main` |
| Status badge | `color="success" \| "warning" \| "error" \| "info"` via MUI `Chip` |
| Text on dark backgrounds | Always white `#FFFFFF` or gold `#C9A227`, never gray |

### Logo

- SVG/PNG file located at `src/shared/assets/logo-hersa.svg`.
- Full variant (with "HERSA" wordmark): use on the login screen and splash screen.
- Icon variant (mortarboard + H only): use in collapsed AppBar and mobile views.
- **Never modify** the logo's proportions or colors in any component.
- Logo background: always `primary.main` or white — never on gold or semantic color backgrounds.

### Typography

```ts
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 600, color: '#0B1F3A' },
  h2: { fontWeight: 600, color: '#0B1F3A' },
  h3: { fontWeight: 500, color: '#0B1F3A' },
  button: { textTransform: 'none', fontWeight: 500 }, // no automatic uppercase
},
```

### ✅ Do / ❌ Don't — Brand

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `hersaTheme` in the root `ThemeProvider` | Hardcode `#0B1F3A` or `#C9A227` inside components |
| `color="primary"` / `color="secondary"` on MUI components | Use `style={{ color: '#...' }}` for brand colors |
| Place the logo on navy or white backgrounds | Place the logo on gold or semantic color backgrounds |
| `Chip` with `color="success/warning/error"` for statuses | Custom-colored badges outside the theme |
| `textTransform: 'none'` on buttons (already set in theme) | Automatic uppercase button text |

---

## Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| UI Framework  | React 19                              |
| Language      | TypeScript (strict)                   |
| Build         | Vite                                  |
| Components    | Material UI (MUI)                     |
| Routing       | React Router                          |
| Server state  | React Query (@tanstack/react-query)   |
| Global state  | Redux Toolkit (only when necessary)   |
| Forms         | react-hook-form                       |
| HTTP Client   | axios (centralized instance)          |
| Linting       | ESLint + Prettier                     |
| Git hooks     | Husky + lint-staged                   |
| Testing       | React Testing Library                 |
| Auth          | JWT (localStorage)                    |

## Internal Structure

```
frontend/
├── src/
│   ├── api/                      # Axios instance & interceptors
│   ├── shared/
│   │   ├── components/           # Reusable UI components
│   │   ├── hooks/                # Reusable custom hooks
│   │   ├── contexts/             # Global contexts (Auth, Theme…)
│   │   ├── helpers/              # Shared business logic (Hersa domain)
│   │   ├── utils/                # Shared code utilities (generic, domain-agnostic)
│   │   └── types/                # Shared TypeScript types/interfaces
│   ├── features/
│   │   └── <feature-name>/       # kebab-case folder
│   │       ├── api/
│   │       │   ├── get<n>Query.ts
│   │       │   └── <method><n>Mutation.ts
│   │       ├── components/       # PascalCase files
│   │       ├── hooks/            # camelCase files
│   │       ├── helpers/          # Business logic for this feature (camelCase files)
│   │       ├── utils/            # Code utilities for this feature (camelCase files)
│   │       ├── types.ts
│   │       └── index.ts          # Public exports for this feature
│   ├── pages/                    # One file per route
│   ├── router/                   # React Router configuration
│   ├── store/                    # Redux Toolkit store & slices
│   └── main.tsx
├── tests/
│   └── utils/                    # renderWithProviders & shared helpers
├── .husky/
└── vite.config.ts                # Alias configuration
```

## Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*":         ["./src/*"],
      "@shared/*":   ["./src/shared/*"],
      "@features/*": ["./src/features/*"],
      "@pages/*":    ["./src/pages/*"],
      "@store/*":    ["./src/store/*"],
      "@api/*":      ["./src/api/*"]
    }
  }
}
```

Mirror the same aliases in `vite.config.ts` under `resolve.alias`.  
**Never use deep relative imports** (`../../../`).

## Helpers vs Utils

Every feature (and `shared/`) has two folders for auxiliary logic. The distinction is mandatory:

| Folder | Contains | Rule |
|--------|----------|------|
| `helpers/` | **Business logic** — Hersa domain rules | References domain types, pricing rules, status transitions, or Hersa-specific concepts |
| `utils/` | **Code utilities** — generic, reusable anywhere | Could be copy-pasted to any other project unchanged |

```typescript
// helpers/calculatePackageTotal.ts — knows about Hersa domain
export function calculatePackageTotal(booking: Booking): number { ... }
export function getEventStatusLabel(status: EventStatus): string { ... }
export function buildTogaSizeLabel(height: number): string { ... }

// utils/formatDate.ts — generic, domain-agnostic
export function formatDate(iso: string, locale?: string): string { ... }
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> { ... }
export function clamp(value: number, min: number, max: number): number { ... }
```

- Components and hooks call helpers; helpers may call utils — never the reverse
- If a helper grows complex enough to need a hook (e.g. it fetches data), extract it to `hooks/`
- Promote to `shared/helpers/` or `shared/utils/` only when used in more than one feature

## TypeScript Conventions

- `strict: true` — never use `any`; use `unknown` + narrowing when the shape is truly unknown.
- Component props typed with `interface`, not `type`.
- Named exports by default; default export only for pages and layouts.
- Components as `function` declarations, not top-level arrow functions.
- Components must stay under **300 lines** — extract hooks or subcomponents if exceeded.
- Never use array indices as `key` in lists.

## Import Order

```typescript
// 1. React
import React, { useContext, useState } from 'react';
// 2. Third-party (alphabetical within the group)
import { useQuery } from '@tanstack/react-query';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// 3. Internal aliases
import { AuthContext } from '@shared/contexts/AuthContext';
import { UserCard } from '@shared/components/UserCard';
import { fetchUser } from './api/userQueries';
```

## HTTP Client (axios)

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

## Authentication (JWT)

- Tokens in `localStorage`: keys `accessToken` and `refreshToken`.
- The axios interceptor attaches the token automatically — never attach per-request manually.
- On 401: attempt a silent refresh with `refreshToken`; if it fails, redirect to login.
- Auth state (user info, isAuthenticated) lives in `AuthContext` — **not in Redux**.

## State Management Decision Tree

```
Need to share state?
├── Small / medium scope      → useContext + Context API
├── Complex global state      → Redux Toolkit
└── Server / async data       → React Query (always preferred for API data)
```

## React Query — File Conventions

Each file exports a single hook. Files live in `features/<feature>/api/`:

```typescript
// features/rooms/api/getRoomsQuery.ts
export const getRoomsQuery = () =>
  useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/rooms/');
      return data;
    },
  });
```

## Types

- Each feature has its own `types.ts` at the feature root.
- Types shared across features go in `src/shared/types/`.
- All API response shapes must be typed in camelCase (the interceptor handles transformation).

```typescript
// features/rooms/types.ts
export interface Room {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}
```

## Forms

- Always use `react-hook-form` for form state and validation.
- Integrate with MUI using the `Controller` component.

## Testing

- Use `renderWithProviders` from `tests/utils/` — never repeat setup boilerplate across files.
- Test behavior, not implementation — query by role, label, and text.
- Mock API calls at the axios instance level or with `msw` (Mock Service Worker).

## Commands

```bash
# Run on the HOST (node_modules lives here, not in Docker)
npm run dev          # Vite dev server (process runs inside the container)
npm run build        # production build
npm run lint         # ESLint
npm run lint:fix     # auto-fix lint errors
npm run format       # Prettier

# Install a dependency (no Docker rebuild needed)
npm install <package>
```

## ✅ Do / ❌ Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| React Query for server state | `useState` + `useEffect` for API calls |
| axios via the shared instance | Native `fetch` |
| Transform data via interceptors | Manually convert casing per request |
| JWT in `localStorage` via interceptor | Attach tokens manually per call |
| `react-hook-form` for forms | Ad-hoc or uncontrolled form state |
| Path aliases | Deep relative imports (`../../../`) |
| Components under 300 lines | Large monolithic components |
| `useContext` for shared UI/auth state | Redux for simple shared state |
| `get<n>Query.ts` for queries | Mix query and mutation logic in one file |
| `<method><n>Mutation.ts` for mutations | Generic names like `roomApi.ts` |
| `types.ts` per feature | Types scattered across component files |
| Export from feature `index.ts` | Import directly from internal feature files |
| `import Grid2 from '@mui/material/Grid2'` — use `size={{ xs, sm, md }}` prop | Legacy `Grid` from `@mui/material` with `item`/`xs`/`sm`/`md` as separate props |
