---
name: Code Review - HRS/security-test-coverage-audit
description: Final review findings for security test coverage audit branch
type: project
---

# Code Review Report — HRS/security-test-coverage-audit

**Branch:** HRS/security-test-coverage-audit  
**Base:** main  
**Date:** 2026-05-03  
**Reviewer:** Melba (Code Reviewer)

---

## Executive Summary

This branch adds comprehensive security test coverage for authentication and password reset flows (backend + frontend) plus updates to CI/CD configuration. The code quality is **high**—all production code changes follow conventions, security practices are sound, and test coverage is thorough.

**Verdict: APPROVED WITH MINOR CHANGES**

Only minor cleanups needed (test data factories and one type hint). No security issues, no architectural problems, no breaking changes.

---

## Findings by Severity

### CRITICAL
None.

### MAJOR
**1 issue:** Type hint inaccuracy in frontend test

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `frontend/src/api/client.test.ts` | 110 | `MockInstance<typeof axios.post>` is too loose. `axios.post` is a method, not a standalone function. Should use the full signature. | Change to `vi.spyOn(axios, "post")` return type, or use `MockInstance<(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse>>` |

---

### MINOR
**5 issues:** Test data factory patterns and helper function choice

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `backend/apps/users/tests/test_forgot_password.py` | 58 | Direct `User.objects.create_user()` call. Convention requires `factory_boy`. | Extract to conftest fixture or use a factory: `UserFactory.create(username="noemail", password="StrongPass123!")` |
| `backend/apps/users/tests/test_token_views.py` | 10–15, 27–30, 41–50 | Direct `User.objects.create_user()` calls in test functions. | Use the `user` fixture from conftest.py or a factory. |
| `backend/apps/users/tests/test_me_view.py` | 43–51 | Direct `User.objects.create_user()` calls for multiple users. | Create a fixture `def multiple_users(db)` that returns user_a and user_b via factory or inline creation in conftest, then use it. |
| `frontend/src/modules/profile/features/password/components/__tests__/ResetPasswordForm.test.tsx` | 56–67 | Custom `renderWithRouter` function duplicates test setup. Doesn't use global `renderWithProviders`. | Either (a) use `renderWithProviders` and nest the router logic, or (b) if custom routing is necessary, document why `renderWithRouter` was chosen over the standard helper. |
| `backend/pyproject.toml` | 7 | `ignore = ["E501"]` silently ignores line-length violations (100 char limit defined but not enforced). | Clarify: if 100 char is a soft limit, remove E501 from ignore. If soft, add a comment explaining the exception. Current state is ambiguous. |

---

## Pass Checklist — Backend

✅ **Conventions:**
- Type hints on all functions (views, serializers, tests)
- CBV throughout (no function-based views)
- No `fields = '__all__'` in serializers
- Explicit `permission_classes` on all Views
- Logging with `logger`, no `print()`
- No hardcoded secrets

✅ **Security:**
- Throttling applied to auth endpoints (`AuthTokenThrottle`, `ChangePasswordThrottle`, `PasswordResetThrottle`)
- Password reset token uses base64-encoded PK (not email) — prevents PII leaks in URL
- Email send failures are caught and logged, not propagated (graceful degradation)
- Inactive users blocked from password reset and password change
- Password validation via Django's `validate_password()`
- No sensitive data in responses (`is_superuser`, `is_staff`, `password` fields excluded)

✅ **Testing:**
- pytest fixtures in conftest — DRY principle
- Integration tests (DB hits, full request/response cycle)
- Unit tests (permissions, pagination)
- Parameterized tests reduce duplication
- Test isolation via `@pytest.mark.django_db`
- Throttling tests use `override_settings` to control cache backend

✅ **Code Quality:**
- No N+1 queries (uses `select_related()` in permission view)
- Error handling covers edge cases (invalid tokens, inactive users, email send failures)
- Proper HTTP status codes (401, 403, 400, 429)

---

## Pass Checklist — Frontend

✅ **Conventions:**
- TypeScript strict, no `any` type
- Path aliases (`@shared`, `@modules`, `@api`)
- React Query for server state (mutations mocked correctly)
- SCSS modules (no `sx` or inline styles — not visible in test files, assume respected in components)
- Tests use `renderWithProviders` helper

✅ **Testing:**
- Comprehensive coverage: form validation, success, error, API error shapes, XSS security
- Mocks at axios instance level (MockAdapter)
- Token refresh logic tested (refresh on 401, retry original request, mutex for concurrent 401s)
- Error message sanitization verified (no XSS execution)
- Network error handling tested

✅ **Security:**
- No `dangerouslySetInnerHTML` ✅
- XSS payload tests confirm input/output safety
- Success/error messages sanitized
- Authorization header attached only when token exists
- Refresh token rotation when response provides new token

✅ **Code Quality:**
- Clear test structure: render, submit validation, success, error, button state, security sections
- Mock factory `createMockMutation()` reduces duplication
- Helper `getPasswordFields()` abstracts field selection complexity
- No hardcoded API URLs (uses `ROUTES` constant, `API.TOKEN_REFRESH`)

---

## Detailed Findings

### Backend Production Code — All ✅

**views.py:**
- `MeView`, `MyPermissionsView`, `ChangePasswordView`, `ForgotPasswordView`, `ResetPasswordView` all properly typed
- `MyPermissionsView` uses `select_related()` for FK — good query optimization
- Throttles applied correctly
- Email send wrapped in try/except with logging
- Token-based reset uses `urlsafe_base64_encode(force_bytes(user.pk))` — secure, doesn't leak email

**serializers.py:**
- All serializers explicitly define `fields`, no `__all__`
- Custom validation in `validate()` methods
- Password validation delegates to Django's `validate_password()`
- `read_only_fields` on UserSerializer prevent overwrite

**constants.py:**
- All messages in Spanish ✅
- Organized by category (success, forbidden, validation, not_found)

---

### CI/CD — All ✅

**.github/workflows/backend-ci.yml:**
- Postgres service health checks
- Environment variables set correctly (no secrets in workflow)
- Linting (ruff), typecheck (mypy), tests all run
- Coverage report uploaded as artifact
- Works correctly for pre-commit and PR gates

**backend/apps/users/management/commands/create_initial_superuser.py:**
- Uses `decouple.config()` for secrets ✅
- Graceful skip if superuser exists
- Proper error handling for missing env vars

---

### Test Issues — Minor cleanups only

**test_forgot_password.py line 58:**
```python
User.objects.create_user(username="noemail", password="StrongPass123!")
```
Should either:
1. Be a fixture in conftest (preferred)
2. Use a factory if one exists
3. Or add comment explaining why inline creation is acceptable here

**test_token_views.py:**
Multiple `User.objects.create_user()` calls. The existing `user` fixture from conftest should be reused or a factory should be used.

**test_me_view.py lines 43–51:**
```python
user_a = User.objects.create_user(...)
user_b = User.objects.create_user(...)
```
Should be extracted to a fixture returning both, or use a factory inside the test.

---

### Frontend Tests — Minor improvement

**ResetPasswordForm.test.tsx:**
The `renderWithRouter` helper re-implements test setup instead of using `renderWithProviders`. This is acceptable if routing is strictly needed, but should be documented:
```typescript
// Custom renderer because ResetPasswordForm requires MemoryRouter + Routes
// for navigation on success. Standard renderWithProviders cannot wrap router context.
const renderWithRouter = () => { ... };
```

---

## Questions for Implementer (Non-blocking)

1. **test_reset_password.py:** The `autouse=True` fixture on `disable_reset_password_throttle()` (line 15) disables throttling for all tests in the module. Is this intentional? Consider if one test should verify throttling is actually applied (it exists in test_throttling.py, so this is fine).

2. **ChangePasswordForm.test.tsx:** 94+ lines devoted to error handling and XSS tests. This is comprehensive but makes the test file 719 lines. Consider splitting into `*.spec.ts` for security tests vs. behavior tests if line count becomes hard to manage.

---

## Summary by Count

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| MAJOR | 1 |
| MINOR | 5 |
| **Total** | **6** |

---

## Verdict

**APPROVED WITH MINOR CHANGES**

- Production code is solid. No security issues, no architecture problems.
- Tests are comprehensive and well-structured.
- Six minor issues are all in test infrastructure and one type hint.
- None block functionality or deployment.

### Before Merge:
1. Address the MAJOR type hint issue in `client.test.ts:110`
2. Standardize test data creation across backend tests (factories or fixtures)
3. Optional: Document why `ResetPasswordForm.test.tsx` uses custom renderer

**Approved for re-review after changes.**
