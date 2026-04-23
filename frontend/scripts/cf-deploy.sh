#!/bin/bash
set -euo pipefail

# Always run from frontend/ regardless of where the script is called from
cd "$(dirname "$0")/.."

ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Copy .env.example to .env.production and fill in the values."
  exit 1
fi

# Load all variables from .env.production into the current shell
set -o allexport
# shellcheck source=/dev/null
source "$ENV_FILE"
set +o allexport

# Validate required deployment variables
: "${S3_BUCKET:?S3_BUCKET is required in $ENV_FILE}"

echo "Building frontend..."
npm run build

echo "Uploading static assets (hashed filenames, 1-year cache)..."
aws s3 sync dist/assets "s3://$S3_BUCKET/assets" \
  --cache-control "max-age=31536000,immutable" \
  --delete

echo "Uploading index.html and root files (no cache)..."
aws s3 sync dist "s3://$S3_BUCKET" \
  --exclude "assets/*" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --delete

if [ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  echo "Invalidating CloudFront distribution $CLOUDFRONT_DISTRIBUTION_ID..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*"
else
  echo "CLOUDFRONT_DISTRIBUTION_ID not set — skipping invalidation."
fi

echo "Deploy complete."
