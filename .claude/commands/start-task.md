---
description: Create a branch and start work on a Linear issue
model: haiku
---

# Start Linear Task

Given the Linear issue ID {{arg1}}, please:

@.claude/shared/linear-setup.md

1. Fetch the Linear issue details using the Linear MCP tools
2. Display the issue title and description so I have context
3. Fetch the latest changes from origin: `git fetch origin`
4. Create a new branch from `origin/main`:
   - Branch name format: `<issue-id>/<brief-description>`
   - `issue-id` is the Linear issue identifier as returned by the Linear MCP (e.g., "HER-12")
   - `brief-description` is a kebab-case version of the issue title (lowercase, words separated by hyphens, keep it concise)
   - Example: `HER-12/add-photo-upload`
   - Command: `git checkout --no-track -b <branch-name> origin/main`
5. Confirm with the user to begin work

Issue ID: {{arg1}}
