---
description: Create a well-structured Linear task with guided workflow
model: claude-haiku-4-5-20251001
---
# Create Linear Task
Help the user create a comprehensive, well-structured Linear task with proper context and details.

@.claude/shared/linear-setup.md
@.claude/shared/linear-ticket-template.md

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

Use the structure and format rules defined in the loaded `linear-ticket-template.md`.

How to fill each field from user input:

- **Overview**: Synthesize from the user's description — rewrite in imperative mood if the user used past tense or vague phrasing
- **Acceptance Criteria**: Ask the user to enumerate the conditions; if they are vague, suggest concrete rewordings and confirm before using them
- **Context**: Use any background the user provided; if they mentioned related tickets or docs, include those links
- **Implementation Notes**: Only include if the user explicitly provided technical context — do not invent
- **Testing Requirements**: Derive from the acceptance criteria if the user did not specify; always include at least one item
- **Related Links**: Include only if the user provided links — omit the section otherwise

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
