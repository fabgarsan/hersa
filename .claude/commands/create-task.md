---
description: Create a well-structured Linear task with guided workflow
---
# Create Linear Task
Help the user create a comprehensive, well-structured Linear task with proper context and details.

@.claude/shared/linear-setup.md

## Workflow

Follow this guided process to create a well-formed ticket:

### 1. Gather Information

Ask the user for the following information (if not already provided):

- **Team**: Which team should this task belong to? (Use Linear MCP to show available teams)
- **Title**: What is the task title? (Should be concise and descriptive)
- **Description**: What does this task involve? (Can be brief - we'll expand it)

### 2. Select Project and Milestone

- **Project**: Ask which project this task belongs to (use Linear MCP to list projects for the selected team)
- **Milestone**: If the project has milestones, ask which milestone this should be in (optional)

### 3. Estimate Effort

Ask the user to provide a rough estimate for this task:

- 1 = Small (a few hours)
- 2 = Medium (1-2 days)
- 3 = Large (3-5 days)
- 5 = Extra Large (1+ weeks)
- 8 = Epic (multi-week)

### 4. Build the Description

Create a comprehensive task description using this template:

```markdown
## Overview

[1-2 sentences describing what this task is about and its purpose]

## Acceptance Criteria

- [ ] [Specific, measurable criterion 1]
- [ ] [Specific, measurable criterion 2]
- [ ] [Specific, measurable criterion 3]

## Context

[Any relevant background, links to related issues, or technical context]

## Implementation Notes

[Optional: Any specific technical approaches, gotchas, or considerations]

## Testing Requirements

- [ ] [Testing requirement 1]
- [ ] [Testing requirement 2]

## Related Links

- [Link to design doc, if any]
- [Link to related Linear issues]
```

**Key guidelines for the description:**

- **Acceptance Criteria**: Concrete, testable conditions that define when the task is complete
- **Context**: Include links to relevant documentation or design decisions
- **Implementation Notes**: Technical details that will help the implementer — skip if not applicable
- **Testing Requirements**: What testing is needed beyond the acceptance criteria

### 5. Review with User

Show the user the complete task details:

- Title
- Team
- Project
- Milestone (if selected)
- Estimate
- Full description

Ask if they want to:

- **a)** Create the task as-is
- **b)** Make modifications
- **c)** Cancel

### 6. Create the Task

Use the Linear MCP `create_issue` tool with all the gathered information:

- Set the team
- Set the project (if selected)
- Set the title
- Set the description
- Set the estimate
- Set the project milestone (if selected)
- Add any relevant labels

### 7. Confirm Success

After creating the task:

- Show the task identifier (e.g., "HER-12")
- Provide the Linear URL to the task
- Ask if they want to:
  - Start work on this task immediately (run `/start-task <task-id>`)
  - Create another related task
  - Done

## Important Notes

- **Be thorough**: A well-formed task saves time later
- **Ask questions**: If the task description is vague, ask clarifying questions
- **Acceptance Criteria are key**: These should be specific enough that anyone can verify completion
- **Default assignee**: Unless specified, leave the task unassigned so it can be picked up from the backlog
