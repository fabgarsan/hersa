Analyze the changes in the current branch and create a comprehensive PR description.

**IMPORTANT**: Follow CLAUDE.md for git workflow (worktree vs branch-based).

**IMPORTANT**: You have access to environment variables and git information WITHOUT executing bash commands:

- `$DATA_REPO` is available in the `<env>` section as "Working directory"
- Do NOT execute `echo $DATA_REPO` - read it directly from your environment context

Steps:

1. Get the repo root directory from `<env>` (Working directory field)
2. Get the current branch name by running: `git branch --show-current`
   - DO NOT rely on gitStatus from context - it may be stale from the start of the conversation
   - ALWAYS execute the git command to get the CURRENT branch
3. Try to read `$DATA_REPO/.claude/tmp/<branch-name>.json` using the Read tool

   - If it exists: Ask the user if they want to:

     **a)** Reuse the existing description (show them the title and first few lines)

     **b)** Overwrite with a new description based on current changes

   - If they choose to reuse: Skip to the final step and provide the command
   - If the file doesn't exist or they choose to overwrite: Continue to step 5

4. Review the changes with: `git diff master` (or appropriate base branch)
5. Create a JSON file at: `$DATA_REPO/.claude/tmp/<branch-name>.json`
6. When you're done, show me the description.
7. Immediately following the description, provide the command to create the PR using gh cli:
   `gh pr create --recover $DATA_REPO/.claude/tmp/<branch-name>.json`

The JSON file should have this exact structure:

```json
{
  "Type": 1,
  "Draft": false,
  "ActorAssignees": false,
  "Body": "<markdown description here>",
  "Title": "[Component] Brief title",
  "Template": "",
  "Metadata": null,
  "Reviewers": null,
  "Assignees": [],
  "Labels": null,
  "ProjectTitles": null,
  "Milestones": null,
  "MetadataResult": null
}
```

## Conciseness Requirements

The "Body" field should be CONCISE with strict limits:

- **Maximum 250 words total**
- Use bullet points, not prose paragraphs
- **Summary section:** 1-2 sentences max (30 words)
- **Changes section:** 3-5 bullets highlighting ONLY the most significant changes
- **Why section:** 2-3 bullets on problem/solution (omit if obvious from changes)
- **Testing section:** 2-4 bullets on critical acceptance criteria only

**AVOID:**

- Listing every file changed
- Explaining obvious changes (e.g., "Updated BUILD files to match")
- Redundant phrasing ("This PR...", "We changed...", "This commit...")
- Over-explaining testing steps
- Repeating information between sections

**Examples:**

❌ **BAD (too verbose - 95 words):**

```
This PR refactors the summary generation system by introducing a new BaseSummary
class that provides a consistent pattern for all summary types. We migrated all
15 static summary types including allergies, conditions, medications, encounters,
family histories, immunizations, lab results, medical claims, and others to use
this new base class. Additionally, we deleted 8 deprecated files that were using
the old generate_summary() pattern which was based on batching. The new approach
provides better caching and change detection.
```

✅ **GOOD (concise - 23 words):**

```
Added BaseSummary class with hash-based caching and change detection. Migrated
15 summary types, deleted 8 deprecated files using old batching pattern.
```

❌ **BAD Changes section:**

```
- Added new BaseSummary class in static_summary/base_summary.py
- Migrated allergies.py to use BaseSummary
- Migrated allergy_reactions.py to use BaseSummary
- Migrated calls.py to use BaseSummary
- Migrated conditions.py to use BaseSummary
- [12 more files listed...]
- Deleted clinical_summary_tools.py
- Deleted interaction_summary_tools.py
- Updated BUILD.bazel files to reflect changes
```

✅ **GOOD Changes section:**

```
- Added BaseSummary class with Fetch → Filter → Format → Summarize pipeline
- Migrated 15 summary types to use new base class
- Added data_hash, error_count, success_count columns for monitoring
- Deleted 8 deprecated files using old pattern
```

## Body Template

Use this structure:

```markdown
## Summary

1-2 sentences explaining what this change does and why (max 50 words).

## Changes

- 3-5 bullet points of most significant changes
- Focus on functional changes, not file lists
- Omit obvious implementation details

## Why These Changes?

- Problem being solved (NO MORE THAN 3 BULLETS)
- Solution approach (NO MORE THAN 3 BULLETS)
- Omit this section if changes are self-explanatory

## Testing

- 2-4 bullets on critical acceptance criteria
- Focus on what to verify, not how to test
- Include monitoring/observability points if relevant
```

Be RUTHLESSLY concise while ensuring all critical information is present.