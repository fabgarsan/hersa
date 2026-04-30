---
description: Audit the quality of the Claude Code configuration — CLAUDE.md files, agents, skills, shared context, and token efficiency. Produces a scored report with PASS/WARN/FAIL per check and actionable recommendations.
model: sonnet
kb_version: "2026-04-29T00:00:00"
allowed-tools: Read Grep Glob Bash Write Edit
---

You are auditing the Claude Code configuration for the Hersa project. Your job is to detect drift, broken references, redundancy, token inefficiency, and missed feature adoption before they silently degrade agent quality.

---

## Pre-flight — KB version sync

```bash
grep "Última actualización" .claude/shared/claude-code-knowledge.md | head -1
```

Compare the `YYYY-MM-DDTHH:MM:SS` datetime extracted against the `kb_version` field in this file's frontmatter. **If they match:** proceed to Step 0. **If they differ:** read the full KB (all §1–9), use `Edit` to update check thresholds (§9.8), anti-patterns list (§9.4), required frontmatter fields (§2.2, §3.2, §3.3), and hook events (§5.5) in this file, use `Edit` to update `kb_version` in frontmatter, and prepend the audit report with `🔄 Self-updated kb_version [old → new]: [changes]`.

---

## Step 0 — Read the knowledge base (authoritative source)

Read `.claude/shared/claude-code-knowledge.md` in full before running any check.

Extract and hold in working memory:

| What to extract | Where in KB | Used in check |
|---|---|---|
| Required agent frontmatter fields | §3.3 "Requeridos" | C |
| Recommended agent frontmatter fields | §3.3 "Recomendado" | C, N |
| Complete agent frontmatter field list | §3.2 | C, N |
| Required skill frontmatter fields | §2.2 frontmatter table | I, K |
| Recommended skill frontmatter fields | §2.2 | I, K, N |
| Valid model aliases | §3.2 `model:` field options | J |
| CLAUDE.md line thresholds | §9.8 token budgets | A |
| Agent body line thresholds | §9.8 token budgets | A |
| Anti-patterns list | §9.4 | H |
| Feature adoption patterns | §3.5, §3.6, §9.3 | N |

**These KB-derived values override any hardcoded value in the checks below.** If the KB says a field is required and it's not in the check's list, the check still fails for missing that field.

---

## Step 1 — Collect all files

Read every file in these locations:

```
CLAUDE.md (root)
frontend/CLAUDE.md
backend/CLAUDE.md
.claude/agents/*.md              (all agents — flat files)
.claude/skills/*/SKILL.md        (all skills — subdirectory format)
.claude/shared/*.md              (all shared files)
.claude/commands/*.md            (all commands)
```

Use `Glob` with pattern `.claude/skills/*/SKILL.md` for skills — NOT `.claude/skills/*.md`.

Also run:
```bash
wc -l CLAUDE.md frontend/CLAUDE.md backend/CLAUDE.md
wc -l .claude/agents/*.md
wc -l .claude/skills/*/SKILL.md
wc -l ~/.claude/projects/-Users-fabiogarciasanchez-Documents-developments-hersa/memory/MEMORY.md
```

---

## Step 2 — Run checks

For each check: ✅ PASS · ⚠️ WARN · ❌ FAIL

### A. Line count — always-loaded files

**Use the thresholds from KB §9.8.** Do not use hardcoded values — read them from the KB in Step 0.

These files load at the start of every session; every line costs tokens on every run.

Apply KB §9.8 thresholds to each CLAUDE.md file. If KB §9.8 is not specific about frontend/backend subdirectory CLAUDE.md, apply the "subdirectory CLAUDE.md" row.

### B. Reference integrity

For every agent and CLAUDE.md file:
1. Find every `@path` directive — verify the file exists on disk.
2. Find every explicit path reference like `.claude/skills/X.md` or `.claude/shared/X.md` — verify the path exists. Skills are at `.claude/skills/<name>/SKILL.md`, not flat files.
3. Find every skill name in a "Skills — load on demand" or registry table — verify the directory `.claude/skills/<name>/` exists.
4. Find every agent name referenced in `pipeline-workflows.md` or `agents-registry.md` — verify the file exists in `.claude/agents/`.
5. Find any reference to `documentation/claude-code-architecture-guide.md` — this file was deleted; any remaining reference → ❌ FAIL.

Report each broken reference individually as ❌ FAIL.

### C. Agent frontmatter completeness

**Use the field list from KB §3.2 and §3.3 extracted in Step 0.**

Base required set (always applies):
- **KB §3.3 "Requeridos":** `name`, `description`
- **Project rule (CLAUDE.md):** `model`, `when_to_use`, `when_not_to_use`

Additionally: if KB §3.3 lists any field as "Requerido" that is not in the base set above, add it to the check automatically.

Scoring:
- Missing any required field → ❌ FAIL per agent
- `tools:` empty (inherits all tools) when `disallowedTools:` is also absent → ⚠️ WARN (no explicit tool restriction)
- Any KB §3.3 "Recomendado" field that the project has not adopted in any agent at all → ⚠️ WARN (one-time advisory, not per-agent)

### D. Shared business context

These agents operate on Hersa's business domain and MUST contain `@.claude/shared/hersa-context.md`:
`django-developer`, `react-developer`, `prd-writer`, `tdd-writer`, `pm-discovery`, `pm-writer`,
`security-auditor`, `qa-engineer`, `systems-analyst`, `brand-designer`, `ux-designer`, `ui-designer`,
`communications-writer`, `data-analyst`, `engineering-manager`, `legal-compliance-advisor`,
`release-manager`, `senior-ceo-advisor`

Missing → ❌ FAIL per agent.

### E. Read-only agent tool constraints

These agents must NOT have `Write` or `Edit` in their tools:
`code-reviewer`, `security-auditor`, `release-manager`

Having `Write` or `Edit` → ❌ FAIL per agent.

### F. Pipeline hard-stops

- `tdd-writer` must contain language that stops execution if no PRD is provided.
- `prd-writer` must contain language that stops execution if no discovery brief exists.

Missing → ❌ FAIL per agent.

### G. Workflow quality

- `pipeline-workflows.md` must have a flow selector table or decision tree.
- Must have entry guards per flow.
- Must include an `adr-writer` reference.

Missing any → ⚠️ WARN per item.

### H. Content hygiene — anti-patterns

**Use the anti-patterns list from KB §9.4 extracted in Step 0.** For each anti-pattern in that list, check if it appears in any config file.

Additionally check for these Hersa-specific hygiene issues:
- References to deleted `documentation/claude-code-architecture-guide.md` in any file → ❌ FAIL
- `✅ Do / ❌ Don't` tables in CLAUDE.md files → ⚠️ WARN
- References to `django-conventions.md`, `react-conventions.md`, `mui-conventions.md` pointing to non-existent files → ⚠️ WARN
- Django class pattern blocks inside `backend/CLAUDE.md` → ⚠️ WARN

Each found → ⚠️ WARN (or ❌ FAIL as noted).

### I. Skill frontmatter completeness

**Use the field list from KB §2.2 extracted in Step 0.**

Base required set:
- **KB §2.2 required fields** (extract from the frontmatter table)
- **Project rule:** `when_to_use`, `when_not_to_use`

Scoring:
- Missing any required field → ❌ FAIL per skill
- Missing `allowed-tools:` → ⚠️ WARN per skill
- Any KB §2.2 field that would materially improve a skill but isn't used anywhere → ⚠️ WARN (advisory)

### J. Model declaration — aliases only

**Use the valid model aliases from KB §3.2 extracted in Step 0** (currently `sonnet`, `haiku`, `opus`, `inherit`).

- Any agent or skill declaring a full model ID (e.g. `claude-sonnet-4-6`) instead of an alias → ⚠️ WARN
- Any agent or skill with no `model:` field → ❌ FAIL (project rule: explicit model is mandatory)

Expected complexity-based assignment (deviations need justification):

| Alias | Rationale |
|---|---|
| `haiku` | Mechanical, structured-output tasks: `code-reviewer`, `docs-writer`, `adr-writer` |
| `opus` | Complex multi-document synthesis: `tdd-writer`, `data-analyst` |
| `sonnet` | All other implementation and analysis work |

### K. `when_to_use` / `when_not_to_use` in skills

Each `.claude/skills/*/SKILL.md` must declare both `when_to_use` and `when_not_to_use`.

Missing either → ❌ FAIL per skill.

### L. Tool count — least-privilege compliance

For each agent with an explicit `tools:` list:
1. Count the number of tools.
2. If >5, check if there is an inline comment after each tool explaining why it is needed.
3. >5 tools without per-tool comments → ⚠️ WARN per agent.

Agents with empty `tools:` (inherits all) and no `disallowedTools:` → ⚠️ WARN.

### M. MEMORY.md size — truncation risk

MEMORY.md is loaded every session but truncated at **200 lines / 25 KB**.

| Lines | Result |
|---|---|
| ≤ 150 | ✅ PASS |
| 151–199 | ⚠️ WARN — approaching truncation; consolidate entries |
| ≥ 200 | ❌ FAIL — truncation active; entries beyond line 200 are invisible |

### N. Feature adoption gap (KB-driven)

**This check is the bridge between /sync-cc and /validate-config.** After the KB is updated, this check identifies which features the project hasn't adopted yet that could provide measurable benefit.

**Use the feature adoption patterns from KB §3.5, §3.6, and §9.3 extracted in Step 0.**

Check the following patterns — each gap is ⚠️ WARN:

**N1 — `memory: project` for accumulating agents**
Review KB §3.6. Agents that perform review, audit, or data analysis work benefit from persistent memory. Check if `code-reviewer`, `security-auditor`, and `data-analyst` declare `memory: project`. Missing → ⚠️ WARN per agent.

**N2 — `paths:` for domain-specific skills**
Review KB §2.2. Skills whose names suggest a specific domain (contains `ui`, `frontend`, `backend`, `django`, `react`, `css`, `mui`) should have `paths:` to avoid loading when not relevant. Missing `paths:` → ⚠️ WARN per skill.

**N3 — `context: fork` for exploration/review skills**
Review KB §2.6. Skills that explore code, review output, or do deep research without modifying files benefit from `context: fork`. Check if any such skills (e.g. `simplify`, `review`, `*-linter`, `*-checker`) use `context: fork`. Missing → ⚠️ WARN per skill.

**N4 — Unrecognized KB features**
After Step 0, check if KB §3.3 lists any "Recomendado" or "Nuevo en 2025" field that no agent in the project uses at all. If so, list those fields as unexplored opportunities → ⚠️ WARN (one advisory item, not per-agent).

---

## Step 3 — Score

Start at **10.0**.

- Each ❌ FAIL: **−0.5 points**
- Each ⚠️ WARN: **−0.25 points**
- Floor: 0.0

Check N (feature adoption) WARNs cost half: **−0.1 points** each — they are opportunities, not defects.

---

## Step 4 — Report

```
# Claude Code Config Audit — Hersa
Date: [today]
KB version: [date from knowledge base header]

## Line counts (always-loaded)
  CLAUDE.md (root)      NNN lines   [✅/⚠️/❌]  (KB threshold: WARN >N, FAIL >N)
  frontend/CLAUDE.md    NNN lines   [✅/⚠️/❌]
  backend/CLAUDE.md     NNN lines   [✅/⚠️/❌]

## Check results

### A. Line count
  ✅/⚠️/❌ [result — thresholds applied from KB §9.8]

### B. Reference integrity
  ✅/⚠️/❌ [result — list each broken reference]

### C. Agent frontmatter
  ✅/⚠️/❌ [result — list each agent with issues; note any new KB-required fields]

### D. Shared business context
  ✅/⚠️/❌ [result]

### E. Read-only constraints
  ✅/⚠️/❌ [result]

### F. Pipeline hard-stops
  ✅/⚠️/❌ [result]

### G. Workflow quality
  ✅/⚠️/❌ [result]

### H. Content hygiene
  ✅/⚠️/❌ [result — list anti-patterns found]

### I. Skill frontmatter
  ✅/⚠️/❌ [result — list each skill with issues; note KB-recommended fields not yet used]

### J. Model declaration
  ✅/⚠️/❌ [result — list any full model IDs found]

### K. when_to_use / when_not_to_use in skills
  ✅/⚠️/❌ [result]

### L. Tool count (least-privilege)
  ✅/⚠️/❌ [result — list agents with >5 tools or empty tools:]

### M. MEMORY.md size
  ✅/⚠️/❌ [NNN lines]

### N. Feature adoption gap
  N1 memory:project     ✅/⚠️ [list agents missing it]
  N2 paths: in skills   ✅/⚠️ [list skills missing it]
  N3 context:fork       ✅/⚠️ [list skills that could benefit]
  N4 unexplored fields  ✅/⚠️ [list KB fields no agent uses yet]

---

## Score: N.N / 10
  (FAILs: N × −0.5 | WARNs A–M: N × −0.25 | WARNs N: N × −0.1)

## Top recommendations
1. [Most impactful fix — one sentence, cite the check]
2. [Second most impactful]
3. [Third]

## Feature adoption opportunities
  [List Check N items that would improve efficiency — separate from defects]

## No issues found in
  [List checks that passed cleanly]
```

**KB version mismatch warning:** If the KB `Última actualización` date is more than 30 days old, add at the top of the report:
```
⚠️  KB is N days old — run /sync-cc to fetch latest Claude Code updates before trusting this audit.
```

Be specific in failures: name the exact file and field. Do not pad with praise for passing checks.
