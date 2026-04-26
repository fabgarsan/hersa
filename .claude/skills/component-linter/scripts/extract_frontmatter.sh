#!/usr/bin/env bash
# Usage: extract_frontmatter.sh <file.md>
# Extracts YAML frontmatter (between --- markers) from a markdown file.
# Returns empty string if no frontmatter found.

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <file.md>" >&2
  exit 1
fi

if [[ ! -f "$1" ]]; then
  echo "ERROR: file not found: $1" >&2
  exit 2
fi

awk '/^---$/{c++; next} c==1' "$1"
