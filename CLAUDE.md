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

## Global Rules

- Never commit `.env`. Keep `.env.example` updated whenever a new variable is added.
- Commit format: `type(scope): description` — e.g. `feat(auth): add JWT refresh token`.
- English for all code, comments, commits, and internal documentation.
- Keep always the CLAUDE.md updated with any new conventions or architectural decisions.
- Never delete CLAUDE.md


## Git Hooks (Husky + lint-staged)

- **Pre-commit frontend**: ESLint + Prettier + TypeScript type-check.
- **Pre-commit backend**: ruff + mypy.

## Docker (local development)

```bash
docker compose up                                                    # start everything
docker compose exec backend pipenv run python manage.py migrate     # run migrations
docker compose exec backend pipenv run pytest                       # run backend tests
```

## Knowledge Files

These files in `.claude/skills/` extend these docs. Read them when indicated — they are not loaded automatically.

| File | Read when |
|------|-----------|
| `.claude/skills/workflow.md` | Starting any non-trivial feature; orchestrating multiple agents |
| `.claude/skills/api-contract.md` | Implementing or reviewing any endpoint (`django-developer`, `react-developer`, `tdd-writer`) |
| `.claude/skills/error-handling.md` | Writing views, serializers, or React components that handle API responses |
| `.claude/skills/security-checklist.md` | `security-auditor` always; any auth or data-sensitive module |
