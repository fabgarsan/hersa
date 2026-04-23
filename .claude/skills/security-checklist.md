# Security Checklist — Hersa

Apply this checklist when writing or reviewing code. Items marked **[DEPLOY]** block the deploy if not met.

## Django — Configuration

- **[DEPLOY]** `ALLOWED_HOSTS` configured — never `['*']` in production
- **[DEPLOY]** `SECRET_KEY = decouple.config('SECRET_KEY')` — never hardcoded
- **[DEPLOY]** `DEBUG = decouple.config('DEBUG', cast=bool, default=False)` in production
- **[DEPLOY]** CORS configured with `django-cors-headers` — `CORS_ALLOWED_ORIGINS` explicit, never `CORS_ALLOW_ALL_ORIGINS = True`
- CSRF active for endpoints serving HTML (admin, non-API views)

## Django — Views and Permissions

- **[DEPLOY]** `permission_classes` declared explicitly on every View
- Never rely on the DRF global default without declaring it in the View
- `AllowAny` only on justified public endpoints (login, registration, health check)
- Verify a user can only access data belonging to their own school/organization (object-level authorization)

## Django — Data and Queries

- Never trust user-supplied data without validating through the serializer
- `raw()` and `extra()` only with parameterized queries — never string interpolation
- Uploaded files: validate MIME type, maximum size, sanitize filename
- Logs must never contain passwords, tokens, or student/school PII
- Never expose in responses: `password`, internal tokens, sensitive data from other tenants

## Django — Authentication

- Rate limiting on authentication endpoints: `POST /api/v1/auth/token/`
- Refresh tokens with short expiry (7 days — already configured)
- Rotate refresh tokens on each use if possible

## React — Frontend

- JWT in `localStorage` — known XSS risk accepted as an existing project decision
  - Mitigation: never store additional sensitive data in localStorage
  - Mitigation: strict CSP to reduce XSS attack surface
- **[DEPLOY]** `dangerouslySetInnerHTML` is prohibited — any occurrence blocks deploy
- **[DEPLOY]** `VITE_*` variables: never secrets (private API keys, credentials) — the bundle is public
- Always validate inputs on both the client (UX) and the server (security)

## General — Dependencies

- Run `pipenv run pip-audit` before every release
- Run `npm audit` before every release
- Dependencies with CRITICAL or HIGH vulnerabilities block the deploy

## General — Infrastructure

- **[DEPLOY]** HTTPS enforced on Elastic Beanstalk (listener on 443, redirect 80 → 443)
- **[DEPLOY]** Security headers active: `HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- RDS accessible only from the EB security group — never exposed to the internet
- Frontend S3 bucket: public read access only for static files, never public write

## Sensitive data in the Hersa domain

Hersa handles data from schools, educational institutions, and students. Protect especially:
- Student and faculty contact information
- School billing and payment information
- Commercial contracts and agreements
- Graduation photos before delivery to the client

This data must never appear in logs, error responses, or be accessible across different client organizations (schools).
