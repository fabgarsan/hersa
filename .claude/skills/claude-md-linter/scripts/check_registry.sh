#!/usr/bin/env bash
# Usage: check_registry.sh <claude_md_path> <project_root>
# Cross-references CLAUDE.md Agent/Skill Registry tables against actual files
# in <project_root>/.claude/. Reports orphans (registered but missing) and
# unregistered (present but not in registry).
#
# Exit codes:
#   0 — registries match filesystem
#   1 — mismatches found (details on stdout)
#   2 — usage error or unreadable inputs

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <claude_md_path> <project_root>" >&2
  exit 2
fi

claude_md="$1"
project_root="$2"

if [[ ! -f "$claude_md" ]]; then
  echo "ERROR: CLAUDE.md not found: $claude_md" >&2
  exit 2
fi

agents_dir="$project_root/.claude/agents"
skills_dir="$project_root/.claude/skills"

# Extract registered names from markdown table rows: | `name` | ... | ... |
extract_registered() {
  local section_marker="$1"
  awk -v marker="$section_marker" '
    $0 ~ marker { in_section=1; next }
    in_section && /^## / { in_section=0 }
    in_section && /^\| `/ {
      match($0, /`[a-z][a-z0-9-]*`/)
      if (RSTART > 0) {
        name = substr($0, RSTART+1, RLENGTH-2)
        print name
      }
    }
  ' "$claude_md" | sort -u
}

registered_agents=$(extract_registered "Agent Registry" || true)
registered_skills=$(extract_registered "Skill Registry" || true)

# Filesystem inventory
fs_agents=""
if [[ -d "$agents_dir" ]]; then
  fs_agents=$(find "$agents_dir" -maxdepth 1 -name "*.md" -exec basename {} .md \; 2>/dev/null | sort -u)
fi

fs_skills=""
if [[ -d "$skills_dir" ]]; then
  fs_skills=$(find "$skills_dir" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null | sort -u)
fi

# Compare
mismatch=0

orphan_agents=$(comm -23 <(echo "$registered_agents") <(echo "$fs_agents") | grep -v '^$' || true)
unreg_agents=$(comm -13 <(echo "$registered_agents") <(echo "$fs_agents") | grep -v '^$' || true)
orphan_skills=$(comm -23 <(echo "$registered_skills") <(echo "$fs_skills") | grep -v '^$' || true)
unreg_skills=$(comm -13 <(echo "$registered_skills") <(echo "$fs_skills") | grep -v '^$' || true)

if [[ -n "$orphan_agents" ]]; then
  echo "ORPHAN_AGENTS (registered but no file):"
  echo "$orphan_agents" | sed 's/^/  - /'
  mismatch=1
fi

if [[ -n "$unreg_agents" ]]; then
  echo "UNREGISTERED_AGENTS (file exists but not in registry):"
  echo "$unreg_agents" | sed 's/^/  - /'
  mismatch=1
fi

if [[ -n "$orphan_skills" ]]; then
  echo "ORPHAN_SKILLS (registered but no directory):"
  echo "$orphan_skills" | sed 's/^/  - /'
  mismatch=1
fi

if [[ -n "$unreg_skills" ]]; then
  echo "UNREGISTERED_SKILLS (directory exists but not in registry):"
  echo "$unreg_skills" | sed 's/^/  - /'
  mismatch=1
fi

if [[ $mismatch -eq 0 ]]; then
  echo "OK: registries match filesystem"
fi

exit $mismatch
