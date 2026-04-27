---
name: pipeline-conventions
description: Canonical reference for all document-pipeline agents in the Hersa project. Defines the pre-flight validation protocol, standard operating rules, and the blocking tag vocabulary shared across process-analyst, process-optimizer, systems-analyst, pm-writer, and prd-writer.
version: 1.0.0
when_to_use:
  - Any document-pipeline agent needs to validate its input file before proceeding
  - A pipeline agent is being authored or updated and needs the shared operating rules
  - A new pipeline stage is being added that must participate in the blocking tag protocol
---

## When NOT to Use

- For agents outside the document pipeline (e.g., django-developer, react-developer, code-reviewer)
- As a substitute for agent-specific details: each agent still owns its own tag list, BLOCKED recommendation text, and output section structure
- For general code-quality or security linting (use component-linter or security-auditor instead)

## How to Include This Skill

Add the following line to any pipeline agent's frontmatter include block, directly after `@.claude/shared/hersa-context.md`:

```
@.claude/skills/pipeline-conventions/SKILL.md
```

Then, in the agent's System Prompt, replace duplicated protocol prose with a single reference line:

> "Follow the pre-flight validation protocol and standard operating rules defined in `pipeline-conventions`."

Keep in the agent file only what is agent-specific: which tags to scan for, the BLOCKED recommendation pointing to the correct upstream agent, and the unique output section structure.

---

## Protocol 1 — Pre-flight Validation

Run this protocol as the mandatory first step, before any analysis or writing.

**Step 1 — Verify input file exists.**
Use Glob to confirm the required input file is present at the declared path.
If not found, stop immediately and return:

```
BLOCKED: Input file not found at <path>.
```

**Step 2 — Scan for blocking annotation tags.**
Read the entire file and search for every blocking tag that the agent is responsible for scanning (see Tag Vocabulary below; each agent declares its own relevant tags in its Input Contract).

**Step 3 — Block if any tags are found.**
If ANY blocking tags are found, stop immediately and return the standard BLOCKED response. Do not perform any analysis.

**Standard BLOCKED response format:**

```
BLOCKED: Input document contains N unresolved [TAG] item(s).
ITEMS FOUND:
  1. [TAG: <verbatim text from document>]
  2. ...
ACTION REQUIRED: Resolve all items in <input-file-path>, then re-invoke.
```

The agent appends its own recommendation text after `ACTION REQUIRED` (e.g., which upstream agent to re-invoke). This is agent-specific and must not be generalized here.

---

## Protocol 2 — Standard Operating Rules

Every pipeline agent follows these rules during execution:

- **Grep-first discovery** — before reading large files, use Glob or Grep to locate and confirm paths; never assume a file exists
- **Artifact paths only** — never pass inline content larger than 50 lines between steps; always pass file paths
- **Progress summaries** — after each major analysis step or tool execution, write a one-line progress note
- **Stay in scope** — never touch files outside the agent's declared scope boundary
- **Output path** — all pipeline output goes to `documentation/company_analysis/`

---

## Protocol 3 — Blocking Tag Vocabulary

This is the canonical list of annotation tags used across the pipeline. Each agent scans only for the tags relevant to its stage (declared in the agent's own Input Contract).

| Tag | Meaning | Set by | Scanned by |
|-----|---------|--------|------------|
| `[AMBIGUO: ...]` | Ambiguous information in the as-is document | `process-analyst` | `process-optimizer` |
| `[FALTA INFO: ...]` | Missing critical information needed to proceed | `process-analyst` | `process-optimizer` |
| `[NECESITA CONTEXTO: ...]` | Business context needed to make a design decision | `process-optimizer` | `systems-analyst` |
| `[RIESGO LEGAL: ...]` | Potential legal or regulatory risk flagged during optimization | `process-optimizer` | informational only — no agent blocks on this tag |
| `[BLOCKER: ...]` | Ambiguity that prevents implementation from starting | `systems-analyst` | `pm-writer`, `prd-writer` |

**Rules for using tags:**

- Tags are written inline in the document at the point of ambiguity.
- A tag is considered resolved when it is removed from the document by the responsible human or upstream agent.
- Pipeline agents MUST NOT silently skip, ignore, or override tags — any tag in their scan list triggers the BLOCKED response.
- The `[RIESGO LEGAL]` tag is surfaced in the output contract summary but does not block any downstream agent.

---

## Inputs

```
{
  "input_file_path": "<abs path to input document>",
  "blocking_tags": ["<TAG_NAME>", ...]   // declared per-agent; from the vocabulary above
}
```

## Outputs

This is a reference skill — it does not write files. It defines the protocol that pipeline agents execute. The agent using this skill writes its own output to `documentation/company_analysis/`.

## Failure Modes

| Condition | Return code | Recovery |
|---|---|---|
| Input file not found | `BLOCKED: Input file not found at <path>.` | Ensure the upstream agent has completed and saved its output |
| Blocking tags found | `BLOCKED: Input document contains N unresolved [TAG] item(s).` | Resolve all listed items in the input file, then re-invoke |
| Tag not in vocabulary | n/a — unknown tags are ignored by this protocol | Add the tag to this vocabulary table and update all affected agents |

## Token Budget

- This skill body: ~130 lines
- Per-invocation cost: ~1,200 tokens (loaded once per pipeline agent invocation)

## Trigger Tests

**Should invoke:**
- Any pipeline agent (process-optimizer, systems-analyst, pm-writer, prd-writer) performs its pre-flight check
- A new pipeline agent is being authored and needs the shared blocking-tag protocol

**Should NOT invoke:**
- `django-developer`, `react-developer`, `code-reviewer`, or any non-pipeline agent
- When the user asks a one-off question that does not involve a pipeline document
