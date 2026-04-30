#!/usr/bin/env bash
# Usage: check_rules.sh <project_root>
# Validates each .md file under <project_root>/.claude/rules/:
#   - Has YAML frontmatter
#   - If `paths:` present, it is a non-empty array
#   - Body length ≤ 300 lines
#   - No nested H1
#
# Exit codes:
#   0 — all rule files valid
#   1 — issues found (details on stdout)
#   2 — usage error or missing dir (rules dir is optional; treats as OK)

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <project_root>" >&2
  exit 2
fi

project_root="$1"
rules_dir="$project_root/.claude/rules"

if [[ ! -d "$rules_dir" ]]; then
  echo "OK: no .claude/rules/ directory (path-scoped rules optional)"
  exit 0
fi

issues=0

while IFS= read -r -d '' file; do
  rel="${file#$project_root/}"

  # Check frontmatter exists (file starts with ---)
  if ! head -1 "$file" | grep -qx '---'; then
    echo "FAIL [$rel]: missing YAML frontmatter (must start with ---)"
    issues=$((issues + 1))
    continue
  fi

  # Extract frontmatter and body
  frontmatter=$(awk '/^---$/{c++; next} c==1' "$file")
  body=$(awk '/^---$/{c++; next} c>=2' "$file")

  # If `paths:` is declared, validate it has at least one entry
  if echo "$frontmatter" | grep -q '^paths:'; then
    path_entries=$(echo "$frontmatter" | awk '/^paths:/{flag=1; next} /^[a-zA-Z]/{flag=0} flag && /^[[:space:]]+-[[:space:]]/' | wc -l)
    if [[ "$path_entries" -eq 0 ]]; then
      echo "FAIL [$rel]: \`paths:\` declared but empty"
      issues=$((issues + 1))
    fi
  fi

  # Body line count ≤ 300
  body_lines=$(echo "$body" | wc -l | tr -d ' ')
  if [[ "$body_lines" -gt 300 ]]; then
    echo "FAIL [$rel]: body is $body_lines lines (max 300)"
    issues=$((issues + 1))
  fi

  # No second H1 in body (one allowed for title)
  h1_count=$(echo "$body" | grep -c '^# ' || true)
  if [[ "$h1_count" -gt 1 ]]; then
    echo "FAIL [$rel]: found $h1_count H1 headings (max 1 — use H2 for nesting)"
    issues=$((issues + 1))
  fi

  # Body non-empty (warning, not failure)
  if [[ -z "$(echo "$body" | tr -d '[:space:]')" ]]; then
    echo "WARN [$rel]: body is empty"
  fi

done < <(find "$rules_dir" -type f -name "*.md" -print0)

if [[ "$issues" -eq 0 ]]; then
  echo "OK: all rule files valid"
  exit 0
fi

echo "Total issues: $issues"
exit 1
