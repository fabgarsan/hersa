# Hersa

## Business Context

B2B/B2C graduation event company: photography, logistics, toga rental, auditorium, diplomas. Clients: schools (B2B) + graduating students (B2C). Full context: `.claude/shared/hersa-context.md`.

Monorepo: React 19 (TypeScript) frontend + Django (Python) backend. Deployed on AWS.

## Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19 + TypeScript + Vite + ESLint + Prettier + MUI |
| Backend  | Django + DRF + SimpleJWT + Pipenv + Gunicorn |
| Database | PostgreSQL (RDS) |
| Hosting  | S3 (frontend) · Elastic Beanstalk (backend) · RDS (db) |

- Frontend and backend are deployed **independently** despite living in the same repo.
- Backend secrets: set as EB environment properties — never hardcoded.
- Frontend env vars: `VITE_` prefix, injected at build time via `frontend/.env.production`.

## Commands

```bash
docker compose up                                                    # start everything
docker compose exec backend pipenv run python manage.py migrate     # run migrations
docker compose exec backend pipenv run pytest                       # run backend tests (coverage automatic; HTML report → htmlcov/)
docker compose exec backend pipenv install pytest-cov --dev          # first time only
```

Git hooks (Husky + lint-staged):
- **Pre-commit frontend**: ESLint + Prettier + TypeScript type-check.
- **Pre-commit backend**: ruff + mypy.

## Conventions

- MUST use English for all code, comments, commits, and internal documentation.
- MUST follow the commit format `type(scope): description` — e.g. `feat(auth): add JWT refresh token`.
- MUST NEVER commit `.env` files.
- MUST update `.env.example` whenever a new variable is added.
- MUST update CLAUDE.md whenever a new convention, agent, skill, or directory is introduced.
- MUST NEVER delete CLAUDE.md.

## Structure

```
my-project/
├── frontend/   # React 19 + TypeScript + Vite + ESLint + Prettier + MUI
├── backend/    # Django + DRF + SimpleJWT + Pipenv + Gunicorn
└── docker-compose.yml
```

## Do Not Touch

- `*/migrations/*.py` — never modify existing migration files; always create new ones with `makemigrations`.
- `.env` / `.env.production` — never commit; use `.env.example` as the committed template.
- `frontend/dist/` and `backend/staticfiles/` — generated artifacts; never edit manually.
- `.ebextensions/` and `.platform/` — AWS EB infrastructure config; only change with explicit infrastructure intent.
- `Pipfile.lock` — never manually edit; managed by `pipenv`.

## Shared Context Files

Full index with load-when triggers: `.claude/shared/context-index.md`

Key files loaded most often:
- `.claude/shared/hersa-context.md` — business model, services portfolio
- `.claude/shared/hersa-process.md` — domain rules, entities, business logic
- `.claude/shared/pipeline-workflows.md` — flow selection, per-flow procedures, agent handoffs, pipeline gates

## Agent & Skill Registry

Full registry with personas, skills, and slash commands: `.claude/shared/agents-registry.md`

## Conventions for Agents and Skills

- Architecture rules: see `.claude/shared/claude-code-knowledge.md` §9 (do not duplicate here)
- Naming: agents are `kebab-case` verb-noun; skills are `kebab-case` noun
- Every agent/skill MUST declare both `when_to_use` and `when_not_to_use`
- Tool grants follow least-privilege; >5 tools requires per-tool justification
- I/O between components MUST use file paths, never inline content >50 lines
- New components MUST pass `component-linter` before being merged
- CLAUDE.md MUST pass `claude-md-linter` before being merged
- Every agent MUST declare an explicit `model:` field in frontmatter (alias only — `sonnet` / `opus` / `haiku`; never a full model ID like `claude-sonnet-4-6`)

## Workflows

Pipeline orchestration, flow selection, and gate definitions live in `.claude/shared/pipeline-workflows.md`. Load it when starting any non-trivial feature, bug fix, or business analysis.

See `.claude/shared/pipeline-workflows.md` for the complete flow selection table (Flows A–J), per-flow procedures, entry guards, agent handoffs, and hard stops.

## Common Pitfalls

- Skipping `component-linter` after generating a new agent/skill — pre-merge gate.
- Editing migration files instead of creating new ones with `makemigrations`.
- Mixing `sx`/inline styles with SCSS Modules in frontend code (see `.claude/rules/frontend/styling.md`).
- Hardcoding secrets in `.ebextensions/` config — must come from EB environment properties.
- Using a full model ID (e.g. `claude-sonnet-4-6`) in agent frontmatter — use the alias.
