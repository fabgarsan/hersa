---
name: deploy
description: Deploys Hersa to production — frontend (S3 + CloudFront), backend (Elastic Beanstalk), or both. Runs pre-flight checks, asks for confirmation, executes the appropriate script(s), and verifies the result.
when_to_use: When the user asks to deploy to production (frontend, backend, or full-stack). Use for any "push to prod", "release", or "deploy" request.
when_not_to_use: For local development, Docker, or staging environments. Do not deploy without explicit user intent.
model: sonnet
version: 1.0.0
disable-model-invocation: true
allowed-tools: Bash Read
---

# Deploy Hersa to Production

Deploy target is determined by the command argument:
- `/deploy` or `/deploy all` → deploy backend first, then frontend
- `/deploy backend` → deploy backend only (Elastic Beanstalk)
- `/deploy frontend` → deploy frontend only (S3 + CloudFront)

## Step 1 — Parse target

Read the args passed to this skill. Default to `all` if empty.

Valid targets: `frontend`, `backend`, `all`.
If the arg is unrecognized, stop and tell the user: "Valid targets are: frontend, backend, all."

## Step 2 — Pre-flight checks

Run these checks in parallel using Bash:

```bash
# 1. Current branch
git branch --show-current

# 2. Uncommitted or unstaged changes
git status --porcelain

# 3. Last commit that will be deployed
git log -1 --oneline --decorate
```

**Evaluate results:**

- If branch is not `main`: warn the user with: "⚠️  You are on branch `<branch>`, not `main`. Deploying from a non-main branch is unusual." — do NOT stop, just warn.
- If there are uncommitted changes (non-empty `git status --porcelain` output): warn with: "⚠️  You have uncommitted changes. These will NOT be included in the deploy." — do NOT stop, just warn.
- Show the last commit in the preflight summary.

## Step 3 — Confirm

Present a deployment summary to the user:

```
Deployment summary
──────────────────
Target    : <frontend | backend | all>
Branch    : <branch>
Commit    : <hash> <message>
Scripts   : <which scripts will run>

Proceed? (yes / no)
```

Wait for explicit user confirmation. If the user says anything other than "yes" / "sí" / "y", abort with: "Deploy cancelled."

## Step 4 — Execute

### Backend deploy (runs first when target is `all` or `backend`)

```bash
bash backend/scripts/eb-deploy.sh
```

- Stream output to the user as it runs.
- If the script exits with a non-zero code, stop immediately and report the error. Do NOT proceed to frontend deploy.

### Frontend deploy (runs after backend when target is `all`, or standalone when `frontend`)

```bash
bash frontend/scripts/cf-deploy.sh
```

- Stream output to the user as it runs.
- If the script exits with a non-zero code, report the error.

## Step 5 — Post-deploy verification

### Backend (if deployed)

Ping the health endpoint using the base URL from `frontend/.env.production`:
```bash
API_URL=$(grep VITE_API_BASE_URL frontend/.env.production 2>/dev/null | cut -d= -f2 | tr -d '"' | sed 's|/$||')
curl -sf --max-time 15 -o /dev/null -w "%{http_code}" "${API_URL}/api/health/" 2>/dev/null || echo "unreachable"
```

- HTTP 2xx → "Backend: healthy"
- Non-2xx or timeout → "Backend: health check returned <status> — verify manually at ${API_URL}"
- If `VITE_API_BASE_URL` is not set in `frontend/.env.production` → "Backend: skipping health check (VITE_API_BASE_URL not found)"

### Frontend (if deployed)

Check that `index.html` is reachable (no CloudFront cache for `no-store` files):
```bash
FRONTEND_URL=$(grep FRONTEND_URL backend/.env.production 2>/dev/null | cut -d= -f2 | tr -d '"' | sed 's|/$||')
curl -sf --max-time 10 -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/index.html" 2>/dev/null || echo "unreachable"
```

- HTTP 2xx → "Frontend: reachable"
- Any error → "Frontend: skipping reachability check — verify manually at ${FRONTEND_URL}"

## Step 6 — Summary

Resolve the URLs to display:

```bash
BACKEND_URL=$(grep VITE_API_BASE_URL frontend/.env.production 2>/dev/null | cut -d= -f2 | tr -d '"' | sed 's|/$||')
FRONTEND_URL=$(grep FRONTEND_URL backend/.env.production 2>/dev/null | cut -d= -f2 | tr -d '"' | sed 's|/$||')
```

Print a final deployment report:

```
Deploy complete ✓
─────────────────────────────────────────
Timestamp    : <ISO 8601 datetime>
Commit       : <hash> <message>
Backend      : <deployed | skipped> [healthy | error | skipped]
Frontend     : <deployed | skipped> [reachable | error | skipped]

URLs
─────────────────────────────────────────
Backend admin: <BACKEND_URL>/admin/
Frontend     : <FRONTEND_URL>
```

## Error handling

- Never suppress script errors — let them surface directly.
- If a `.env.production` file is missing, the underlying script will catch it with a clear message; do not pre-check it here.
- If `eb` CLI or `aws` CLI are not installed, the script will fail — tell the user to ensure the AWS CLI and EB CLI are configured in their environment.
