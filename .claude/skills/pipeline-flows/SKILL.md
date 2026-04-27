---
name: pipeline-flows
description: Canonical catalogue of the 9 configurable pipeline flows for Hersa. Defines entry point, agent sequence, exit point, and hard stops for each flow type.
version: 1.0.0
when_to_use:
  - When picking which flow to use before starting any work
  - When running pipeline-runner to generate an invocation sequence
  - When documenting or reviewing the pipeline structure
when_not_to_use:
  - As a substitute for agent-specific instructions — each agent still owns its own operating rules
  - For application code decisions
---

## The 9 Configurable Flows

Each flow is identified by a letter (A–I). Use the first flow whose condition matches your situation.

| Flow | Name | Entry | Exit | Use when |
|---|---|---|---|---|
| A | Strategic full pipeline | `senior-ceo-advisor` | `aws-devops` | New initiative with significant commercial impact (new module, new service line) |
| B | From technical definition | `engineering-manager` | `release-manager` | Process/spec already clear; need to formalize engineering |
| C | Existing Linear ticket | `/start-task` | `/pr-create` | Ticket with clear AC exists; TDD already written |
| D | Bug fix | `django-developer` or `react-developer` | `/pr-create` | Confirmed bug, small scope, no new design |
| E | Lightweight | `django-developer` or `react-developer` | `/pr-create` | Cosmetic, label, validation tweak — no new entity or endpoint |
| F | Pre-deploy audit | `security-auditor` | `aws-devops` | Before deploying any release touching PII, auth, or payments |
| G | Process redesign only | `process-analyst` | `senior-ceo-advisor` | Understand and improve an operational process without building software yet |
| H | Functional definition only | `systems-analyst` | `systems-analyst` | to-be doc exists; need functional spec only |
| I | Design only | `ux-designer` | `ui-designer` | Functional spec approved; need design before engineering |

---

## Flow A — Strategic full pipeline

**Condition:** New service, new domain module, or initiative requiring stakeholder alignment before implementation.

**Sequence:**
```
senior-ceo-advisor       → [HSTOP: ¿la idea pasa el filtro de negocio?]
process-analyst          → as-is document
process-optimizer        → to-be document         [HSTOP: resolve [NECESITA CONTEXTO]]
systems-analyst          → functional spec         [HSTOP: resolve [BLOCKER]]
pm-writer                → executive PM document   [HSTOP: PM approves]
ux-designer              → ux-spec                 [HSTOP: resolve [FRICCIÓN ALTA]]
ui-designer              → ui-spec
senior-ceo-advisor       → commercial viability check
prd-writer               → PRD                     [HSTOP: user approves PRD]
engineering-manager      → pipeline sanity-check
tdd-writer               → TDD                     [HSTOP: user approves TDD]
adr-writer               → (conditional: if TDD §8 flags a hard-to-reverse decision)
/create-task             → Linear tickets
/start-task              → branch
django-developer         → backend implementation
react-developer          → frontend implementation (parallel with backend once API contract agreed)
test-writer              → tests
release-manager          → pre-merge gate
aws-devops               → deploy
```

**Hard stops (never skip):**
- Never run `process-optimizer` with unresolved `[AMBIGUO]` or `[FALTA INFO]`
- Never run `systems-analyst` with unresolved `[NECESITA CONTEXTO]`
- Never run `prd-writer` with unresolved `[BLOCKER]`
- Never run `tdd-writer` without an approved PRD
- Never merge without `release-manager` PASS

---

## Flow B — From technical definition

**Condition:** Process and spec already clear; need to formalize engineering before implementation.

**Sequence:**
```
engineering-manager      → pipeline sanity-check
prd-writer               → PRD (if not already exists)   [HSTOP: user approves]
tdd-writer               → TDD                            [HSTOP: user approves]
ux-designer              → ux-spec (if UI is involved)
ui-designer              → ui-spec (if UI is involved)
/create-task + /start-task
django-developer / react-developer
test-writer
release-manager
```

---

## Flow C — Existing Linear ticket

**Condition:** Ticket with clear acceptance criteria exists; TDD already written or not needed.

**Sequence:**
```
/start-task
(tdd-writer if no TDD exists)
django-developer or react-developer
test-writer
code-reviewer
/pr-create
```

---

## Flow D — Bug fix

**Condition:** Confirmed bug in production or staging; no new migration or endpoint needed.

**Entry guard:** if fix requires new migration or new endpoint → escalate to Flow C or B.

**Sequence:**
```
django-developer or react-developer  → targeted fix
test-writer                          → regression test (mandatory)
code-reviewer
/pr-create
```

---

## Flow E — Lightweight

**Condition:** All of the following are true: no new model, no new endpoint, single surface, no auth/PII/payment logic.

**Sequence:**
```
django-developer or react-developer
code-reviewer
(test-writer — optional if behavior is non-trivial)
/pr-create
```

---

## Flow F — Pre-deploy audit

**Condition:** Before deploying a release that touches auth, PII, payments, or AWS secrets.

**Sequence:**
```
security-auditor
code-reviewer
release-manager          → PASS required before deploy
aws-devops               → deploy
```

---

## Flow G — Process redesign only

**Condition:** Goal is to understand and improve an operational process. No software will be built yet.

**Sequence:**
```
process-analyst          → as-is doc               [HSTOP: user confirms]
process-optimizer        → to-be doc               [HSTOP: resolve [NECESITA CONTEXTO]]
senior-ceo-advisor       → operational viability check
```

---

## Flow H — Functional definition only

**Condition:** to-be document exists and is clean (zero `[NECESITA CONTEXTO]`). Only need the functional spec.

**Sequence:**
```
systems-analyst          → functional spec (hersa-especificaciones-funcionales.md)
```

---

## Flow I — Design only

**Condition:** Functional spec approved (zero `[BLOCKER]`). Only need UX/UI design before engineering.

**Sequence:**
```
ux-designer              → ux-spec                 [HSTOP: resolve [FRICCIÓN ALTA]]
ui-designer              → ui-spec
```

---

## Hard stops shared across all flows

- NEVER start implementation without at minimum a ticket with AC (Flow C) or an approved TDD (Flows A/B)
- NEVER merge to main without `release-manager` PASS for non-trivial changes
- NEVER deploy a release touching auth, PII, or payments without `security-auditor` + `release-manager`
- NEVER run a downstream pipeline agent if its required upstream tag `[AMBIGUO]`, `[FALTA INFO]`, `[NECESITA CONTEXTO]`, `[BLOCKER]`, `[FRICCIÓN ALTA]` remains unresolved
