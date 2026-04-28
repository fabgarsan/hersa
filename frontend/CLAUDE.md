# frontend/

React 19 + TypeScript + Vite. Loaded only when Claude works on files inside this directory.

## Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| UI Framework  | React 19                              |
| Language      | TypeScript (strict)                   |
| Build         | Vite                                  |
| Components    | Material UI (MUI v6)                  |
| Routing       | React Router                          |
| Server state  | React Query (@tanstack/react-query)   |
| Global state  | Redux Toolkit (only when necessary)   |
| Forms         | react-hook-form                       |
| HTTP Client   | axios (centralized instance)          |
| Styling       | SCSS Modules (sass)                   |
| Linting       | ESLint + Prettier                     |
| Git hooks     | Husky + lint-staged                   |
| Testing       | React Testing Library                 |
| Auth          | JWT (localStorage)                    |

## Skills — load on demand

| When you are... | Load |
|-----------------|------|
| Defining theme, palette, logo, typography | `.claude/skills/theme-tokens.md` |
| Choosing MUI components, Grid2, forms | `.claude/skills/mui-conventions.md` |
| Writing axios / React Query / auth flow | `.claude/skills/react-conventions.md` |
| Implementing an API integration | `.claude/skills/api-contract.md` |
| Handling loading / error / success states | `.claude/skills/error-handling.md` |

## Brand System — load before any visual work

| When you are... | Load |
|-----------------|------|
| Implementing colors, typography, logo, or photo styling | `documentation/brand/brand-manual.md` |
| Implementing any UI component (contrast, spacing, buttons, overlays, motion) | `documentation/brand/digital-guidelines.md` |
| Writing UI copy, labels, empty states, errors, or notifications | `documentation/brand/tone-of-voice.md` |

**Key brand rules for react-developer:**
- `src/shared/styles/_variables.scss` must stay in sync with `brand-manual.md` — never change tokens without updating the brand doc
- Playfair Display: student portal B2C only, approved screens only — see `digital-guidelines.md §3` for which screens and the implementation snippet
- `prefers-reduced-motion` must be respected globally — see `digital-guidelines.md §8` for the CSS block
- Photo backgrounds require `rgba(11, 31, 58, 0.65)` overlay before placing any text — see `mui-conventions.md` Brand Rules section

## Internal structure

```
frontend/
├── src/
│   ├── api/                      # Axios instance & interceptors
│   ├── shared/
│   │   ├── api/                  # Shared query/mutation hooks (getPermissionsQuery.ts, etc.)
│   │   ├── components/           # Reusable UI components (PascalCase .tsx + .module.scss)
│   │   ├── constants/            # Shared API routes and UI strings
│   │   ├── contexts/             # Global contexts (Auth…)
│   │   ├── hooks/                # Reusable custom hooks
│   │   ├── styles/               # theme.ts + _variables.scss (SCSS brand tokens)
│   │   └── types/                # Shared TypeScript types/interfaces
│   ├── modules/
│   │   └── <module-name>/        # kebab-case folder (auth, profile, admin, etc.)
│   │       ├── constants/        # Module-level API routes and UI strings
│   │       ├── features/
│   │       │   └── <feature>/
│   │       │       ├── api/
│   │       │       │   ├── get<n>Query.ts
│   │       │       │   └── <method><n>Mutation.ts
│   │       │       ├── components/   # PascalCase .tsx + co-located .module.scss
│   │       │       ├── hooks/        # camelCase files
│   │       │       ├── schemas.ts
│   │       │       ├── types.ts
│   │       │       └── index.ts      # Public exports for this feature
│   │       └── index.ts          # Public exports for this module
│   ├── router/                   # React Router configuration
│   └── main.tsx
├── tests/
│   └── utils/                    # renderWithProviders & shared helpers
├── .husky/
└── vite.config.ts                # Alias configuration
```

## Path aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*":        ["./src/*"],
      "@shared/*":  ["./src/shared/*"],
      "@modules/*": ["./src/modules/*"],
      "@api/*":     ["./src/api/*"]
    }
  }
}
```

Mirror the same aliases in `vite.config.ts` under `resolve.alias`. **Never use deep relative imports** (`../../../`).

## Helpers vs utils

Every feature (and `shared/`) has two folders for auxiliary logic. The distinction is mandatory:

| Folder | Contains | Rule |
|--------|----------|------|
| `helpers/` | **Business logic** — Hersa domain rules | References domain types, pricing rules, status transitions, or Hersa-specific concepts |
| `utils/` | **Code utilities** — generic, reusable anywhere | Could be copy-pasted to any other project unchanged |

- Components and hooks call helpers; helpers may call utils — never the reverse.
- If a helper grows complex enough to need a hook (e.g. it fetches data), extract it to `hooks/`.
- Promote to `shared/helpers/` or `shared/utils/` only when used in more than one feature.

## Naming conventions

| Element              | Convention                    | Example                                 |
|----------------------|-------------------------------|-----------------------------------------|
| Component files      | `PascalCase`                  | `UserCard.tsx`, `AuthModal.tsx`         |
| Hook files           | `camelCase`                   | `useAuth.ts`, `useRoomFilters.ts`       |
| Util / helper files  | `camelCase`                   | `formatDate.ts`, `buildQueryParams.ts`  |
| Feature folders      | `kebab-case`                  | `user-profile/`, `booking-flow/`        |
| RQ queries           | `get<n>Query.ts`              | `getRoomsQuery.ts`                      |
| RQ mutations         | `<method><n>Mutation.ts`      | `createRoomMutation.ts`                 |
| Types per feature    | `types.ts`                    | `features/rooms/types.ts`               |
| Component props      | `<ComponentName>Props`        | `AppHeaderProps`, `ModuleGuardProps`    |
| Hook return types    | `Use<HookName>Return`         | `UseAuthReturn`, `UsePermissionsReturn` |
| Component styles     | `<ComponentName>.module.scss` | `UserCard.module.scss`                  |

## TypeScript rules

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

## Styling — SCSS Modules

**Rule: every component file must have a co-located CSS Module.**

| Component file | Style file |
|----------------|------------|
| `NavSidebar.tsx` | `NavSidebar.module.scss` |
| `ProfilePage.tsx` | `ProfilePage.module.scss` |

- Never use MUI's `sx` prop. Use `className={styles.xxx}` from the co-located SCSS module.
- Never use inline `style={{ ... }}` objects.
- Import shared brand tokens: `@use '@/shared/styles/variables' as v;` (or via relative path).
- All brand colors and layout constants live in `src/shared/styles/_variables.scss`.
- Use `:global(.MuiComponent-class)` inside a module class to target MUI internals.
- `@emotion/cache` is configured with `prepend: true` in `main.tsx` so compiled SCSS always wins the specificity battle against MUI's Emotion styles.

```scss
// NavSidebar.module.scss
@use '../styles/variables' as v;

.root { background-color: v.$primary-dark; }
.navItemActive { color: v.$secondary-main; border-left: 3px solid v.$secondary-main; }
```

```tsx
// NavSidebar.tsx
import styles from './NavSidebar.module.scss';
<Box className={styles.root}>
  <ListItemButton className={active ? styles.navItemActive : styles.navItem}>
```

## Do Not Touch

- `dist/` — generated by `npm run build`; never edit manually.
- `node_modules/` — managed by npm; never edit manually.
- `src/shared/styles/_variables.scss` — brand tokens; only the design system owner should modify.
- `vite.config.ts` path aliases — mirror changes in `tsconfig.json` simultaneously or they will diverge.

## Language

**All user-facing UI text must be in Spanish.** This includes labels, placeholders, button text, headings, error messages, empty states, tooltips, and any other string rendered in the UI. Code identifiers, comments, and internal documentation remain in English.

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
npm run coverage    # run tests with coverage (coverage/index.html)
# First-time setup: npm install

# Install a dependency (no Docker rebuild needed)
npm install <package>
npm install -D <package>
```

## Deploy

```bash
./scripts/cf-deploy.sh
```

- Requires `S3_BUCKET` and `VITE_API_BASE_URL` in `.env.production`.
- `CLOUDFRONT_DISTRIBUTION_ID` optional — if set, invalidates the CDN after upload.
- S3 bucket must have static website hosting with error document `index.html` (required for React Router).
- `dist/assets/` → `max-age=31536000,immutable`; `index.html` → `no-cache`.
