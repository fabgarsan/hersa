# Hersa

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

- Never commit `.env`.
- Keep `.env.example` updated whenever a new variable is added.
- Commit format: `type(scope): description` — e.g. `feat(auth): add JWT refresh token`.
- English for all code, comments, commits, and internal documentation.
- Keep always the CLAUDE.md updated with any new conventions or architectural decisions.
- Never delete CLAUDE.md


## Do Not Touch

- `*/migrations/*.py` — never modify existing migration files; always create new ones with `makemigrations`.
- `.env` / `.env.production` — never commit; use `.env.example` as the committed template.
- `frontend/dist/` and `backend/staticfiles/` — generated artifacts; never edit manually.
- `.ebextensions/` and `.platform/` — AWS EB infrastructure config; only change with explicit infrastructure intent.
- `Pipfile.lock` — never manually edit; managed by `pipenv`.

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

These files extend these docs. Read them when indicated — they are not loaded automatically.

| File | Read when |
|------|-----------|
| `.claude/shared/hersa-context.md` | Designing data models, implementing business logic, or working on any of the system modules |
| `.claude/skills/workflow.md` | Starting any non-trivial feature; orchestrating multiple agents |
| `.claude/skills/api-contract.md` | Implementing or reviewing any endpoint (`django-developer`, `react-developer`, `tdd-writer`) |
| `.claude/skills/error-handling.md` | Writing views, serializers, or React components that handle API responses |
| `.claude/skills/security-checklist.md` | `security-auditor` always; any auth or data-sensitive module |
| `.claude/skills/backend-conventions.md` | Creating Django models, views, serializers, or scaffolding a new app |
| `.claude/skills/theme-tokens.md` | Defining or applying Hersa brand colors, typography, or logo rules |
| `.claude/skills/mui-conventions.md` | Choosing MUI components, using Grid2, or wiring up RHF forms |
| `.claude/skills/react-conventions.md` | Writing axios interceptors, React Query hooks, or managing auth/state |

## Agent Registry

| Agent | Scope | When to use |
|---|---|---|
| `pm-discovery` | Discovery interview before writing any document | First step for any new feature idea |
| `prd-writer` | PRD generation from feature description | After discovery; before architect or tdd-writer |
| `architect` | Architecture design for complex features | After PRD; before tdd-writer; when unsure how to structure a module |
| `tdd-writer` | TDD generation from approved PRD | After PRD is approved; before any code is written |
| `adr-writer` | Documents non-obvious architectural decisions as ADRs | After choosing between significant technical approaches |
| `django-developer` | All backend work: models, migrations, serializers, views, URLs | Any Python/Django task |
| `react-developer` | All frontend work: pages, components, hooks, API integration | Any React/TypeScript/MUI task |
| `test-writer` | Tests for existing code (pytest-django + RTL) | After implementing any feature |
| `code-reviewer` | Read-only post-implementation review | After completing a feature or before committing |
| `security-auditor` | Read-only security audit | Before deploying; after auth or sensitive-data work |
| `docs-writer` | Docstrings, CLAUDE.md updates, API endpoint docs | After completing a module or before a release |
| `component-factory` | Generate new agents and skills under `.claude/` | "scaffold/create/generate an agent or skill" |
| `claude-md-architect` | Interview-driven CLAUDE.md generation and migration | "set up CLAUDE.md", "bootstrap this repo", "migrate my CLAUDE.md" |
| `aws-devops` | AWS infrastructure: EB, RDS, S3, CloudFront, CI/CD, secrets | Any deployment, infra config, or AWS resource management task |
| `ethical-hacker` | Penetration testing, OWASP, API/network/cloud/OSINT security, CTF | Authorized pentests, CTF challenges, security research, red-team exercises |
| `process-analyst` | As-is documentation of existing business processes | When documenting how a process works today, before any improvement or redesign |
| `process-optimizer` | Lean-based to-be process optimization from a complete as-is document | After `process-analyst` produces a clean as-is (zero unresolved ambiguities); before implementation planning |
| `systems-analyst` | Translate a complete to-be process into functional specifications: epics, user stories, AC, data entities, API contracts | After `process-optimizer` produces a clean to-be (zero unresolved `[NECESITA CONTEXTO]` items); before any implementation begins |
| `pm-writer` | Translate a technical specification into a non-technical executive PM document with MoSCoW prioritization and BLOCKER guard | After `systems-analyst` produces a clean technical spec (zero unresolved `[BLOCKER]` items); before `prd-writer` is invoked |
| `senior-ceo-advisor` | Strategic executive advisory for Hersa business decisions; pipeline sanity-checks from a business lens | Any strategic, commercial, operational, or prioritization decision; at any point in the pipeline to validate business realism |

## Skill Registry

| Skill | Trigger | Purpose |
|---|---|---|
| `agent-scaffold` | Used by `component-factory` after reuse approval | Renders a new `.claude/agents/<n>.md` |
| `skill-scaffold` | Used by `component-factory` after reuse approval | Renders a new `.claude/skills/<n>/` directory |
| `reuse-checker` | Used by `component-factory` before generation | Decides NEW vs EXTEND vs INLINE |
| `component-linter` | Used by `component-factory` after generation | Structural validation against architecture rules |
| `claude-md-linter` | Used by `claude-md-architect`, or directly in CI | Validates CLAUDE.md against architecture guide §1.1–§1.5 |
| `pipeline-conventions` | Used by all document-pipeline agents | Shared pre-flight validation, operating rules, and blocking tag vocabulary for the process pipeline |

## Conventions for Agents and Skills

- Architecture rules: see `@documentation/claude-code-architecture-guide.md` (do not duplicate here)
- Naming: agents are `kebab-case` verb-noun; skills are `kebab-case` noun
- Every agent/skill MUST declare both `when_to_use` and `when_not_to_use`
- Tool grants follow least-privilege; >5 tools requires per-tool justification
- I/O between components MUST use file paths, never inline content >50 lines
- New components MUST pass `component-linter` before being merged
- CLAUDE.md MUST pass `claude-md-linter` before being merged

## Workflows

**To bootstrap a new project's CLAUDE.md:**
> "Use claude-md-architect to set up CLAUDE.md for this project."

**To migrate a messy CLAUDE.md:**
> "Use claude-md-architect to migrate my CLAUDE.md to the architecture-guide format."

**To create a new agent or skill:**
> "Use component-factory to scaffold a [skill|agent] that [capability]."

**To audit CLAUDE.md health (e.g., in CI):**
> Run `claude-md-linter` directly on the file.
