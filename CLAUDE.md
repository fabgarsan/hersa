# my-project

## Business Context

**Hersa** is an education-sector company specializing in end-to-end graduation event services for schools and educational institutions.

**Core services:**
- Photography: pre-graduation photo shoots and ceremony-day coverage
- Full graduation day logistics management
- Graduation packages: photos, pre-graduation dinners and parties for students and teachers
- Academic gown (toga) rental and sales
- Auditorium booking and management
- Masters of ceremony
- Graduation attire and accessories
- Diplomas

**Clients:** Schools/institutions (B2B) and graduating students (B2C).

**Brand colors:**
- Navy blue (primary)
- Gold / yellow (accent)
- White and black (supporting)

---

Monorepo: React 19 (TypeScript) frontend + Django (Python) backend. Deployed on AWS.

## Structure

```
my-project/
├── frontend/   # React 19 + TypeScript + Vite + ESLint + Prettier + MUI
├── backend/    # Django + DRF + SimpleJWT + Pipenv + Gunicorn
└── docker-compose.yml
```

## AWS Infrastructure

| Resource  | Service                                              |
|-----------|------------------------------------------------------|
| Frontend  | S3 static website hosting (CloudFront — pending approval) |
| Backend   | Elastic Beanstalk                                    |
| Database  | RDS PostgreSQL                                       |

- Frontend and backend are deployed **independently** despite living in the same repo.
- Backend secrets: set as EB environment properties — never hardcoded.
- Frontend env vars: `VITE_` prefix, injected at build time via `frontend/.env.production`.

### Frontend deploy

```bash
./frontend/scripts/cf-deploy.sh
```

- Reads `frontend/.env.production` — requires `S3_BUCKET`, `VITE_API_BASE_URL`.
- `CLOUDFRONT_DISTRIBUTION_ID` is optional: if set, invalidates the CDN after upload.
- S3 bucket must have **static website hosting** enabled with error document `index.html` (required for React Router).
- Hashed assets (`dist/assets/`) are uploaded with `max-age=31536000,immutable`; `index.html` with `no-cache`.

## Global Rules

- Never commit `.env`. Keep `.env.example` updated whenever a new variable is added.
- Commit format: `type(scope): description` — e.g. `feat(auth): add JWT refresh token`.
- English for all code, comments, commits, and internal documentation.
- Keep always the CLAUDE.md updated with any new conventions or architectural decisions.
- Never delete CLAUDE.md

## Naming Conventions

### Backend

| Element     | Convention              | Example                             |
|-------------|-------------------------|-------------------------------------|
| Models      | `PascalCase`            | `BookingRequest`, `UserProfile`     |
| Vars / fns  | `snake_case`            | `get_active_rooms`, `user_id`       |
| Serializers | `<Model>Serializer`     | `RoomSerializer`                    |
| Views       | `<Resource>View`        | `RoomView`, `BookingListView`       |
| URL patterns| `kebab-case`            | `/api/booking-requests/`            |

### Frontend

| Element             | Convention               | Example                               |
|---------------------|--------------------------|---------------------------------------|
| Component files     | `PascalCase`             | `UserCard.tsx`, `AuthModal.tsx`       |
| Hook files          | `camelCase`              | `useAuth.ts`, `useRoomFilters.ts`     |
| Util / helper files | `camelCase`              | `formatDate.ts`, `buildQueryParams.ts`|
| Feature folders     | `kebab-case`             | `user-profile/`, `booking-flow/`      |
| RQ queries          | `get<n>Query.ts`         | `getRoomsQuery.ts`                    |
| RQ mutations        | `<method><n>Mutation.ts` | `createRoomMutation.ts`               |
| Types per feature   | `types.ts`               | `features/rooms/types.ts`             |
| Component styles    | `<ComponentName>.module.scss` | `UserCard.module.scss`, `AuthModal.module.scss` |

## Git Hooks (Husky + lint-staged)

- **Pre-commit frontend**: ESLint + Prettier + TypeScript type-check.
- **Pre-commit backend**: ruff + mypy.

```json
// package.json (root or frontend/)
{
  "lint-staged": {
    "frontend/src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## Docker (local development)

```bash
docker compose up                                                    # start everything
docker compose exec backend pipenv run python manage.py migrate     # run migrations
docker compose exec backend pipenv run pytest                       # run backend tests
cd frontend && npm run lint                                          # lint frontend
```

### Installing dependencies

**Frontend** — `node_modules` lives on the HOST, not inside the container. Install from the `frontend/` folder on the host:

```bash
cd frontend
npm install <package>          # add a runtime dependency
npm install -D <package>       # add a dev dependency
# The running container picks up changes via the volume mount — no rebuild needed.
docker compose exec frontend npm install   # sync node_modules inside the container if needed
```

**Backend** — Pipenv manages the virtualenv inside the container image. After editing `Pipfile`:

```bash
cd backend
pipenv install <package>       # add a runtime dependency (updates Pipfile + Pipfile.lock)
pipenv install --dev <package> # add a dev dependency
docker compose build backend   # rebuild the image to bake the new package in
docker compose up -d backend   # restart with the new image
```

- PyCharm interpreter → backend container, path: `/app/.venv/bin/python`

## Additional Context Files

- @backend/docs/architecture.md *(create when available)*
- @frontend/docs/architecture.md *(create when available)*
