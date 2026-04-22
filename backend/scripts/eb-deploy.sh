#!/bin/bash
set -euo pipefail

# Always run from backend/ regardless of where the script is called from
cd "$(dirname "$0")/.."

ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Copy .env.example to .env.production and fill in the values."
  exit 1
fi

# Parse .env.production into eb setenv arguments
ENV_ARGS=()
while IFS= read -r line || [ -n "$line" ]; do
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
  ENV_ARGS+=("$line")
done < "$ENV_FILE"

echo "Setting environment variables..."
eb setenv "${ENV_ARGS[@]}"

echo "Generating requirements.txt from Pipfile..."
pipenv requirements > requirements.txt

echo "Deploying to Elastic Beanstalk..."
eb deploy

echo "Deploy complete."
