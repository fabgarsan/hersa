#!/usr/bin/env bash
# Generates the OpenAPI schema from the Django app and writes it to schema.yml
# at the monorepo root.
#
# Usage (from any directory):
#   bash backend/scripts/generate_schema.sh
#
# Or inside the running Docker backend container:
#   docker compose exec backend pipenv run python manage.py spectacular --color --file ../schema.yml
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
MONOREPO_ROOT="$(cd "${BACKEND_DIR}/.." && pwd)"
SCHEMA_PATH="${MONOREPO_ROOT}/schema.yml"

cd "${BACKEND_DIR}"
pipenv run python manage.py spectacular --color --file "${SCHEMA_PATH}"
echo "Schema generated at ${SCHEMA_PATH}"
