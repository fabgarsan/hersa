---
description: Audit the quality of the Claude Code configuration — CLAUDE.md files, agents, skills, shared context, and token efficiency. Produces a scored report with PASS/WARN/FAIL per check and actionable recommendations.
model: claude-sonnet-4-6
---

You are auditing the Claude Code configuration for the Hersa project. Your job is to detect drift, broken references, redundancy, and token inefficiency before they silently degrade agent quality.

## Step 1 — Collect all files

Read every file in these locations:

```
CLAUDE.md (root)
frontend/CLAUDE.md
backend/CLAUDE.md
.claude/agents/*.md        (all agents)
.claude/skills/*.md        (all skills)
.claude/shared/*.md        (all shared files)
.claude/commands/*.md      (all commands)
```

Use `Glob` to list files, then `Read` each one. Do not skip any file.

Also run:
```bash
wc -w CLAUDE.md frontend/CLAUDE.md backend/CLAUDE.md
wc -w .claude/agents/*.md
wc -w .claude/skills/*.md
```

---

## Step 2 — Run checks

For each check, assign one of: ✅ PASS · ⚠️ WARN · ❌ FAIL

### A. Word count — always-loaded files

These files are loaded at the start of every session. Every word costs tokens on every run.

| File | WARN threshold | FAIL threshold |
|------|---------------|---------------|
| `CLAUDE.md` (root) | > 550 words | > 700 words |
| `frontend/CLAUDE.md` | > 1.600 words | > 2.000 words |
| `backend/CLAUDE.md` | > 1.000 words | > 1.300 words |

### B. Reference integrity

For every agent and CLAUDE.md file:
1. Find every `@path` directive — verify the file exists on disk.
2. Find every explicit path reference like `.claude/skills/X.md` — verify the file exists.
3. Find every skill name mentioned in a "Skills — load on demand" table — verify the file exists in `.claude/skills/`.
4. Find every agent name referenced in `workflow.md` — verify the file exists in `.claude/agents/`.

Report each broken reference individually as ❌ FAIL.

### C. Agent frontmatter completeness

Each agent file must have ALL of: `name`, `description`, `model`, `tools` in its YAML frontmatter.

Missing any field → ❌ FAIL per agent.

### D. Shared business context

These agents MUST contain `@.claude/shared/hersa-context.md`:
`architect`, `django-developer`, `react-developer`, `prd-writer`, `pm-discovery`, `tdd-writer`, `security-auditor`

Missing → ❌ FAIL per agent.

### E. Read-only agent tool constraints

These agents must NOT have `Write` or `Edit` in their tools:
`code-reviewer`, `security-auditor`, `architect`, `adr-writer`

Having Write or Edit → ❌ FAIL per agent.

### F. Pipeline hard-stops

- `tdd-writer` must contain language that stops execution if no PRD is provided (look for "stop", "Verify you have a PRD", or step 0 guard).
- `prd-writer` must contain language that stops execution if no discovery brief exists (look for "stop", "Verify you have a discovery brief", or step 0 guard).

Missing → ❌ FAIL per agent.

### G. Workflow quality

- `workflow.md` must have a flow selector table or decision tree at the top (look for "Pick your flow" or similar).
- `workflow.md` must have entry guards for each flow (look for "Entry guard").
- `workflow.md` must include an `adr-writer` step or reference.

Missing any → ⚠️ WARN per item.

### H. Content hygiene — eliminated anti-patterns

Look for these patterns that degrade token efficiency. Each found → ⚠️ WARN:

- A `✅ Do / ❌ Don't` table in any CLAUDE.md file (these should have been removed — they duplicate Mandatory Rules).
- References to `django-conventions.md`, `react-conventions.md`, or `mui-conventions.md` in agents or CLAUDE.md files, pointing to files that do NOT exist in `.claude/skills/` (broken legacy references).
- Django code pattern blocks (`class.*Model.*:`, `class.*View.*APIView`, `class.*Serializer.*:`) inside `backend/CLAUDE.md` — these belong in `backend-conventions.md` skill.

### I. Skill header format

Each skill file should have the standard header:
```
> **Agents:** ...
> **Load when:** ...
> **Summary:** ...
```

Missing header in any skill → ⚠️ WARN per file.

### J. Model assignment sanity

Check that model assignments follow the project's cost/complexity rationale:
- `claude-haiku-*`: code-reviewer, docs-writer, adr-writer, and commands — mechanical, structured tasks.
- `claude-sonnet-*`: architect, django-developer, react-developer, prd-writer, pm-discovery, security-auditor, test-writer — main implementation work.
- `claude-opus-*`: tdd-writer — complex synthesis across PRD + codebase + conventions.

Any deviation from this assignment → ⚠️ WARN with justification required.

---

## Step 3 — Score

Start at **10.0**.

- Each ❌ FAIL: **−0.5 points**
- Each ⚠️ WARN: **−0.25 points**
- Floor: 0.0

---

## Step 4 — Report

Output the report in this exact format:

```
# Claude Code Config Audit — Hersa
Date: [today]

## Word counts (always-loaded)
  CLAUDE.md (root)      NNN words   [✅/⚠️/❌]
  frontend/CLAUDE.md    NNN words   [✅/⚠️/❌]
  backend/CLAUDE.md     NNN words   [✅/⚠️/❌]

## Check results

### A. Word count
  ✅/⚠️/❌ [result]

### B. Reference integrity
  ✅/⚠️/❌ [result — list each broken reference if any]

### C. Agent frontmatter
  ✅/⚠️/❌ [result — list each agent with issues if any]

### D. Shared business context
  ✅/⚠️/❌ [result]

### E. Read-only constraints
  ✅/⚠️/❌ [result]

### F. Pipeline hard-stops
  ✅/⚠️/❌ [result]

### G. Workflow quality
  ✅/⚠️/❌ [result]

### H. Content hygiene
  ✅/⚠️/❌ [result]

### I. Skill headers
  ✅/⚠️/❌ [result]

### J. Model assignment
  ✅/⚠️/❌ [result]

---

## Score: N.N / 10

## Top recommendations
1. [Most impactful fix — one sentence]
2. [Second most impactful]
3. [Third]

## No issues found in
  [List checks that passed cleanly]
```

Be specific in failures: name the exact file and line where possible, and state what needs to change. Do not pad with praise for passing checks.
