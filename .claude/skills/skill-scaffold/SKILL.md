---
name: skill-scaffold
description: Generates a new skill directory at .claude/skills/<n>/ with SKILL.md and supporting structure, following the project architecture guide. Use when a new skill has been approved by the reuse-decision step. Do not use for agent generation, for modifying existing skills, or for application code.
version: 1.0.0
when_to_use:
  - A new skill (not an extension) is being created
  - The capability has passed the reuse-decision check
  - The orchestrator has determined kind=skill
---

## When NOT to Use

- Modifying or rewriting an existing skill (manual review required)
- Generating agents (use `agent-scaffold` instead)
- One-off transformations (recommend inline prompting)
- Wrapping a single CLI call with no added logic (per guide §3.4 — do not create)

## Inputs

```
{
  "name": "<kebab-case-noun>",                // required
  "description": "<≤1024 chars, triggers + exclusions>",  // required
  "when_to_use": ["<bullet>", ...],           // required, ≥2 entries
  "when_not_to_use": ["<bullet>", ...],       // required, ≥2 entries
  "inputs_spec": "<paths/IDs only — no inline content>",  // required
  "procedure": ["<step>", ...],               // required, numbered steps
  "outputs_spec": "<paths + summary>",        // required
  "failure_modes": [{"condition": "...", "code": "...", "recovery": "..."}, ...],
  "needs_scripts_dir": true|false,            // default false
  "needs_examples_dir": true|false,           // default false
  "project_root": "<path>"                    // required
}
```

## Procedure

1. **Validate name** — `^[a-z]+(-[a-z]+)*$`, no collision with existing skills under `<project_root>/.claude/skills/`. On collision: return `NAME_COLLISION: <n>`.

2. **Validate description length** — must be ≤1024 characters. On overrun: return `DESCRIPTION_TOO_LONG: <count>`.

3. **Validate I/O contract** — `inputs_spec` must reference paths or IDs, never inline content. Reject if it contains the words "file content", "blob", "embedded", "paste".

4. **Create directory structure:**
   ```
   <project_root>/.claude/skills/<n>/
   ├── SKILL.md           (always)
   ├── scripts/           (if needs_scripts_dir)
   │   └── .gitkeep
   ├── examples/          (if needs_examples_dir)
   │   └── .gitkeep
   └── references/        (if procedure mentions deeper docs)
       └── .gitkeep
   ```

5. **Render `SKILL.md`** from the template below. Frontmatter first, then sections in fixed order.

6. **Write atomically** — write all files to a `.tmp` directory, then `mv` to final location.

7. **Return** the absolute path of the directory plus a one-line summary.

## Template (inline)

```
---
name: {{name}}
description: {{description}}
version: 0.1.0
when_to_use:
{{when_to_use_yaml_bullets}}
---

## When NOT to Use
{{when_not_to_use_bullets}}

## Inputs
{{inputs_spec}}

## Procedure
{{procedure_numbered_steps}}

## Outputs
{{outputs_spec}}

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
{{failure_modes_table_rows}}

## Token Budget
- This skill body: ~[FILL] lines
- Per-invocation cost: ~[FILL] tokens

## Trigger Tests
**Should invoke:** [TODO: 2 positive prompts — fill before merging]
**Should NOT invoke:** [TODO: 2 negative prompts — fill before merging]
```

## Outputs

Returns a path string:
```
/abs/path/to/.claude/skills/<n>/
```
Plus a one-line summary: `Created skill <n> (SKILL.md: N lines, dirs: <list>).`

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
| Missing required field | `MISSING_FIELD: <n>` | Caller provides and retries |
| Name collision | `NAME_COLLISION: <n>` | Caller renames or uses EXTEND |
| Description too long | `DESCRIPTION_TOO_LONG: <count>` | Caller compresses |
| I/O contract violation | `INLINE_CONTENT_DETECTED` | Caller rewrites I/O to use paths |
| Filesystem write failure | `WRITE_FAILED: <reason>` | Caller checks permissions |

## Token Budget

- This skill body: ~120 lines
- Generated skill files: typically 80–200 lines for `SKILL.md`
- Per-invocation cost: ~1.5K input, ~2K output

## Trigger Tests

**Should invoke:**
- "Scaffold a new skill called `api-diff` that compares two API contract files"
- "Create the skill directory structure for a new `changelog-writer` skill"

**Should NOT invoke:**
- "Generate a new agent file for reviewing pull requests"
- "Modify the existing reuse-checker skill to support JSON output"
