# API Layer

## Generated types (`generated/`)

`schema.ts` is auto-generated from the backend OpenAPI spec (`schema.yml` at the
monorepo root). It is **git-ignored** — never commit it.

### When to regenerate

Run this command after any backend change that affects models, serializers, or views:

```bash
# from frontend/
npm run generate:types
```

CI must run this step before `tsc` so the type-check sees a fresh schema.

### How to import

Always import from the stable re-export, never from `schema.ts` directly:

```typescript
import type { components } from "@api/generated/types";

type UserMe = components["schemas"]["UserMe"];
```

### camelCase vs. snake_case

The backend schema uses **snake_case** (e.g. `first_name`, `last_name`).
The axios interceptor in `client.ts` converts every response to **camelCase**
before React Query or any consumer sees the data.

This means two things:

1. The generated types reflect the raw schema (snake_case).
2. At runtime, the data you receive is camelCase.

**Pattern to bridge the gap:** define a feature-level camelCase interface in the
feature's `types.ts` that mirrors the generated schema type, or use a mapped
utility type. Example in `modules/auth/types.ts`.
