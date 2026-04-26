---
name: agent-scaffold
description: Generates a new agent file at .claude/agents/<n>.md following the project architecture guide. Use when a new agent has been approved by the reuse-decision step. Do not use for skill generation, for modifying existing agents, or for application code.
version: 1.0.0
when_to_use:
  - A new agent (not an extension) is being created
  - The capability has passed the reuse-decision check
  - The orchestrator (component-factory) has determined kind=agent
---

## When NOT to Use

- Modifying or rewriting an existing agent (manual review required)
- Generating skills (use `skill-scaffold` instead)
- One-off prompting needs (recommend inline prompting)
- Capability not yet approved by `reuse-checker`

## Inputs

Accepts a single JSON-shaped object (or equivalent prompt structure):

```
{
  "name": "<kebab-case-verb-noun>",          // required
  "purpose": "<one sentence>",                // required
  "scope_boundary": "<must NOT touch: ...>",  // required
  "tools": ["<tool>", ...],                   // required, justified
  "use_when": ["<bullet>", ...],              // required, ≥2 entries
  "do_not_use_when": ["<bullet>", ...],       // required, ≥2 entries
  "input_contract": "<text>",                 // required
  "output_contract": "<text>",                // required
  "project_root": "<path>"                    // required
}
```

All fields are mandatory. If any are missing, fail fast with `MISSING_FIELD: <name>` and do not generate.

## Procedure

1. **Validate name** — must match `^[a-z]+(-[a-z]+)+$` and not collide with existing files in `<project_root>/.claude/agents/`. On collision: return `NAME_COLLISION: <n>`.

2. **Validate tool list** — must be ≤5 tools unless explicit justification provided per tool. Each tool gets a one-line `# justification:` comment in the frontmatter.

3. **Render the file** using the template in `templates/agent.md.tpl` (below). Substitute all fields. Do not add fields not in the template.

4. **Write atomically** — write to `<project_root>/.claude/agents/<name>.md.tmp`, then rename. Prevents partial files on failure.

5. **Return** the absolute path of the created file plus a one-line summary.

## Template (inline)

```
---
name: {{name}}
description: {{purpose}}
tools: [{{tools}}]
version: 0.1.0
---

## Scope & Boundary
{{scope_boundary}}

## Use When / Do Not Use When
**Use when:**
{{use_when_bullets}}

**Do NOT use when:**
{{do_not_use_when_bullets}}

## Input Contract
{{input_contract}}

## System Prompt
You are a senior {{domain}} engineer. {{purpose}}

Operating rules:
- Grep-first discovery; surgical edits over full-file rewrites
- Pass artifact paths between steps, never inline blobs >50 lines
- Summarize progress after each major tool execution
- Stay strictly within the scope boundary above

## Output Contract
{{output_contract}}

## Handoff Protocol
- Returns control to the caller on completion
- On failure, returns a one-line BLOCKED message with recommendation

## Trigger Tests
**Should invoke:**
- "Scaffold a new agent called `migration-reviewer` that audits Django migration files"
- "Create the agent file for a `changelog-generator` after reuse-checker approved it as NEW"

**Should NOT invoke:**
- "Create a new skill directory for API diffing"
- "Extend the existing code-reviewer agent with backend-specific rules"
```

## Outputs

Returns a path string:
```
/abs/path/to/.claude/agents/<name>.md
```
Plus a one-line summary: `Created agent <name> (N lines, M tools).`

The trigger-test placeholders are intentional — the human must fill them after reviewing the agent's actual scope. The skill flags this in its summary.

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
| Missing required field | `MISSING_FIELD: <n>` | Caller must provide and retry |
| Name collision | `NAME_COLLISION: <n>` | Caller must rename or use EXTEND path |
| >5 tools without justification | `TOOL_LIMIT_EXCEEDED` | Caller must justify or reduce |
| Filesystem write failure | `WRITE_FAILED: <reason>` | Caller checks permissions and retries |
| Template render mismatch | `RENDER_FAILED: <field>` | Indicates malformed input; fix and retry |

## Token Budget

- This skill body: ~140 lines (well under 500)
- Generated agent files: typically 60–150 lines
- Per-invocation cost: ~1.5K input tokens, ~1.5K output tokens
