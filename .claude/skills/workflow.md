# Agent Workflow — Hersa

How to orchestrate agents effectively for different work scenarios.

## Standard feature workflow

For any non-trivial feature, follow this order:

```
1. architect       → plan structure, API contract, file list
2. django-developer → implement backend (models → migrations → serializers → views → URLs)
3. react-developer  → implement frontend (types → API hooks → components → page)
4. test-writer      → write tests for both layers
5. code-reviewer    → review before committing
6. security-auditor → run before deploy (auth/data-sensitive modules)
7. docs-writer      → update CLAUDE.md and docstrings after the module is stable
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

- **architect → developer**: The architect's output includes exact file paths, API payloads, and implementation order. The developer reads this before touching any file.
- **developer → test-writer**: The developer reports which files were created or modified. The test-writer reads those files before writing a single test.
- **developer → code-reviewer**: The reviewer reads the diff. The developer does not explain the code verbally — the code must speak for itself.
- **any → docs-writer**: Only trigger after the implementation is stable and tests pass. Documenting moving targets wastes effort.

## Linear ticket → implementation

When starting from a Linear ticket:
1. Read the ticket fully — understand the acceptance criteria, not just the title
2. If the scope is unclear, use `architect` to clarify before implementing
3. Branch name follows the ticket: `HRS-<n>/<short-description>`
4. Commit messages reference the ticket: `feat(events): add confirmation endpoint (HRS-42)`

## Parallel vs sequential

Agents that can run in parallel:
- `django-developer` and `react-developer` can work simultaneously once the API contract is agreed
- `test-writer` for backend and frontend can run in parallel

Agents that must be sequential:
- `architect` must finish before any implementation starts
- `security-auditor` must run after implementation, not during
- `docs-writer` runs last — after tests pass and code is reviewed
