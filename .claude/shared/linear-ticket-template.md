# Linear Ticket Description Template

Canonical structure for all Linear issues created in the Hersa workspace.
Every command that creates a Linear issue MUST produce a description that follows this structure.

## Section Definitions

### Overview *(required, ≤2 sentences)*
What this task will accomplish and why it matters. Write in imperative mood as planned work:
"Implement X to enable Y" — not "Implemented X" or "This PR adds Y".

### Acceptance Criteria *(required, ≥2 items)*
Concrete, testable conditions that define when the task is complete.
Each item must be independently verifiable by someone who did not write the code.
Format: `- [ ] <condition>`

### Context *(required)*
Background that helps the implementer understand the problem without reading Slack history.
Include links to related Linear issues, design docs, or process documents when relevant.

### Implementation Notes *(optional — omit section entirely if not applicable)*
Technical decisions, gotchas, or constraints visible from the domain or existing code.
Do not invent guidance; only include what is actually known at ticket-creation time.

### Testing Requirements *(required, ≥1 item)*
What must be verified beyond the acceptance criteria — unit tests, integration tests,
manual QA steps, or observability checks.
Format: `- [ ] <requirement>`

### Related Links *(optional — omit section entirely if there are no links)*
Links to design docs, Figma screens, related Linear issues, or external references.
Format: `- [Title](url)`

---

## Markdown Template

```markdown
## Overview

[1-2 sentences — imperative mood, planned work]

## Acceptance Criteria

- [ ] [Testable condition 1]
- [ ] [Testable condition 2]

## Context

[Background, motivation, links to related work]

## Implementation Notes

[Technical decisions or constraints — omit section if nothing known]

## Testing Requirements

- [ ] [What to verify]

## Related Links

- [Title](url) — omit section if no links
```

---

## Format Rules

- Title: imperative mood, ≤70 characters (e.g., "Add bulk Promoción creation with atomic validation")
- All sections use sentence case, not title case
- Acceptance Criteria and Testing Requirements use `- [ ]` checkboxes — never plain bullets
- Implementation Notes and Related Links are fully optional; remove the heading if empty
- No filler phrases: avoid "This ticket…", "We will…", "The goal is to…"
