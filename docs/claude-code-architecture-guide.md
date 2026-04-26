# Claude Code: Architecture & Optimization Reference

**Version:** 1.0 — Merged & Refined Edition
**Scope:** `CLAUDE.md`, Agents, Skills, and their interactions in the Claude Code ecosystem
**Audience:** Engineers designing token-efficient, modular, agent-based workflows

---

## Mental Model (read this first)

| Layer | Role | Lifecycle | Lives in |
|---|---|---|---|
| **CLAUDE.md** | **Policy** — project constitution, always in context | Persistent across sessions | Repo root (and subdirs for overrides) |
| **Agents** | **Workers** — specialized executors for bounded tasks | Instantiated per task | `.claude/agents/` |
| **Skills** | **Tools / Procedures** — reusable know-how loaded on trigger | Loaded on demand | `.claude/skills/<name>/SKILL.md` |

**Execution flow:**
1. CLAUDE.md defines rules and registers available components
2. Main Claude (or orchestrator agent) receives a task
3. Agent is selected (or main thread acts directly) based on scope match
4. Agent loads only the skills its trigger conditions match
5. Skills execute deterministic procedures and return artifacts
6. Agent composes the final output and hands back control

---

## 1. CLAUDE.md Specification

### 1.1 Must Include
- **Project identity** — name, purpose, domain in 1–2 lines
- **Tech stack** — languages, frameworks, runtime versions (e.g., `Next.js 14 (App Router), TypeScript 5.4, Node 20`)
- **Build / test / run commands** — exact CLI invocations Claude can execute
- **Code conventions** — style, formatting, naming rules specific to the repo
- **Directory map** — only non-obvious paths; skip standard scaffolding
- **Do-not-touch list** — generated files, vendored code, secrets paths
- **Agent registry** — table of available agents with one-line scope
- **Skill registry** — table of available skills with one-line trigger summary

### 1.2 Should Include (for optimal performance)
- **Workflow rules** — branch strategy, commit format, PR conventions
- **Testing protocol** — unit/integration/e2e commands, coverage expectations
- **Domain glossary** — 5–15 project-specific terms, one-line definitions
- **Known pitfalls** — gotchas, flaky areas, deprecated patterns
- **Environment assumptions** — required env vars, services, ports
- **Token-budget guidance** — explicit per-task ceilings if relevant
- **`.claudeignore` reference** — point to the ignore file; do not duplicate its contents

### 1.3 Token Efficiency Best Practices
- **Target under 2,000 tokens; hard ceiling 5,000.** Real-world line count: 100–300 lines is healthy; >500 means split.
- **Imperative voice** — "Run `pnpm test`" not "You should run pnpm test"
- **Link, don't inline** — reference `docs/architecture.md`, do not paste it
- **No prose paragraphs** — bullets, tables, and code blocks only
- Strip motivation and rationale unless behavior-changing
- Use `@path/to/file` imports for shared rules across monorepos
- **Reference file paths instead of pasting boilerplate** — e.g., `See /docs/templates/api.ts for pattern`
- Audit quarterly; delete stale entries aggressively

### 1.4 Structural Patterns
- Fixed section order: `Project` → `Stack` → `Commands` → `Conventions` → `Structure` → `Agent Registry` → `Skill Registry` → `Pitfalls`
- **H2 headers only**; nest with bullets, not deeper headings
- One fact per bullet; no compound statements
- **Hierarchical CLAUDE.md** — root for global rules; subdirectory files for local overrides (e.g., `apps/web/CLAUDE.md` adds frontend-specific rules)
- Mark immutable rules with `MUST` / `NEVER`; preferences with `PREFER`
- Use fenced code blocks for commands; plain text everywhere else

### 1.5 The `.claudeignore` Companion
- **Always create one alongside CLAUDE.md.** Without it, indexing wastes tokens on irrelevant files.
- **Always exclude:** `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `coverage/`, lockfiles, binary assets, generated code, large fixtures
- Treat `.claudeignore` as part of the policy layer; review it whenever CLAUDE.md changes

---

## 2. Agent Design

### 2.1 Core Components
- **Identity block** — name, single-sentence purpose, scope boundary
- **Trigger conditions** — explicit `use when` AND `do not use when` (both mandatory)
- **Tool allowlist** — minimum tools required, one-line justification per tool (least privilege)
- **System prompt** — role, constraints, output contract
- **Input contract** — expected parameters, types, format
- **Output contract** — structure, format, success/failure signals
- **Handoff protocol** — how the agent returns control or delegates
- **Boundary statement** — what the agent must NOT touch (prevents scope creep and unnecessary file reads)

### 2.2 Modularity & Specialization Principles
- **One agent, one responsibility.** If you describe it with "and," split it.
- **Vertical slice** — agent owns a complete narrow capability end-to-end
- **No shared mutable state** between agents; pass data explicitly via artifacts
- **Stateless by default**; persist only via explicit files in a known scratch path
- **Composition over inheritance** — an orchestrator agent coordinates specialists; specialists do not call each other
- **Senior-engineer persona** — frame the agent as a domain expert; this empirically yields more concise, correct output and fewer iteration cycles

### 2.3 Token Minimization Techniques
- **Lazy context loading** — fetch files only when needed, never preemptively
- **Grep-first strategy** — `rg`/`grep` to locate code before reading; never read whole files when a snippet suffices
- **Surgical edits** — prefer `sed`/`awk`/structured edit tools over rewriting whole files in the buffer
- **Structured summaries** — return a digest, not raw tool output
- **Scratchpad files** for long intermediate work, not conversation memory
- **Truncate tool results** before reasoning over them
- **Cache invariants** (schemas, conventions) in skill files, not in every prompt
- Set explicit max-token budgets per subtask

### 2.4 Context Management Strategies
- **Context budget tiers** — *critical* (always loaded), *relevant* (loaded on match), *archival* (referenced only)
- Use **subagents** to isolate exploration from the main thread (keeps the parent context clean)
- Compact / summarize at predictable checkpoints, not reactively
- **Pass artifact paths, not artifact contents,** between agents
- **State-awareness checkpoint** — after every major tool execution, summarize progress before continuing; prevents context drift
- Reset context between unrelated tasks; never reuse polluted threads

### 2.5 Split vs Merge Decisions
- **Split when:** distinct toolsets, different failure modes, separate review criteria, or context exceeds ~30% of the window
- **Merge when:** agents are always invoked together, share >70% of context, and handoff overhead exceeds the work done
- **Never split** purely along file or module lines — split by *capability*, not by *location*
- **Default bias: do not add an agent.** Promote to agent only after the same orchestration pattern repeats ≥3 times manually.

---

## 3. Skill Design

### 3.1 Required Structure
A skill is a directory containing `SKILL.md` plus optional bundled assets:

```
.claude/skills/<skill-name>/
├── SKILL.md          # required
├── scripts/          # deterministic helpers (preferred over LLM reasoning)
├── templates/        # reusable patterns
├── examples/         # progressive-disclosure references
└── references/       # deeper docs loaded on demand
```

`SKILL.md` must contain:
- **YAML frontmatter** — `name`, `description`, `version`, `when_to_use`
- **Description** under 1024 characters; includes triggers AND exclusions
- **Procedural body** — steps, not narrative
- **Interface contract** — declared inputs, outputs, side effects
- **Failure modes** — what to do when preconditions fail

### 3.2 Reusability & Composability Guidelines
- **Stateless and idempotent** — same inputs produce same outputs
- **Single purpose** — one transformation or workflow per skill
- **Atomic outcome** — one skill = one outcome (e.g., `generate-unit-test`, not `test-and-deploy`)
- **Parameterize** environment-specific values; never hardcode paths or credentials
- Expose **scripts** for deterministic work; reserve LLM reasoning for judgment calls
- **Composable I/O** — output of one skill is valid input to another
- **No skill-to-skill calls** — let the agent orchestrate

### 3.3 Token-Efficient I/O
- **Inputs accept paths or IDs**, not file contents
- **Outputs return paths plus a brief summary** (the diff or a success signal, not the full operation log)
- **Input validation** — pre-check that required files/conditions exist before running logic
- Keep `SKILL.md` under **500 lines**; offload examples to `examples/`
- **Progressive disclosure** — `SKILL.md` links to deeper docs that load only when referenced
- Provide a `scripts/` directory so Claude *executes* code rather than *reasons through* it

### 3.4 Create New vs Reuse Existing
| Situation | Action |
|---|---|
| Existing skill covers ≥80% of need | **Extend it** |
| Distinct trigger, distinct output shape, or distinct domain | **Create new** |
| One-off task | **Inline prompt only — do not create a skill** |
| Used ≥3 times across sessions | **Promote to skill** |
| Wraps a single CLI call with no added logic | **Do not create — use the CLI directly** |

---

## 4. System Relationships

### 4.1 Relationship Model

```
┌──────────────────┐
│   CLAUDE.md      │  Policy (always in context)
│   + .claudeignore│
└────────┬─────────┘
         │ rules + registry
         ▼
┌──────────────────┐
│   Agent(s)       │  Workers (instantiated per task)
└────────┬─────────┘
         │ loads on trigger match
         ▼
┌──────────────────┐
│   Skill(s)       │  Procedures (deterministic, stateless)
└──────────────────┘
```

### 4.2 Data & Responsibility Flow
1. User submits a request
2. Main Claude reads CLAUDE.md (policy + registries)
3. Main Claude routes to an agent — or acts directly if no specialized agent applies
4. Agent matches trigger conditions and loads relevant skills
5. Skill executes; returns artifact path + summary
6. Agent composes the final response and hands control back

### 4.3 Dependency Management
- **Skills declare prerequisites** in frontmatter; agents check before invoking
- **Pin tool versions** in CLAUDE.md commands section
- **No circular references** — skills must never reference agents
- **Registry pattern** — a single index file (or section) lists every agent and skill with triggers; this is the only place lookups happen

### 4.4 Avoiding Redundancy & Token Waste
- **Conventions live in CLAUDE.md only** — agents and skills *reference*, never duplicate
- **Procedural steps live in skills only** — agents reference them
- **Role and scope live in the agent definition only**
- **DRY rule**: if a fact appears in two places, extract it to the highest layer it applies to
- **Never embed full skill content in CLAUDE.md** — register and link instead

---

## 5. Additional Critical Considerations

### 5.1 Naming Conventions
- **Agents:** `kebab-case` verb-noun → `review-pr`, `migrate-schema`, `triage-bug`
- **Skills:** `kebab-case` noun → `docx`, `api-contract-test`, `release-notes`
- Names must be unambiguous from the name alone; avoid clever abbreviations
- Domain-prefix when collisions are possible: `frontend-lint`, `backend-lint`

### 5.2 Versioning
- **Semantic version** in skill/agent frontmatter (`version: 1.2.0`)
- **Breaking changes** require a name suffix during transition (`migrate-schema-v2`)
- Maintain `CHANGELOG.md` per skill/agent if shared across projects
- Pin consumed skill versions in agent configs when stability matters

### 5.3 Testing & Validation
- **Each skill needs trigger tests** — 2 prompts that *should* invoke it, 2 that should *not*
- **Each agent needs golden-path AND failure-path** scenarios
- **Token-cost regression check** — measure tokens per invocation; flag regressions >20%
- **Lint CLAUDE.md in CI** — enforce length ceiling, dead-link checks, stale-command detection
- **Validate I/O contracts** — reject invocations with malformed inputs early

### 5.4 Scaling Strategies
- **Start minimal** — one CLAUDE.md, zero custom agents/skills. Add only on repeated need.
- **Promotion ladder:** prompt pattern → skill (after 3+ uses) → agent (after recurring orchestration)
- **Split monolithic CLAUDE.md** into hierarchical files when it exceeds ~300 lines
- **Add specialization, not complexity** — new agents should reduce orchestrator load, not duplicate it
- **Periodically reset long-running threads** — when a conversation context gets polluted across unrelated tasks, start fresh rather than fight the noise

### 5.5 Anti-Patterns to Avoid
- **Kitchen-sink CLAUDE.md** — documentation dump instead of operational rules
- **God agent** — one agent that "does everything"
- **Skill sprawl** — many overlapping skills with vague triggers
- **Implicit triggers** — components without explicit `when_to_use` and `do_not_use_when`
- **Context smuggling** — passing large blobs between agents instead of artifact paths
- **Premature abstraction** — building agents/skills before validating the workflow manually
- **Prompt-in-prompt** — embedding full skill content inside CLAUDE.md
- **Tool over-grant** — giving agents tools "just in case"
- **Skill-as-shell-alias** — wrapping a single shell command in a skill with no added logic
- **Agent-to-agent chaining without artifacts** — every handoff must be via concrete files, not implicit context

---

# 🔥 Meta-Prompt: Agent & Skill Generator

> **Reusable prompt — copy, paste, replace `{{TASK}}` and `{{PROJECT_CONTEXT}}`, run.**

```
You are a Claude Code architecture generator. Produce specialized agents,
skills, and supporting CLAUDE.md fragments for the following capability:

CAPABILITY: {{TASK}}
PROJECT CONTEXT: {{PROJECT_CONTEXT_OR_"none"}}
EXISTING ASSETS: {{LIST_EXISTING_AGENTS_SKILLS_OR_"none"}}

═══════════════════════════════════════════════════════════════
HARD CONSTRAINTS — violating any voids the output
═══════════════════════════════════════════════════════════════
1. SPECIALIZATION: Each agent/skill has ONE responsibility. If its
   description requires "and" to connect duties, split it.
2. SCOPE BOUNDARY: Every component declares explicit "use when" AND
   "do not use when". Both are mandatory.
3. TOKEN BUDGET:
   - SKILL.md ≤ 500 lines; description ≤ 1024 chars
   - Agent system prompt ≤ 200 lines
   - CLAUDE.md additions ≤ 30 lines per capability
   - No prose paragraphs; bullets, tables, and code blocks only
4. LEAST PRIVILEGE: Agents declare the minimum tool set required.
   Justify each tool in one line. No "just in case" inclusions.
5. STATELESS & IDEMPOTENT: Skills accept inputs, return outputs, no
   hidden state. Agents persist intermediate work to files, not memory.
6. NO CROSS-CALLING: Skills must not invoke agents. Agents may load
   skills. No circular dependencies.
7. PATHS NOT BLOBS: I/O between components passes file paths or IDs,
   never embedded content >50 lines.
8. REUSE FIRST: If an existing asset covers ≥80% of the need, EXTEND
   it instead of creating new. Output a "reuse decision" log entry.
9. NO PREMATURE ABSTRACTION: Do not generate a component for a single
   one-off use case; recommend inline prompting instead.
10. GREP-FIRST + SURGICAL EDITS: Agent prompts must instruct use of
    `rg`/`grep` for discovery and `sed`/`awk`/structured edits for
    modification rather than reading or rewriting whole files.

═══════════════════════════════════════════════════════════════
REQUIRED OUTPUT (in this exact order)
═══════════════════════════════════════════════════════════════

1. REUSE DECISION
   - Reviewed existing assets: [list]
   - Decision: NEW | EXTEND <name> | INLINE
   - One-line justification

2. ARCHITECTURE PLAN
   - Components to create (agent | skill | CLAUDE.md fragment)
   - Trigger conditions for each
   - Data flow (text diagram, ≤10 lines)

3. SKILL FILES (if any)
   For each skill, output:
   --- FILE: .claude/skills/<name>/SKILL.md ---
   ---
   name: <kebab-case>
   description: <triggers + exclusions, ≤1024 chars>
   version: 0.1.0
   when_to_use: <bullet list>
   ---
   ## When NOT to Use
   ## Inputs (paths/IDs only)
   ## Procedure
   ## Outputs (paths + summary)
   ## Failure Modes

4. AGENT FILES (if any)
   For each agent, output:
   --- FILE: .claude/agents/<name>.md ---
   ---
   name: <kebab-case-verb-noun>
   description: <one sentence>
   tools: [<minimum set, justified>]
   version: 0.1.0
   ---
   ## Scope & Boundary (must NOT touch: ...)
   ## Use When / Do Not Use When
   ## Input Contract
   ## System Prompt (senior-engineer persona)
   ## Output Contract
   ## Handoff Protocol

5. CLAUDE.md FRAGMENT
   Bullets to append under existing sections. Specify target section
   per bullet. No new top-level sections unless absolutely required.
   Update Agent Registry / Skill Registry tables.

6. .claudeignore ADDITIONS (if any)
   Lines to add to prevent indexing waste from this capability.

7. VALIDATION CHECKLIST (must pass all before output is final)
   [ ] Each component has single responsibility (no "and" in purpose)
   [ ] Both "use when" and "do not use when" present
   [ ] Token budgets respected (state actual line counts)
   [ ] Tool list minimal and justified
   [ ] No skill→agent calls; no circular deps
   [ ] I/O uses paths/IDs, not embedded content
   [ ] Reuse decision documented
   [ ] No redundancy with existing CLAUDE.md, agents, or skills
   [ ] Naming follows kebab-case verb-noun (agents) / noun (skills)
   [ ] Trigger tests provided: 2 positive, 2 negative prompts per
       component
   [ ] Grep-first + surgical-edit guidance present in agent prompt

8. EFFICIENCY AUDIT
   - Estimated tokens added to base context: <number>
   - Estimated tokens per typical invocation: <number>
   - Identified redundancies removed: <list or "none">
   - Items deferred as YAGNI: <list or "none">

═══════════════════════════════════════════════════════════════
REJECT AND REVISE IF
═══════════════════════════════════════════════════════════════
- Any checklist item fails → regenerate that component
- Any component overlaps >50% with an existing asset → consolidate
- Total output exceeds 1,500 lines → split capability and request
  scope reduction from the user
- Description is vague ("helps with X", "handles Y") → rewrite with
  concrete triggers
- Agent has >5 tools without justification → remove or split

Produce the output now. Do not include explanations outside the
specified sections. No preamble. No closing remarks.
```

---

## Appendix A — Quick-Reference Cheat Sheet

| Decision | Rule |
|---|---|
| When to create a skill | Used ≥3 times AND not covered ≥80% by existing |
| When to create an agent | Recurring orchestration AND distinct toolset/failure mode |
| When to split an agent | Context >30% window OR mixed responsibilities |
| When to split CLAUDE.md | File >300 lines OR distinct subdirectory rules |
| How to pass data between agents | Artifact paths, never inline blobs >50 lines |
| What tools to grant an agent | Minimum required, one-line justification each |
| What goes in CLAUDE.md | Policy + registries only; never procedures |
| What goes in a skill | Procedures + assets only; never policy |
| What goes in an agent | Scope, contracts, orchestration logic |

## Appendix B — Promotion Ladder

```
Inline prompt
     │
     │  (used 3+ times, same shape)
     ▼
Skill
     │
     │  (recurring orchestration over multiple skills)
     ▼
Agent
     │
     │  (multiple agents need shared coordination)
     ▼
Orchestrator Agent + sub-specialists
```

Each promotion must be justified by **demonstrated repeated need**, never by speculation.
