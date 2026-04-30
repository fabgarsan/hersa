---
name: review-conventions
description: Shared operating rules for all review agents — code-reviewer and security-auditor. Defines severity scale, output format, read-only discipline, and handoff protocol.
version: 1.0.0
model: sonnet
allowed-tools: Read
context: fork
agent: Explore
when_to_use:
  - code-reviewer or security-auditor loads this at the start of any review task
  - When authoring a new review agent that produces severity-graded findings
when_not_to_use:
  - For implementation agents (django-developer, react-developer) — use developer-conventions instead
  - For pipeline agents — use pipeline-conventions instead
---

## Severity Scale

| Level | Definition |
|---|---|
| **CRITICAL** | Security vulnerability or data integrity issue that must be fixed before any merge |
| **HIGH** | Logic error or convention violation that will cause bugs in production |
| **MEDIUM** | Code quality issue that degrades maintainability; should be fixed before merge |
| **LOW** | Stylistic issue or minor improvement; fix at discretion |
| **INFO** | Observation with no required action |

## Output Format

Every review agent produces a report in this structure:

```
## Review Report — [agent-name]
**Target:** [file or PR description]
**Date:** [date]
**Verdict:** PASS | PASS WITH NOTES | BLOCK

### Findings

| Severity | File | Line | Description | Recommendation |
|---|---|---|---|---|
| CRITICAL | ... | ... | ... | ... |
| HIGH | ... | ... | ... | ... |

### Summary
[1-3 sentences: overall quality, main risk, recommended action]
```

## Operating Rules (all review agents)

### 1. Read-only
Never modify source files, migration files, configuration files, or documentation. Report only.

### 2. No fixing
Do not fix the issues found. Describe them precisely so the developer can act. If you fix, you own the bug.

### 3. Grep-first discovery
Confirm file paths before reading. Never assume structure.

### 4. Severity honesty
Do not soften CRITICAL findings. Do not inflate LOW findings to HIGH. Accuracy matters more than diplomacy.

### 5. Verdict definition
- **PASS:** zero CRITICAL, zero HIGH findings
- **PASS WITH NOTES:** zero CRITICAL, zero HIGH; MEDIUM or LOW findings present
- **BLOCK:** one or more CRITICAL or HIGH findings

## Handoff Protocol

- After a BLOCK verdict, return control to the developer with the findings table
- After a PASS or PASS WITH NOTES, return control to the user
- Do not chain to `release-manager` automatically — the user decides when to run the full gate
