# Agent & Skill Registry

## Persona Convention

Pipeline / process agents (document producers and one-shot orchestrators) stay anonymous — they are tools, not characters. Persona names are reserved for agents the team calls by name in conversation: developers, advisors, designers, and recurring reviewers.

| Has persona | Anonymous (`—`) |
|---|---|
| Developers, reviewers, advisors, designers | Document pipeline (`pm-*`, `prd-*`, `tdd-*`, `process-*`, `systems-analyst`, `adr-writer`, `docs-writer`, `release-manager`, `test-writer`) |

When adding a new agent, decide which bucket it falls into and either set `persona:` in its frontmatter or leave the registry row as `—`.

## Agents

| Agent | Nombre | When to use |
|---|---|---|
| `django-developer` | Chao | Any Python/Django task |
| `react-developer` | Manuel | Any React/TypeScript/MUI task |
| `test-writer` | — | After implementing any feature |
| `tdd-writer` | — | After PRD approved; before coding |
| `prd-writer` | — | After pm-writer or pm-discovery brief |
| `pm-discovery` | — | New feature, no prior pipeline |
| `pm-writer` | — | After systems-analyst spec |
| `code-reviewer` | Melba | After feature complete or before commit |
| `security-auditor` | Vigi | Before deploy; after auth/PII work |
| `release-manager` | — | Before merging to `main` |
| `qa-engineer` | Maria | After PRD; before release-manager |
| `docs-writer` | — | After module complete or before release |
| `adr-writer` | — | After a significant technical decision |
| `process-analyst` | — | Documenting an existing process |
| `process-optimizer` | — | After clean as-is document |
| `systems-analyst` | — | After clean to-be document |
| `aws-devops` | Jairito | Any deploy or AWS infra task |
| `component-factory` | Dios | Scaffold a new agent or skill |
| `claude-md-architect` | Jesus | Bootstrap or migrate CLAUDE.md |
| `cc-config-auditor` | Marco | Full Claude Code config audit + improvement roadmap |
| `senior-ceo-advisor` | Fran | Any strategic or commercial decision |
| `engineering-manager` | Alex | Team structure or hiring decisions |
| `data-analyst` | Paolo | Pre-commercial decisions; demand forecasts |
| `brand-designer` | Lina | Before UI design; when brand missing |
| `ux-designer` | Lau | After systems-analyst; before UI design |
| `ui-designer` | Jose | After ux-spec; before react-developer |
| `legal-compliance-advisor` | Felix | Any PII, minors, or images feature |
| `ethical-hacker` | Pecueca | Pentests, CTF, security research |
| `communications-writer` | Vicky | External stakeholder communication |

## Skills

| Skill | Trigger |
|---|---|
| `agent-scaffold` | Used by `component-factory` — new agent |
| `skill-scaffold` | Used by `component-factory` — new skill |
| `reuse-checker` | Used by `component-factory` before generation |
| `component-linter` | Used by `component-factory` after generation |
| `claude-md-linter` | Used by `claude-md-architect` or in CI |
| `pipeline-conventions` | Used by all document-pipeline agents |
| `pipeline-flows` | Picking which flow (A–I) to use |
| `pipeline-runner` | "execute Flow X from agent Y to agent Z" |
| `developer-conventions` | Used by `django-developer`, `react-developer`, `tdd-writer`, `test-writer` |
| `review-conventions` | Used by `code-reviewer`, `security-auditor` |
| `pipeline-trace-linter` | After `tdd-writer` TDD; before implementation |
| `update-cc-knowledge` | `/update-cc-knowledge` |
| `deploy` | `/deploy [frontend\|backend\|all]` |

## Slash Commands

Live in `.claude/commands/`. Invoked by the user with `/<name>` — not auto-loaded.

| Command | Trigger |
|---|---|
| `/capture-task` | Snapshot current branch changes into a Linear issue |
| `/create-task` | Guided creation of a new Linear task |
| `/start-task` | Branch + start work on a Linear issue |
| `/pr-create` | Generate PR description from current branch |
| `/sync-cc` | Sync Claude Code config with latest platform updates |
| `/validate-config` | Full CC config audit |
