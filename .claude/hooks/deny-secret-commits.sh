#!/usr/bin/env bash
# PreToolUse hook — blocks `git commit` / `git add` operations that would stage
# real env files (.env, .env.production, …). Exits 2 on block per Claude Code §5.4.
#
# Wired from .claude/settings.json under hooks.PreToolUse with matcher "Bash".
# Reads the tool input as JSON on stdin: { "tool_name": "Bash", "tool_input": { "command": "..." } }.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
INPUT="$(cat)"

# Extract bash command from JSON. Fall back to empty string if not parseable.
CMD="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("command",""))' 2>/dev/null || true)"

# Only act on git commit / git add invocations.
case "$CMD" in
  *"git commit"*|*"git add"*) ;;
  *) exit 0 ;;
esac

cd "$PROJECT_DIR"

# Pattern of env files we never want staged. Allow .env.example explicitly.
DANGEROUS_RE='(^|/)\.env(\..*)?$'
ALLOWED_RE='(^|/)\.env\.example$'

# Files staged in the index plus any new path the command tries to add directly.
STAGED="$(git diff --cached --name-only 2>/dev/null || true)"

OFFENDERS=""
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if [[ "$f" =~ $DANGEROUS_RE ]] && ! [[ "$f" =~ $ALLOWED_RE ]]; then
    OFFENDERS="$OFFENDERS  - $f"$'\n'
  fi
done <<< "$STAGED"

if [ -n "$OFFENDERS" ]; then
  printf 'Blocked: refusing to commit env files. Staged offenders:\n%s' "$OFFENDERS" >&2
  printf 'Unstage with `git reset HEAD <file>` and use `.env.example` instead.\n' >&2
  exit 2
fi

exit 0
