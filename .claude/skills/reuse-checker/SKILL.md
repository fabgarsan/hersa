---
name: reuse-checker
description: Decides whether a proposed agent or skill should be created NEW, used to EXTEND an existing component, or handled INLINE without creating any component. Runs before generation. Do not use for post-generation review or for application code.
version: 1.0.0
when_to_use:
  - Before generating a new agent or skill
  - When a user asks to formalize a recurring workflow
  - When deciding whether to extend an existing component vs create new
---

## When NOT to Use

- After component generation (use `component-linter` instead)
- For reviewing or refactoring existing components
- For application source code decisions

## Inputs

```
{
  "capability": "<one-sentence description>",
  "project_root": "<path>"
}
```

## Procedure

1. **Inventory** — list existing components:
   ```
   ls <project_root>/.claude/agents/*.md
   ls <project_root>/.claude/skills/*/SKILL.md
   ```

2. **Read frontmatter only** from each (use `head -20` or `extract_frontmatter.sh` from `component-linter/scripts/`). Never read full bodies.

3. **Score overlap** for each existing component using:
   - Name similarity (kebab-case word overlap)
   - Description keyword overlap
   - `when_to_use` trigger overlap

4. **Decide:**
   - **EXTEND** if any existing component covers ≥80% of the capability
   - **INLINE** if the capability is a one-off (used <3 times historically — confirm with user)
   - **NEW** otherwise

5. **Return** the decision plus justification.

## Outputs

```
DECISION: NEW | EXTEND <name> | INLINE
JUSTIFICATION: <one line>
REVIEWED: [<component paths scanned>]
```

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
| `.claude/` directory missing | `NO_CLAUDE_DIR` | Caller initializes structure first |
| Cannot read frontmatter | `MALFORMED_FRONTMATTER: <path>` | Caller fixes YAML |
| Filesystem permission error | `PERMISSION_DENIED` | Caller fixes permissions |

## Token Budget

- This skill body: ~70 lines
- Per-invocation cost: ~1K input, ~300 output

## Trigger Tests

**Should invoke:**
- "Before creating a new agent that summarizes API responses, check if one already exists"
- "Should I create a new skill for formatting dates or extend an existing utility?"

**Should NOT invoke:**
- "Validate the agent I just generated for structural compliance"
- "Scaffold a new skill for generating migration summaries"
