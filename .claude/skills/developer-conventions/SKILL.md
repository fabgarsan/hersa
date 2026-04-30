---
name: developer-conventions
description: Shared operating rules for all implementation agents — django-developer, react-developer, tdd-writer, and test-writer. Defines grep-first discovery, surgical edit discipline, I/O conventions, commit format, and when to load specific convention files.
version: 1.0.0
model: sonnet
allowed-tools: Read
when_to_use:
  - Any implementation agent (django-developer, react-developer, tdd-writer, test-writer) should load this at the start of a task
  - When authoring a new implementation agent that needs shared operating rules
when_not_to_use:
  - For pipeline agents (process-analyst, process-optimizer, systems-analyst, pm-writer, prd-writer) — use pipeline-conventions instead
  - For review agents (code-reviewer, security-auditor) — use review-conventions instead
---

## Operating Rules (all implementation agents)

### 1. Grep-first discovery
Before reading any file, use Glob or Grep to confirm it exists at the expected path. Never assume a file exists.

### 2. Read before write
Never write or edit a file without reading it first in this session.

### 3. Surgical edits
Prefer `Edit` over `Write` for existing files. Change only what the task requires. Do not refactor or clean up surrounding code unless explicitly asked.

### 4. Paths only for I/O
Never pass inline content larger than 50 lines between steps. Pass file paths instead.

### 5. No speculative features
Do not add error handling, fallbacks, or abstractions for scenarios that cannot happen. Trust internal code and framework guarantees.

### 6. No comments unless non-obvious
Default to zero comments. Write a comment only when the WHY is non-obvious (hidden constraint, workaround for a specific bug, surprising invariant).

## Commit and Branch Format

- **Branch:** `HRS-<n>/<short-description>` e.g., `HRS-42/add-toga-inventory`
- **Commit:** `type(scope): description (HRS-N)` e.g., `feat(inventory): add toga stock model (HRS-42)`
- **Types:** feat, fix, refactor, test, docs, chore, style

## When to Load Specific Convention Files

| File | Load when |
|---|---|
| `.claude/shared/conventions/api-contract.md` | Implementing or reviewing any API endpoint |
| `.claude/shared/conventions/error-handling.md` | Writing views, serializers, or React components that handle API responses |
| `.claude/shared/conventions/security-checklist.md` | Any auth, PII, or payment-sensitive module |

> `backend-conventions.md`, `mui-conventions.md`, `react-conventions.md`, `theme-tokens.md` are now path-scoped rules in `.claude/rules/` — auto-loaded when editing matching files; no explicit load needed.

## Handoff Protocol

- **developer → test-writer:** report which files were created or modified. test-writer reads those before writing a single test.
- **developer → code-reviewer:** the code must speak for itself. No inline explanation needed.
- **developer → docs-writer:** only after implementation is stable and tests pass.
