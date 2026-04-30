# Shared Context Files — Load-When Index

These files are loaded by `@import` path when indicated. Not auto-invocable.

| File | Read when |
|------|-----------|
| `.claude/shared/hersa-context.md` | Understanding Hersa services portfolio or B2B/B2C business model |
| `.claude/shared/colombia-data-protection-law.md` | Any compliance evaluation, PII/images/minors, consent flows — `legal-compliance-advisor` must read |
| `.claude/shared/hersa-process.md` | Data models, business logic, migrations, domain constraints, entity relationships |
| `.claude/shared/pipeline-workflows.md` | **Complete workflow reference** (flow selection A–J, per-flow procedures, entry guards, agent handoffs, parallel vs sequential, business analysis pipeline, available gates) — load when starting any non-trivial work |
| `.claude/skills/pipeline-flows/SKILL.md` | **Flow catalogue** (entry/exit/sequence for each flow A–J) — used by `pipeline-runner`; load when executing `pipeline-runner` |
| `.claude/shared/conventions/api-contract.md` | Implementing or reviewing any endpoint |
| `.claude/shared/conventions/error-handling.md` | Writing views, serializers, or React components that handle API responses |
| `.claude/shared/conventions/security-checklist.md` | `security-auditor` always; any auth or data-sensitive module |
| `.claude/rules/backend/backend-conventions.md` | Creating Django models, views, serializers, or scaffolding a new app — auto-loaded when editing matching backend files |
| `.claude/rules/frontend/theme-tokens.md` | Defining or applying Hersa brand colors, typography, or logo rules — auto-loaded when editing theme/SCSS files |
| `.claude/rules/frontend/mui-conventions.md` | Choosing MUI components, using Grid2, or wiring up RHF forms — auto-loaded when editing .tsx/.ts files |
| `.claude/shared/conventions/ui-patterns.md` | Any form, modal, drawer, loading state, empty state, page layout, or data table |
| `.claude/rules/frontend/react-conventions.md` | Writing axios interceptors, React Query hooks, or managing auth/state — auto-loaded when editing API/context files |
| `documentation/brand/brand-manual.md` | Any UI screen or component — `ui-designer` must read before any ui-spec |
| `documentation/brand/tone-of-voice.md` | Any external-facing document — `communications-writer` must read |
| `documentation/brand/digital-guidelines.md` | React visual theme — `react-developer` and `ui-designer` read before visual work |
| `.claude/shared/claude-code-knowledge.md` | Generating or updating agents/skills — `component-factory` and `claude-md-architect` must read |
