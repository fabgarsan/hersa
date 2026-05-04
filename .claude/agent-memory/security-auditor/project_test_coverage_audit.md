---
name: Test Coverage Audit 2026-05-03
description: OWASP Top 10 gap analysis of the Hersa test suite — backend Django/DRF + frontend React. Identifies which security scenarios are covered and which are missing.
type: project
---

Audit performed on branch HRS-43/add-unit-and-integration-tests-for-core-and-modules-apps (commit 12c43b1).

## Files reviewed
- backend/apps/users/tests/ — test_change_password, test_forgot_password, test_reset_password, conftest
- backend/tests/unit/test_core_permissions.py — IsSuperUser unit tests
- backend/tests/integration/test_module_permissions.py — HasModulePermission integration tests
- backend/apps/users/views.py, serializers.py, throttles.py
- backend/apps/core/permissions.py, apps/modules/permissions.py
- backend/config/settings/base.py, production.py
- frontend/src/modules/auth/__tests__/AuthModal.test.tsx
- frontend/src/modules/auth/AuthModal.tsx, AuthProvider.tsx, api/client.ts

## Key gaps found
- No throttle enforcement test (only throttle disabling in tests)
- No JWT token invalidation test post-logout (blacklist not tested)
- No test for expired/invalid JWT on protected endpoints (MeView, MyPermissionsView)
- No SQL injection / malicious input tests
- No security logging assertion tests
- No cross-school data isolation tests (no school model yet, but architecture needs it)
- No frontend tests for ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm components
- No frontend tests for AuthGuard or ModuleGuard components

**Why:** These gaps exist because the test suite focused on happy-path and basic auth flows. Security edge cases were not included in the first pass.
**How to apply:** When reviewing new PRs or sprint planning, use this list as the baseline for security test backlog.
