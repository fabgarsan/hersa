---
name: claude-md-linter
description: Validates an existing CLAUDE.md file (and any .claude/rules/*.md path-scoped rule files) against Claude Code best practices and the 2.1+ spec. Detects missing required sections, length overruns, prose paragraphs, dead registry references, structural violations, and malformed path-scoped rules. Use in CI or before merging changes to CLAUDE.md. Do not use for generating CLAUDE.md from scratch.
version: 1.1.0
kb_version: "2026-04-29T00:00:00"
model: haiku
allowed-tools: Read Grep Glob
context: fork
agent: Explore
when_to_use:
  - Before merging changes to CLAUDE.md
  - Periodic CLAUDE.md health checks (e.g., quarterly audits)
  - After running claude-md-architect to validate the output
  - In CI pipelines as a pre-merge check
when_not_to_use:
  - Generating a CLAUDE.md from scratch (use claude-md-architect agent)
  - Validating agents or skills (use component-linter instead)
  - Reviewing application source code
---

## When NOT to Use

- Generating a CLAUDE.md from scratch (use `claude-md-architect` agent)
- Validating agents or skills (use `component-linter` instead)
- Reviewing application source code

## Inputs

```
{
  "claude_md_path": "<abs path, default: ./CLAUDE.md>",
  "project_root": "<abs path, default: directory of claude_md_path>",
  "max_lines": <int, default: 300>,
  "max_tokens": <int, default: 2000>
}
```

## Procedure

Run the checklist below. Each item is PASS or FAIL.

### Section 1: Required content (KB §9.1)

1. Project identity present (name + 1-line purpose)
2. Tech stack section present (languages, frameworks, versions)
3. Build/test/run commands present (in fenced code blocks)
4. Code conventions section present
5. Directory map present (or explicit "see file tree" reference)
6. Do-not-touch list present
7. Agent Registry table present (even if empty placeholder)
8. Skill Registry table present (even if empty placeholder)

### Section 2: Length and format (KB §9.1, §9.8)

9. Total line count ≤ `max_lines` (default 300)
10. Estimated token count ≤ `max_tokens` (default 2000) — approx via `wc -w * 1.3`
11. No prose paragraphs >3 consecutive sentences outside of code blocks
12. Headers use H2 only (no H3, H4, H5 nesting)
13. Imperative voice used in commands ("Run X", not "You should run X") — sample-checked, not exhaustive
14. Each bullet contains one fact (no compound statements joined by "and")

### Section 3: Registry integrity (KB §9.1)

15. Every agent in Agent Registry has a corresponding file in `<project_root>/.claude/agents/`
16. Every file in `<project_root>/.claude/agents/` has a row in Agent Registry
17. Every skill in Skill Registry has a corresponding directory in `<project_root>/.claude/skills/`
18. Every directory in `<project_root>/.claude/skills/` has a row in Skill Registry
19. No duplicate names in either registry

### Section 4: Companion files (KB §1.7)

20. `.claudeignore` exists at project root (warning, not failure, if absent)
21. `.claudeignore` excludes at minimum: `node_modules/`, `.git/`, `dist/`, `build/` (warnings per missing item)

### Section 5: Anti-patterns (KB §9.4)

22. Does not embed full agent system prompts (>50 lines of indented content suggests prompt-in-prompt)
23. Does not duplicate procedural content from any skill (cross-checked by detecting >70% line overlap with any SKILL.md body)
24. Does not contain the literal string `TODO` or `FIXME` (these signal incomplete CLAUDE.md)

### Section 6: `@`-imports (KB §1.4)

25. Every `@path/to/file` import resolves to an existing file (relative to the importing file)
26. Import depth ≤5 levels (KB §1.4 limit)

### Section 7: Path-scoped rules (`.claude/rules/*.md`, KB §1.3)

For each `.md` file under `<project_root>/.claude/rules/` (recursive):

27. Has YAML frontmatter (between `---` markers)
28. If `paths:` is present, it is a non-empty array of strings
29. Glob patterns in `paths:` use supported syntax (`**/*.ext`, `dir/**/*`, `*.md`, `dir/*.tsx`, `dir/**/*.{ts,tsx}`)
30. File body is non-empty (rule with no content is a dead file — warning)
31. Body length ≤ 300 lines (consistency with CLAUDE.md ceiling)
32. Body contains no prose paragraphs >3 consecutive sentences
33. No nested H1 (`#`) — rule files use H1 once for title, then H2 only

Aggregate (cross-file):

34. No two rule files declare overlapping `paths:` with conflicting rules (warning if globs intersect)
35. If a topic appears both in CLAUDE.md and in a `.claude/rules/<topic>.md`, flag DRY violation

## Outputs

```
VALIDATION: PASS | FAIL | PASS_WITH_WARNINGS
FAILED_CHECKS: [<list of check numbers + brief reason>]
WARNINGS: [<list of non-blocking issues>]
METRICS:
  lines: <N>
  estimated_tokens: <N>
  agents_registered: <N>
  skills_registered: <N>
  rules_files: <N>
  imports_resolved: <N>
  imports_dead: <N>
```

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
| `claude_md_path` does not exist | `NOT_FOUND: <path>` | Caller verifies path or runs `claude-md-architect` to create one |
| `.claude/` directory missing | `NO_CLAUDE_DIR` | Skip registry checks; report as warning |
| Cannot read file | `PERMISSION_DENIED` | Caller fixes permissions |
| Malformed registry table | `MALFORMED_REGISTRY: <line>` | Caller fixes table syntax |

## Bundled Scripts

- `scripts/check_registry.sh` — cross-references CLAUDE.md registries against the filesystem.
- `scripts/check_rules.sh` — validates each `.md` file under `.claude/rules/` (frontmatter present, `paths:` non-empty when declared, body ≤300 lines, single H1).

## Token Budget

- This skill body: ~110 lines (within 500 ceiling)
- Per-invocation cost: ~2K input, ~600 output
- Runs in <2 seconds for typical CLAUDE.md

## Trigger Tests

**Should invoke:**
- "Validate the root CLAUDE.md before merging this PR"
- "Run claude-md-linter on frontend/CLAUDE.md to check for structural violations"

**Should NOT invoke:**
- "Generate a CLAUDE.md for this project from scratch"
- "Validate the agent file I just created"
