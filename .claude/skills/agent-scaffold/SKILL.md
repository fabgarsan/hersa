---
name: agent-scaffold
description: Generates a new agent file at .claude/agents/<n>.md following Claude Code best practices and the 2.1+ frontmatter spec. Use when a new agent has been approved by the reuse-decision step. Do not use for skill generation, for modifying existing agents, or for application code.
version: 1.1.0
model: sonnet
allowed-tools: Read Write Edit Glob
when_to_use:
  - A new agent (not an extension) is being created
  - The capability has passed the reuse-decision check
  - The orchestrator (component-factory) has determined kind=agent
when_not_to_use:
  - Modifying or rewriting an existing agent (manual review required)
  - Generating skills (use skill-scaffold instead)
  - One-off prompting needs (recommend inline prompting)
  - Capability not yet approved by reuse-checker
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
  "project_root": "<path>",                   // required
  "model": "<model>",                       // required (e.g. sonnet)
  "advanced_fields": {                         // optional (Claude Code 2.1+)
    "skills": ["<skill-name>", ...],           // preload skills in subagent context
    "memory": "user|project|local",            // persistent memory scope
    "isolation": "worktree",                   // sandboxed copy of repo
    "permissionMode": "default|acceptEdits|plan|auto|dontAsk|bypassPermissions",
    "disallowedTools": ["<tool>", ...],        // denylist over inherited tools
    "effort": "low|medium|high|xhigh|max",
    "color": "red|blue|green|yellow|purple|orange|pink|cyan",
    "background": true|false,
    "initialPrompt": "<auto-submit prompt>",
    "maxTurns": <int>,
    "hooks": { ... },                          // lifecycle hooks (PreToolUse, Stop, etc.)
    "mcpServers": [ ... ]                       // scoped MCP servers (inline or by ref)
  }
}
```

Required fields are mandatory. If any are missing, fail fast with `MISSING_FIELD: <name>` and do not generate. `advanced_fields` is optional — only include keys the caller wants populated; omitted keys do NOT appear in the rendered frontmatter.

## Procedure

1. **Validate name** — must match `^[a-z]+(-[a-z]+)+$` and not collide with existing files in `<project_root>/.claude/agents/`. On collision: return `NAME_COLLISION: <n>`.

2. **Validate tool list** — must be ≤5 tools unless explicit justification provided per tool. Each tool gets a one-line `# justification:` comment in the frontmatter.

3. **Validate `model:`** — required field. Reject if absent. Acceptable values: `sonnet`, `opus`, `haiku`, not full model ID (e.g., `claude-sonnet-4-6`), or `inherit`.

4. **Validate `advanced_fields` (if provided):**
   - `memory` ∈ {`user`, `project`, `local`}
   - `permissionMode` ∈ {`default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`}
   - `effort` ∈ {`low`, `medium`, `high`, `xhigh`, `max`}
   - `color` ∈ {`red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`}
   - `isolation` ∈ {`worktree`}
   - `skills` must be an array of strings; reject if any name doesn't exist under `<project_root>/.claude/skills/`
   - On invalid value: return `INVALID_FIELD: <field>=<value>`

5. **Render the file** using the template in `templates/agent.md.tpl` (below). Substitute all fields. Do not add fields not in the template. Omit `advanced_fields` keys not provided by the caller — never emit empty/`null` values.

6. **Write atomically** — write to `<project_root>/.claude/agents/<name>.md.tmp`, then rename. Prevents partial files on failure.

7. **Return** the absolute path of the created file plus a one-line summary.

## Template (inline)

```
---
name: {{name}}
description: {{purpose}}
tools: [{{tools}}]
model: {{model}}
version: 0.1.0
# --- Optional Claude Code 2.1+ fields (only emitted when caller provides them) ---
# skills: [{{skills}}]                    # preload skills in subagent context
# memory: {{memory}}                      # user|project|local
# isolation: {{isolation}}                # worktree
# permissionMode: {{permissionMode}}      # default|acceptEdits|plan|auto|dontAsk|bypassPermissions
# disallowedTools: [{{disallowedTools}}]
# effort: {{effort}}                      # low|medium|high|xhigh|max
# color: {{color}}
# background: {{background}}              # bool
# initialPrompt: {{initialPrompt}}
# maxTurns: {{maxTurns}}
# hooks: { ... }
# mcpServers: [ ... ]
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
| Invalid advanced field value | `INVALID_FIELD: <field>=<value>` | Caller must use a value in the allowed set |
| Referenced skill does not exist | `SKILL_NOT_FOUND: <skill-name>` | Caller must create the skill first or remove from `skills:` |
| Filesystem write failure | `WRITE_FAILED: <reason>` | Caller checks permissions and retries |
| Template render mismatch | `RENDER_FAILED: <field>` | Indicates malformed input; fix and retry |

## Token Budget

- This skill body: ~140 lines (well under 500)
- Generated agent files: typically 60–150 lines
- Per-invocation cost: ~1.5K input tokens, ~1.5K output tokens
