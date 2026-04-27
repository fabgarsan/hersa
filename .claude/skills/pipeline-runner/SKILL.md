---
name: pipeline-runner
description: Reads a flow from pipeline-flows and generates the ordered invocation sequence for a given start and end agent. Emits a declarative plan; does not invoke agents.
version: 1.0.0
when_to_use:
  - When the user says "execute Flow X from agent Y to agent Z"
  - When starting a non-trivial task and the user wants a step-by-step plan before invocating agents
when_not_to_use:
  - As a replacement for the actual agents — this skill only plans, never executes
  - When the flow is obvious (e.g., a single-agent task)
---

## How to Use

1. Read `.claude/skills/pipeline-flows/SKILL.md` to get the full catalogue.
2. Identify the flow (A–I) that matches the user's situation.
3. Apply any start/end constraints the user specified (e.g., "start from tdd-writer", "end before aws-devops").
4. Emit the ordered invocation sequence with hard stops clearly marked.

## Output Format

```
PIPELINE PLAN — Flow [letter]: [name]
Entry: [agent or skill]
Exit: [agent or skill]

Step 1: [agent-name]
  Input: [what it reads]
  Output: [what it writes]
  [HSTOP: description if applicable]

Step 2: ...
...

Hard stops in this plan:
- [list all HSTOP points]

Invoke step 1 now? (yes/no)
```

## Constraints

- Always reference `pipeline-flows` as the source of truth for sequences
- Do not reorder agents within a flow without explicit user approval
- Mark all HSTOP points explicitly — never hide them
- If the user's situation matches more than one flow, list the options and ask the user to choose
