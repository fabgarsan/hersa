# Documentation

This directory contains all non-code artifacts produced by the Hersa pipeline agents.

## Structure

```
documentation/
├── process/
│   ├── as-is/          → process-analyst output (as-is operational process)
│   └── to-be/          → process-optimizer output (optimized to-be process)
├── requirements/
│   ├── discovery/      → pm-discovery output (DISC-00N.md — feature discovery briefs)
│   ├── specs/          → systems-analyst, ux-designer, ui-designer output
│   │                      hersa-especificaciones-funcionales.md (systems-analyst)
│   │                      ux-spec.md (ux-designer)
│   │                      ui-spec.md (ui-designer)
│   ├── pm/             → pm-writer output (documento-pm.md — executive PM document)
│   ├── prd/            → prd-writer output (PRD-00N-name.md — product requirements)
│   ├── tdd/            → tdd-writer output (TDD-00N-name.md — technical designs)
│   └── adr/            → adr-writer output (ADR-00N-title.md — architecture decisions)
├── qa/                 → qa-engineer output (test plans, regression matrix)
├── legal/              → legal-compliance-advisor output (risk assessments, data inventory)
├── brand/              → brand-designer output (brand-manual, digital-guidelines, tone-of-voice)
└── communications/     → communications-writer output (stakeholder documents)
```

## Data flow (pipeline sequence)

```
process-analyst → as-is.md
       ↓
process-optimizer → to-be.md
       ↓
systems-analyst → hersa-especificaciones-funcionales.md (global, one file)
       ↓                                    ↓
pm-writer → documento-pm.md        pm-discovery → DISC-00N.md (Route B)
       ↓                                    ↓
prd-writer → PRD-00N.md ◄──────────────────┘
       ↓
tdd-writer → TDD-00N.md
       ↓
qa-engineer → test-plan-*.md
       ↓
release-manager (gate: checks [QA-BLOCK] and [LEGAL-BLOCKER] before approving merge)

legal-compliance-advisor → legal-risk-*.md (conditional gate at spec + PRD + deploy)
ux-designer → ux-spec.md  ┐
ui-designer → ui-spec.md  ┘  (parallel with pm path; feeds tdd-writer §5 Frontend)
adr-writer → ADR-00N.md      (triggered by tdd-writer when TDD §8 flags hard decisions)
```

## Naming conventions

| Type | Pattern | Example |
|---|---|---|
| Discovery brief | `DISC-00N.md` | `DISC-001-toga-reservation.md` |
| PRD | `PRD-00N-name.md` | `PRD-003-payment-module.md` |
| TDD | `TDD-00N-name.md` | `TDD-003-payment-module.md` |
| ADR | `ADR-00N-title.md` | `ADR-001-jwt-storage.md` |
| Test plan | `test-plan-<slug>.md` | `test-plan-toga-reservation.md` |
| Legal risk | `legal-risk-<feature>.md` | `legal-risk-photo-consent.md` |

## Blocking tags

Tags that can stop the pipeline mid-flight are defined in `.claude/skills/pipeline-conventions/SKILL.md` Protocol 3. Resolve them in the source document before re-invoking the downstream agent.
