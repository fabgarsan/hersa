# Agent Workflow — Hersa

> **Agents:** All  
> **Load when:** Starting any non-trivial feature; orchestrating multiple agents  
> **Summary:** Step-by-step agent orchestration guide for features, bugs, and deploys

How to orchestrate agents effectively for different work scenarios.

## Standard feature workflow

For any non-trivial feature, follow this order without skipping steps:

```
1. pm-discovery     → interview to reach full shared understanding
                      → saves /documentation/requirements/discovery/DISC-00N.md

2. prd-writer       → reads DISC-00N brief, writes formal requirements
                      → saves /documentation/requirements/prd/PRD-00N.md
                      → [YOU REVIEW AND APPROVE]

3. architect        → (optional) reads PRD, produces high-level technical plan
                      → use when the approach is unclear before tdd-writer acts

4. tdd-writer       → reads PRD + codebase + conventions, writes technical design
                      → saves /documentation/requirements/tdd/TDD-00N.md
                      → [YOU REVIEW AND APPROVE]

5. /create-task     → breaks TDD §7 into Linear tickets with story points from TDD §10

6. /start-task      → creates branch linked to the Linear ticket

7. django-developer → implements backend following TDD §7 implementation plan
8. react-developer  → implements frontend following TDD §7 implementation plan

9. test-writer      → writes tests for both layers
10. code-reviewer   → reviews before committing
11. security-auditor → runs before deploy (required for auth and data-sensitive modules)
12. docs-writer     → updates CLAUDE.md and docstrings after module is stable

13. /pr-create      → generates PR description linking to TDD and Linear ticket
```

## Lightweight feature (UI-only or config change)

Skip `architect` for small, contained changes. Go directly to:

```
react-developer → code-reviewer → (test-writer if behavior is non-trivial)
```

## Bug fix workflow

```
1. Read the relevant code directly (no architect needed)
2. django-developer or react-developer → fix
3. test-writer → add a regression test that would have caught the bug
4. code-reviewer → verify the fix is clean
```

## Pre-deploy checklist

```
1. security-auditor → full scan
2. code-reviewer    → review any code not yet reviewed
3. test-writer      → ensure coverage on critical paths
4. docs-writer      → update changelog
```

## Agent handoff rules

- **pm-discovery → prd-writer**: prd-writer reads the discovery brief as its primary input. Without a brief, it will ask you to run pm-discovery first.
- **prd-writer → tdd-writer**: tdd-writer reads the full approved PRD before designing anything. Never run tdd-writer on a draft PRD.
- **tdd-writer → /create-task**: tickets are created from TDD §7 (implementation plan) and §10 (estimation). Without a TDD, tickets will be vague and unactionable.
- **architect → tdd-writer**: architect's output is a high-level plan that tdd-writer formalizes. Architect does not write the TDD itself.
- **developer → test-writer**: the developer reports which files were created or modified. The test-writer reads those files before writing a single test.
- **developer → code-reviewer**: the reviewer reads the diff. The code must speak for itself.
- **any → docs-writer**: only trigger after implementation is stable and tests pass.

---

## Linear ticket → implementation

When starting from an existing Linear ticket (no discovery needed):

1. Read the ticket fully — understand the acceptance criteria, not just the title
2. Check if a TDD exists in `/documentation/requirements/tdd/` for this feature
3. If no TDD: run `tdd-writer` before implementing
4. Branch name follows the ticket: `HRS-<n>/<short-description>`
5. Commit messages reference the ticket: `feat(events): add confirmation endpoint (HRS-42)`

---

## Parallel vs sequential

**Can run in parallel:**
- `django-developer` and `react-developer` once the API contract in the TDD is agreed
- `test-writer` for backend and frontend

**Must be sequential:**
- `pm-discovery` must finish before `prd-writer` starts
- `prd-writer` must be approved before `tdd-writer` starts
- `tdd-writer` must be approved before any implementation starts
- `security-auditor` runs after implementation, not during
- `docs-writer` runs last — after tests pass and code is reviewed
