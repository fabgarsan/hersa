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

## Load on demand

| When you are... | Load |
|-----------------|------|
| Implementing an API integration | `.claude/shared/conventions/api-contract.md` |
| Handling loading / error / success states | `.claude/shared/conventions/error-handling.md` |

> `theme-tokens.md`, `mui-conventions.md`, `react-conventions.md` are path-scoped rules in `.claude/rules/frontend/` — auto-loaded when editing matching files.

## Brand System — load before any visual work

Load `documentation/brand/brand-manual.md` (colors/typography), `digital-guidelines.md` (components), `tone-of-voice.md` (copy) before any visual work.
- Never change `_variables.scss` without updating brand-manual
- Playfair Display: student portal B2C only — see `digital-guidelines.md §3`
- `prefers-reduced-motion` required globally — see `digital-guidelines.md §8`
- Photo backgrounds: `rgba(11, 31, 58, 0.65)` overlay required before any text

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

- Components and hooks call helpers; helpers may call utils — never the reverse. Promote to `shared/` only when used in more than one feature.

## Naming conventions

| Element              | Convention                    | Example                                 |
|----------------------|-------------------------------|-----------------------------------------|
| Component files      | `PascalCase`                  | `UserCard.tsx`, `AuthModal.tsx`         |
| Hook files           | `camelCase`                   | `useAuth.ts`, `useRoomFilters.ts`       |
| Util / helper files  | `camelCase`                   | `formatDate.ts`, `buildQueryParams.ts`  |
| Feature folders      | `kebab-case`                  | `user-profile/`, `booking-flow/`        |
| RQ queries           | `get<n>Query.ts`              | `getRoomsQuery.ts`                      |
| RQ mutations         | `<method><n>Mutation.ts`      | `createRoomMutation.ts`                 |
| Component props      | `<ComponentName>Props`        | `AppHeaderProps`, `ModuleGuardProps`    |

## Do Not Touch

- `src/shared/styles/_variables.scss` — brand tokens; only the design system owner should modify.
- `vite.config.ts` path aliases — always mirror changes in `tsconfig.json` simultaneously.

## Language

**All user-facing UI text must be in Spanish.** This includes labels, placeholders, button text, headings, error messages, empty states, tooltips, and any other string rendered in the UI. Code identifiers, comments, and internal documentation remain in English.

## Testing

Use `renderWithProviders` from `tests/utils/`. Test behavior (role, label, text), not implementation. Mock APIs at the axios instance level or `msw`.

## Commands

```bash
# Run on the HOST (node_modules lives here, not in Docker)
npm run dev          # Vite dev server (process runs inside the container)
npm run build        # production build
npm run lint         # ESLint
npm run lint:fix     # auto-fix lint errors
npm run format       # Prettier
npm run coverage    # run tests with coverage (coverage/index.html)

# Install a dependency (no Docker rebuild needed)
npm install <package>
npm install -D <package>
```

## Deploy

Run `./scripts/cf-deploy.sh` (requires `S3_BUCKET` and `VITE_API_BASE_URL` in `.env.production`; `CLOUDFRONT_DISTRIBUTION_ID` optional — invalidates CDN). S3 bucket: static hosting with `index.html` error doc; `dist/assets/` → immutable cache, `index.html` → no-cache.
