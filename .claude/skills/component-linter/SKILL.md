---
name: component-linter
description: Validates a generated agent file or skill directory against the project architecture rules. Runs after generation. Do not use for reuse decisions, for live components already in production, or for application code.
version: 1.0.0
when_to_use:
  - Immediately after a new component has been generated
  - Before merging a hand-written agent or skill
  - When verifying that a component still meets the architecture rules after edits
---

## When NOT to Use

- Before generation (use `reuse-checker` instead)
- For application source code review
- For auditing components already in long-term production (use a separate audit process)

## Inputs

```
{
  "component_path": "<abs path to .md file or skill dir>",
  "kind": "agent" | "skill"
}
```

## Procedure

Run the checklist below. Each item is PASS or FAIL.

### Universal checks (agents AND skills)

1. Name matches kebab-case pattern (`^[a-z]+(-[a-z]+)*$`)
2. Frontmatter contains all required fields (`name`, `description`, `version`)
3. Both `when_to_use` and `when_not_to_use` (or equivalent sections) present, ≥2 entries each
4. No "and" connecting separate verbs/duties in the description (single-responsibility check; "agents and skills" or list items are OK)
5. No prose paragraphs (only bullets, tables, code blocks)
6. Description ≤1024 chars (skills) / one sentence (agents)
7. Trigger tests section present (placeholders allowed but flagged)

### Agent-only checks

8. Tool list ≤5 OR each tool has one-line justification
9. Scope boundary explicitly states what the agent must NOT touch
10. System prompt ≤200 lines
11. Output contract defined for both success AND failure cases
12. Handoff protocol present
13. Senior-engineer persona language present in system prompt

### Skill-only checks

14. `SKILL.md` ≤500 lines
15. Inputs reference paths/IDs (reject if description contains "file content", "blob", "embedded", "paste")
16. Outputs return paths + summary, not full operation logs
17. Failure modes table present with ≥1 row
18. Procedure is numbered steps, not narrative
19. No skill→agent invocations referenced anywhere

### Cross-component checks

20. No name collision with existing components
21. No content overlap >50% with any existing component
22. Does not duplicate facts already in CLAUDE.md

## Outputs

```
VALIDATION: PASS | FAIL
FAILED_CHECKS: [<list of check numbers + brief reason>]
WARNINGS: [<list of non-blocking issues, e.g. trigger-test placeholders>]
```

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
| Component path does not exist | `NOT_FOUND: <path>` | Caller verifies path |
| Cannot parse frontmatter | `MALFORMED_FRONTMATTER` | Caller fixes YAML and retries |
| Unknown `kind` value | `INVALID_KIND: <value>` | Caller passes "agent" or "skill" |

## Bundled Scripts

`scripts/extract_frontmatter.sh` — extracts YAML frontmatter from a markdown file. Also used by `reuse-checker`.

## Token Budget

- This skill body: ~95 lines
- Per-invocation cost: ~2K input, ~500 output

## Trigger Tests

**Should invoke:**
- "Lint the agent I just generated at .claude/agents/invoice-processor.md"
- "Validate the skill-scaffold skill directory against the architecture rules"

**Should NOT invoke:**
- "Decide whether to create a new agent or extend an existing one"
- "Review the Django views I just wrote for quality issues"
