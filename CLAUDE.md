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
| `.claude/shared/hersa-context.md` | Understanding what Hersa is, its services portfolio, or its B2B/B2C business model |
| `.claude/shared/hersa-process.md` | Designing data models, implementing business logic, writing migrations, or working on any system module — this is the operational reference (Promotion model, all roles, stages, business rules, entity relationships, domain constraints) |
| `.claude/skills/workflow.md` | Starting any non-trivial feature; orchestrating multiple agents |
| `.claude/skills/api-contract.md` | Implementing or reviewing any endpoint (`django-developer`, `react-developer`, `tdd-writer`) |
| `.claude/skills/error-handling.md` | Writing views, serializers, or React components that handle API responses |
| `.claude/skills/security-checklist.md` | `security-auditor` always; any auth or data-sensitive module |
| `.claude/skills/backend-conventions.md` | Creating Django models, views, serializers, or scaffolding a new app |
| `.claude/skills/theme-tokens.md` | Defining or applying Hersa brand colors, typography, or logo rules |
| `.claude/skills/mui-conventions.md` | Choosing MUI components, using Grid2, or wiring up RHF forms |
| `.claude/skills/react-conventions.md` | Writing axios interceptors, React Query hooks, or managing auth/state |
| `.claude/skills/pipeline-flows/SKILL.md` | Starting any non-trivial work; picking which pipeline flow (A–I) to use |
| `documentation/brand/brand-manual.md` | Designing any UI screen or component for Hersa — ui-designer must read before producing any ui-spec |
| `documentation/brand/tone-of-voice.md` | Writing any external-facing document — communications-writer must read before producing proposals, memos, or briefs |
| `documentation/brand/digital-guidelines.md` | Implementing or reviewing the React visual theme — react-developer and ui-designer read this before any visual implementation |

## Agent Registry

| Agent | Scope | When to use |
|---|---|---|
| `pm-discovery` | Discovery interview for new features without a prior process pipeline | New feature idea with no prior `process-analyst` pipeline; skip if the full process pipeline already ran — go directly to `prd-writer` |
| `prd-writer` | PRD generation from confirmed pm-writer document (full pipeline) or pm-discovery brief (short path) | After `pm-writer` approves the functional spec (full pipeline) OR after `pm-discovery` produces a brief (short path); before `tdd-writer` |
| `tdd-writer` | TDD generation from approved PRD | After PRD is approved; before any code is written |
| `adr-writer` | Documents non-obvious architectural decisions as ADRs | After choosing between significant technical approaches |
| `django-developer` | All backend work: models, migrations, serializers, views, URLs | Any Python/Django task |
| `react-developer` | All frontend work: pages, components, hooks, API integration | Any React/TypeScript/MUI task |
| `test-writer` | Tests for existing code (pytest-django + RTL) | After implementing any feature |
| `code-reviewer` | Read-only post-implementation review | After completing a feature or before committing |
| `security-auditor` | Read-only security audit | Before deploying; after auth or sensitive-data work |
| `release-manager` | Pre-merge quality gate: orchestrates code review, security audit, and docs check before any PR merges to main | Before merging any non-trivial PR to `main`; final gate in Flows A and B before `aws-devops` |
| `docs-writer` | Docstrings, API endpoint docs | After completing a module or before a release |
| `component-factory` | Generate new agents and skills under `.claude/` | "scaffold/create/generate an agent or skill" |
| `claude-md-architect` | Interview-driven CLAUDE.md generation and migration | "set up CLAUDE.md", "bootstrap this repo", "migrate my CLAUDE.md" |
| `aws-devops` | AWS infrastructure: EB, RDS, S3, CloudFront, CI/CD, secrets | Any deployment, infra config, or AWS resource management task |
| `process-analyst` | As-is documentation of existing business processes | When documenting how a process works today, before any improvement or redesign |
| `process-optimizer` | Lean-based to-be process optimization from a complete as-is document | After `process-analyst` produces a clean as-is (zero unresolved ambiguities); before implementation planning |
| `systems-analyst` | Translate a complete to-be process into functional specifications: epics, user stories, AC, data entities, API contracts | After `process-optimizer` produces a clean to-be (zero unresolved `[NECESITA CONTEXTO]` items); before any implementation begins |
| `pm-writer` | Translate a technical specification into a non-technical executive PM document with MoSCoW prioritization and BLOCKER guard | After `systems-analyst` produces a clean technical spec (zero unresolved `[BLOCKER]` items); before `prd-writer` is invoked |
| `senior-ceo-advisor` | Strategic executive advisory for Hersa business decisions; pipeline sanity-checks from a business lens | Any strategic, commercial, operational, or prioritization decision; at any point in the pipeline to validate business realism |
| `engineering-manager` | Engineering team diagnosis: roles, processes, gaps, hiring, and agent pipeline integration | When analyzing team structure or processes, making hiring decisions, or defining how pipeline agents integrate with the dev team |
| `brand-designer` | Brand identity system: strategy, visual identity manual, tone of voice, and digital guidelines — the brand foundation that ui-designer and communications-writer build on | Before any UI design work begins; when brand guidelines are missing or inconsistent; when launching a new digital product |
| `ux-designer` | User flows, navigation, information hierarchy, screen structure, friction analysis, and text wireframes for any Hersa feature | After `systems-analyst` produces a clean spec (zero `[BLOCKER]` tags); before any visual design or frontend implementation begins |
| `ui-designer` | Visual design specification: design tokens, component inventory, per-screen layout, accessibility guide, and MUI implementation notes | After `ux-designer` produces a clean `ux-spec.md` (zero unresolved `[FRICCIÓN ALTA]` items); before `react-developer` begins implementation |

## Extra-Pipeline Agents

These agents are available but do not participate in the standard feature pipeline. Invoke them explicitly for their specific purpose.

| Agent | Scope | When to use |
|---|---|---|
| `ethical-hacker` | Penetration testing, OWASP, API/network/cloud/OSINT security, CTF | Authorized pentests, CTF challenges, security research, red-team exercises |
| `communications-writer` | Transforms internal artifacts (diagnostics, specs, reports, process documents, strategic recommendations) into polished stakeholder communications: slide decks, executive memos, service proposals, and briefs | After any pipeline agent produces an artifact that must be communicated externally — school directors, parents, students, internal board, or investors |

## Skill Registry

| Skill | Trigger | Purpose |
|---|---|---|
| `agent-scaffold` | Used by `component-factory` after reuse approval | Renders a new `.claude/agents/<n>.md` |
| `skill-scaffold` | Used by `component-factory` after reuse approval | Renders a new `.claude/skills/<n>/` directory |
| `reuse-checker` | Used by `component-factory` before generation | Decides NEW vs EXTEND vs INLINE |
| `component-linter` | Used by `component-factory` after generation | Structural validation against architecture rules |
| `claude-md-linter` | Used by `claude-md-architect`, or directly in CI | Validates CLAUDE.md against architecture guide §1.1–§1.5 |
| `pipeline-conventions` | Used by all document-pipeline agents | Shared pre-flight validation, operating rules, and blocking tag vocabulary for the process pipeline |
| `pipeline-flows` | Starting any non-trivial work to pick the correct flow (A–I) | Canonical catalogue of 9 configurable pipeline flows with entry/exit/sequence |
| `pipeline-runner` | When the user says "execute Flow X from agent Y to agent Z" | Generates ordered invocation sequence from pipeline-flows catalogue |
| `developer-conventions` | Used by `django-developer`, `react-developer`, `tdd-writer`, `test-writer` | Shared operating rules for all implementation agents |
| `review-conventions` | Used by `code-reviewer`, `security-auditor` | Shared severity scale, output format, and read-only discipline |
| `pipeline-trace-linter` | After `tdd-writer` produces a TDD; before implementation begins | Cross-document consistency validator: spec → PRD → TDD |

## Conventions for Agents and Skills

- Architecture rules: see `@documentation/claude-code-architecture-guide.md` (do not duplicate here)
- Naming: agents are `kebab-case` verb-noun; skills are `kebab-case` noun
- Every agent/skill MUST declare both `when_to_use` and `when_not_to_use`
- Tool grants follow least-privilege; >5 tools requires per-tool justification
- I/O between components MUST use file paths, never inline content >50 lines
- New components MUST pass `component-linter` before being merged
- CLAUDE.md MUST pass `claude-md-linter` before being merged
- Every agent MUST declare an explicit `model:` field in frontmatter. Without it the agent inherits the session default — unpredictable cost and quality.

## Workflows

### Gestión de CLAUDE.md y componentes

**Bootstrap o migración de CLAUDE.md:**
> "Use claude-md-architect to set up CLAUDE.md for this project."

**Migrar un CLAUDE.md desordenado:**
> "Use claude-md-architect to migrate my CLAUDE.md to the architecture-guide format."

**Crear un agente o skill nuevo:**
> "Use component-factory to scaffold a [skill|agent] that [capability]."

**Auditar el CLAUDE.md (e.g., en CI):**
> Run `claude-md-linter` directly on the file.

---

### Pipeline de implementación

Referencia completa: `.claude/skills/workflow.md` y `.claude/skills/pipeline-flows/SKILL.md`

Usa el primer flujo que aplique:

| Situación | Flujo |
|-----------|-------|
| Algo roto en producción, sin nueva migración ni endpoint | **Flujo D (Bug fix)** → implementador → `test-writer` → `code-reviewer` |
| Cambio en una sola superficie, sin nuevos modelos ni endpoints | **Flujo E (Lightweight)** → implementador → `code-reviewer` |
| Ticket Linear con AC claros | **Flujo C (Ticket)** → `/start-task` → implementadores → `test-writer` → `/pr-create` |
| Feature nueva con ambas superficies o nuevo modelo de dominio | **Flujo A o B** — ver `pipeline-flows` |

**Para ejecutar un flujo configurado:**
> "Use pipeline-runner to execute Flow [A–I] for [description]."

---

### Pipeline de análisis de negocio (proceso → especificación)

Punto de entrada: cuando se quiere analizar, mejorar, o especificar un proceso antes de implementar.

```
0. brand-designer      → brand strategy + visual system + tone of voice
                         [HSTOP: validar brand strategy antes de continuar]

1. process-analyst     → as-is document
                         [HSTOP: usuario confirma antes del siguiente paso]

2. process-optimizer   → to-be document
                         [HSTOP: resolver [NECESITA CONTEXTO] antes de continuar]

3. systems-analyst     → functional spec (hersa-especificaciones-funcionales.md)
                         [HSTOP: resolver [BLOCKER] antes de continuar]

4. pm-writer           → executive PM document   [HSTOP: aprobación — hard stop]

5. ux-designer         → ux-spec
                         [HSTOP: resolver [FRICCIÓN ALTA] antes de continuar]

6. ui-designer         → ui-spec

7. prd-writer          → PRD                     [HSTOP: usuario aprueba — hard stop]

8. → continuar con Flujo A o B para ingeniería
```

**Puntos de entrada configurables:**

| Punto de entrada | Cuándo usarlo |
|---|---|
| `process-analyst` (paso 1) | Proceso no documentado; se empieza desde cero |
| `systems-analyst` (paso 3) | to-be limpio ya existe; se necesita spec funcional |
| `prd-writer` (paso 7) | Spec funcional aprobada; se necesita PRD formal |
| `tdd-writer` directamente | PRD aprobado; saltar directo a diseño técnico |

---

### Gates disponibles en cualquier punto del pipeline

- `senior-ceo-advisor` → valida realismo de negocio (pre-discovery, post-spec, pre-deploy)
- `engineering-manager` → sanity-check técnico y de equipo antes de implementación
- `release-manager` → gate pre-merge obligatorio para PRs a `main`
- `security-auditor` → revisión de seguridad antes de cualquier deploy con auth/PII/pagos
