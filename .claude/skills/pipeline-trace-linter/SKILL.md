---
name: pipeline-trace-linter
description: Cross-document validator that checks consistency between the functional spec, PRD, and TDD — ensuring every user story is covered, every entity appears, and no phantom endpoints exist.
version: 1.0.0
when_to_use:
  - After tdd-writer produces a TDD, before implementation begins
  - As a pre-deploy sanity check on the document trail
  - When suspecting drift between what was specified and what was designed
when_not_to_use:
  - Before all three documents (spec, PRD, TDD) exist — partial traces produce false negatives
  - As a substitute for human review of acceptance criteria
---

## What It Checks

### Check 1 — User story coverage
Every `US-NNN` in `hersa-especificaciones-funcionales.md` must appear in the TDD (at minimum in §7 Implementation plan or §2 Scope).

**FAIL condition:** `US-NNN` exists in spec but is not mentioned in TDD.

### Check 2 — Entity consistency
Every data entity defined in the functional spec must appear in the TDD (§3 Data model or equivalent).

**FAIL condition:** entity in spec with no corresponding model or serializer in TDD.

### Check 3 — Endpoint traceability
Every endpoint in the TDD (§4 API contract or equivalent) must be referenced by at least one user story in the spec.

**FAIL condition:** endpoint in TDD with no referencing US.

### Check 4 — Blocker tag scan
Scan all three documents for any unresolved blocking tags: `[AMBIGUO]`, `[FALTA INFO]`, `[NECESITA CONTEXTO]`, `[BLOCKER]`, `[FRICCIÓN ALTA]`.

**FAIL condition:** any unresolved tag found in any of the three documents.

## Output Format

```
## Pipeline Trace Report
**Spec:** [path]
**PRD:** [path]
**TDD:** [path]
**Date:** [date]

### Check 1 — User story coverage: PASS | WARN | FAIL
[list any uncovered US-NNN]

### Check 2 — Entity consistency: PASS | WARN | FAIL
[list any missing entities]

### Check 3 — Endpoint traceability: PASS | WARN | FAIL
[list any orphan endpoints]

### Check 4 — Blocker tag scan: PASS | FAIL
[list any found tags with location]

### Overall verdict: PASS | WARN | FAIL
[1 sentence summary]
```

## Severity

- **FAIL:** implementation should not start until resolved
- **WARN:** inconsistency detected but not necessarily blocking (e.g., entity renamed between spec and TDD); flag for human review
- **PASS:** all checks green; safe to proceed to implementation

## Operating Rules

- Read-only: never modify documents
- Grep-first: use Grep to find US-NNN patterns, entity names, and blocking tags
- Report only: do not fix inconsistencies
