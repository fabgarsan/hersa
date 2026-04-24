# Agent Workflow — Hersa

> **Agents:** All
> **Load when:** Starting any non-trivial feature; orchestrating multiple agents
> **Summary:** Step-by-step agent orchestration guide for features, bugs, and deploys

## 0. Pick your flow first

Answer these questions in order. Use the **first** matching row.

| Condition | Flow |
|-----------|------|
| Something broken in production or existing behavior | **Bug fix** |
| Change touches only one surface (only frontend OR only backend) AND no new models or endpoints | **Lightweight** |
| Existing Linear ticket with clear acceptance criteria | **Linear ticket** |
| New feature touching both surfaces, or new domain model, or needs stakeholder alignment | **Full pipeline** |

> **When in doubt, start lighter.** A lightweight task can escalate mid-flight; starting a full pipeline for a bug fix wastes time and tokens for everyone.

---

## Bug fix

**Entry guard:** confirm the fix does not require a new migration or a new API endpoint. If it does, escalate to Lightweight or Full pipeline.

```
1. Read the broken code directly — understand root cause before touching anything
2. django-developer or react-developer → targeted fix, minimum blast radius
3. test-writer → regression test that would have caught this bug
4. code-reviewer → verify the fix is clean and has no side effects
```

**Exit guard:** the regression test must cover the exact failing scenario. If no test can be written (e.g. infrastructure issue), document why in the PR description.

---

## Lightweight feature

**Entry guard:** verify ALL of the following are true before proceeding without a TDD:
- [ ] No new Django model or migration
- [ ] No new API endpoint that the other surface depends on
- [ ] A single developer can complete it without coordination with another surface
- [ ] No auth, payment, or PII-sensitive logic involved

If any item is unchecked → escalate to **Full pipeline**.

```
react-developer (or django-developer) → code-reviewer → (test-writer if behavior is non-trivial)
```

---

## Linear ticket → implementation

**Entry guard:** before writing a single line of code:
1. Read the ticket fully — acceptance criteria, not just the title
2. Check `/documentation/requirements/tdd/` for an existing TDD
3. If no TDD and the ticket is non-trivial → run `tdd-writer` first
4. If the ticket scope has grown beyond the original estimate → flag to the user before proceeding

```
/start-task → (tdd-writer if no TDD exists) → django-developer / react-developer → test-writer → code-reviewer → /pr-create
```

Branch and commit format:
- Branch: `HRS-<n>/<short-description>`
- Commits: `feat(events): add confirmation endpoint (HRS-42)`

---

## Pre-deploy checklist

Run before any merge to main:

```
1. security-auditor → full scan (required if auth, PII, or payments are involved)
2. code-reviewer    → review any code not yet reviewed in this branch
3. test-writer      → ensure coverage on critical paths
4. docs-writer      → update CLAUDE.md and changelog if conventions changed
```

---

## Full feature pipeline

**Entry guard:** confirm at least one of these is true before starting pm-discovery:
- [ ] The feature touches both backend and frontend
- [ ] It introduces a new domain model or business concept
- [ ] It requires agreement with the user/stakeholder on scope before implementation
- [ ] Estimated effort > 3 story points

If none are true → this is Lightweight. Do not run the full pipeline.

```
1. pm-discovery     → interview to reach full shared understanding
                      → saves /documentation/requirements/discovery/DISC-00N.md
                      → [USER CONFIRMS before next step]

2. prd-writer       → reads DISC-00N brief, writes formal requirements
                      → saves /documentation/requirements/prd/PRD-00N.md
                      → [USER REVIEWS AND APPROVES — hard stop]

3. architect        → (optional) reads PRD, produces high-level technical plan
                      → skip if the approach is already clear

4. tdd-writer       → reads approved PRD + codebase + conventions
                      → saves /documentation/requirements/tdd/TDD-00N.md
                      → [USER REVIEWS AND APPROVES — hard stop]

4b. adr-writer      → (trigger if TDD §8 flags a decision as hard-to-reverse, non-obvious,
                        or with real rejected alternatives)
                      → saves /documentation/requirements/adr/ADR-00N-title.md

5. /create-task     → breaks TDD §7 into Linear tickets, story points from TDD §10

6. /start-task      → creates branch linked to the Linear ticket

7. django-developer → implements backend per TDD §7
8. react-developer  → implements frontend per TDD §7

9. test-writer      → tests for both layers
10. code-reviewer   → review before committing
11. security-auditor → required for auth and data-sensitive modules
12. docs-writer     → CLAUDE.md + docstrings after module is stable

13. /pr-create      → PR description linking TDD and Linear ticket
```

**Hard stops (do not skip):**
- Never run `prd-writer` without a confirmed discovery brief.
- Never run `tdd-writer` without an approved PRD.
- Never start implementation without an approved TDD.
- Never merge without `security-auditor` if the feature handles auth, PII, or payments.

---

## Agent handoff rules

- **pm-discovery → prd-writer**: prd-writer reads the discovery brief as its primary input. Without a brief, it stops and asks.
- **prd-writer → tdd-writer**: tdd-writer reads the full approved PRD. Never run on a draft.
- **tdd-writer → /create-task**: tickets are created from TDD §7 and §10. Without a TDD, tickets will be vague.
- **architect → tdd-writer**: architect produces the plan; tdd-writer formalizes it. Architect does not write the TDD.
- **tdd-writer → adr-writer**: when TDD §8 flags a decision with `→ run adr-writer`, pass the TDD path and the specific decision as context. adr-writer reads the TDD and writes the ADR before implementation begins.
- **developer → test-writer**: developer reports which files were created or modified. test-writer reads those before writing a single test.
- **developer → code-reviewer**: reviewer reads the diff. The code must speak for itself.
- **any → docs-writer**: only after implementation is stable and tests pass.

## Parallel vs sequential

**Can run in parallel:**
- `django-developer` and `react-developer` once the API contract in the TDD is agreed
- `test-writer` for backend and frontend simultaneously

**Must be sequential:**
- `pm-discovery` → `prd-writer` → `tdd-writer` → implementation (each requires prior approval)
- `security-auditor` runs after implementation, not during
- `docs-writer` runs last — after tests pass and code is reviewed
