---
description: Create a Linear issue from current branch changes, enforce branch naming convention, and optionally commit and push
model: sonnet
---

# Capture Task

Analyze the current branch's changes against `main`, create a prospective Linear issue, and ensure the branch follows the `HRS-XX/<kebab-slug>` naming convention.

@.claude/shared/linear-setup.md
@.claude/shared/linear-ticket-template.md

## Workflow

### 1. Analyze the current branch

Run these commands to understand what changed:

```bash
git branch --show-current
git log main...HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

Also check for uncommitted changes:

```bash
git status
git diff --stat
```

### 2. Synthesize a prospective task description

Based on the diff and commit history, infer what the work accomplishes. Write the Linear issue **as if the work has not been done yet** — use future-oriented language ("Implement X", "Add Y", "Fix Z"), not past tense ("Implemented X", "Added Y").

Use the structure and format rules defined in the loaded `linear-ticket-template.md`.

How to fill each field from the git diff:

- **Overview**: Summarize what the changes accomplish as planned work — imperative mood ("Implement X to enable Y"), never past tense
- **Acceptance Criteria**: Derive directly from the diff — one checkbox per distinct logical change; do not invent criteria that are not present in the code
- **Context**: Explain the problem or opportunity that motivated these changes, based on what the diff implies; include links to related process docs if the diff touches documentation files
- **Implementation Notes**: Include only technical decisions that are visible in the diff (e.g., a batch-write strategy, a specific algorithm choice) — omit the section if nothing non-obvious is present
- **Testing Requirements**: Derive from the acceptance criteria; include at least one item
- **Related Links**: Omit unless the diff references specific external documents or issues that can be linked

### 3. Propose the ticket to the user

Show:
- **Title** (concise, imperative, ≤70 characters)
- **Description** (full markdown preview)
- **Suggested branch slug** (kebab-case, ≤5 words, derived from the title)

Ask:
- **a)** Create as-is
- **b)** Edit title or description
- **c)** Cancel

### 4. Create the Linear issue

Use the Linear MCP to create the issue:
- Team: **Hersa**
- Project: ask the user which project (list available projects via MCP), default to the project inferred from context
- Title and description as approved

After creation, note the issue identifier (e.g., `HRS-42`).

### 5. Enforce branch naming convention

Check the current branch name against the pattern `HRS-\d+/.+`:

**Case A — currently on `main`:**
```bash
git checkout -b HRS-42/<suggested-slug>
```

**Case B — on a feature branch that does NOT match `HRS-\d+/.+`:**
```bash
git branch -m HRS-42/<suggested-slug>
```

**Case C — branch already matches `HRS-\d+/.+`:**
- Confirm the existing name is correct and continue. If the issue ID in the branch name doesn't match the newly created ticket, rename it.

### 6. Handle uncommitted changes

Re-run `git status` to get the current state of the working tree **after** any branch rename.

**If there are uncommitted changes (modified, added, or untracked files):**

Ask the user:
> There are uncommitted changes. Auto-commit them now?
> **a)** Yes — stage and commit all changes
> **b)** No — leave them uncommitted (auto-push will not be offered)

If **yes**:
1. Stage everything: `git add -A`
2. Build a commit message following the project convention (`type(scope): description`):
   - Infer `type` from the diff (`feat`, `fix`, `docs`, `chore`, `refactor`) — use `docs` for documentation-only changes, `chore` for agent/skill/config files
   - Infer `scope` from the primary area touched (e.g., `requirements`, `agents`, `frontend`, `backend`)
   - Use the ticket title (lowercased, shortened to ≤72 chars total) as the description
3. Create the commit:
   ```bash
   git commit -m "type(scope): description"
   ```
4. Confirm the commit hash and message to the user.

**If there are NO uncommitted changes** (working tree clean, either originally or after auto-commit):

Proceed directly to step 7.

### 7. Offer auto-push

Auto-push is only available when the working tree is clean — either because there were no uncommitted changes, or because the user chose to auto-commit in step 6.

Ask the user:
> Auto-push branch to remote?
> **a)** Yes — push now
> **b)** No — push manually later

If **yes**:
```bash
git push -u origin <current-branch-name>
```

Confirm the push result (upstream tracking set, remote URL).

### 8. Confirm and hand off

- Show the final branch name
- Show the Linear issue URL
- If push was skipped, remind the user to push before opening the PR
- End with:

> Task captured. Run `/pr-create` when ready to open the pull request.
