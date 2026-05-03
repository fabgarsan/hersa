# QA Test Plan: Core Permissions and Pagination Modules

**Date/Version:** 2026-05-03 / 1.0
**Risk Tier:** P1 — permissions control access to every Hersa API endpoint; a misconfigured permission class is a direct path to data exposure or service disruption during graduation season.
**QA Verdict:** PASS (no AC ambiguity; all decision points are traceable to source)
**Input artifacts:**
- `apps/core/permissions.py`
- `apps/core/pagination.py`
- `apps/modules/permissions.py`
- `apps/modules/models.py`
- `apps/users/tests/conftest.py` (reference for fixture patterns)
- `backend/pyproject.toml` (pytest configuration)

---

## 1. Scope

- `apps/core/permissions.IsSuperUser` — all four authentication/authorization branches
- `apps/core/pagination.StandardResultsSetPagination` — class attribute defaults and runtime enforcement of `max_page_size`
- `apps/modules/permissions.HasModulePermission` — all five branches including the `ImproperlyConfigured` raise path

## 2. Out of Scope

- Views that consume these classes (covered separately when those apps are built)
- JWT token acquisition/refresh (covered in `apps/users/tests/`)
- `AppModule` model migrations or Django Admin registration
- Frontend ModuleGuard (different layer; does not affect server-side enforcement)

---

## 3. Test Type Key

| Marker | Meaning |
|--------|---------|
| **UNIT** | No database, no HTTP — instantiate objects directly; no `@pytest.mark.django_db` |
| **INTEGRATION** | Requires DB (`@pytest.mark.django_db`) and/or full DRF request cycle |
| **DB-FIXTURE** | Needs a persisted `User` row; mark in the "Preconditions" column |

---

## 4. Test Cases

### 4.1 `IsSuperUser` — `apps/core/permissions.py`

**Test type for all cases:** UNIT — `has_permission()` only reads attributes on `request.user`; no DB query is issued by the permission class itself. The `user` object can be a `MagicMock` or `AnonymousUser` stub.

| Test ID | Scenario | Preconditions | Expected Result | Priority |
|---------|----------|---------------|-----------------|----------|
| ISU-01 | Anonymous request (no user object) | `request.user` is `AnonymousUser` (`is_authenticated = False`) | `has_permission()` returns `False` | P1 |
| ISU-02 | Authenticated non-superuser | `request.user` is authenticated, `is_superuser = False` | `has_permission()` returns `False` | P1 |
| ISU-03 | Authenticated superuser | `request.user` is authenticated, `is_superuser = True` | `has_permission()` returns `True` | P1 |
| ISU-04 | `is_staff`-only user (not superuser) | `request.user` has `is_staff = True`, `is_superuser = False` | `has_permission()` returns `False` — confirms the class does NOT conflate `is_staff` with `is_superuser` | P1 |

**Decision points covered:** the boolean short-circuit `request.user AND is_authenticated AND is_superuser` has four distinct truth-value paths. ISU-01 exits at the first condition; ISU-02 exits at the third; ISU-03 is the only `True` path; ISU-04 validates the docstring claim that `is_staff` alone is not sufficient.

**Note on ISU-01:** DRF sets `request.user` to `django.contrib.auth.models.AnonymousUser` for unauthenticated requests — never `None`. The source guard `request.user` (truthiness) evaluates to `True` for `AnonymousUser` instances, so the actual gate is `is_authenticated`. The test must use a real or stubbed `AnonymousUser`, not `None`, to match runtime behavior.

---

### 4.2 `StandardResultsSetPagination` — `apps/core/pagination.py`

Class attribute tests (ISP-01 through ISP-03) are pure UNIT tests — instantiate the class and assert attributes. Runtime enforcement tests (ISP-04 through ISP-06) require a DRF view and a dataset, making them INTEGRATION tests.

| Test ID | Scenario | Preconditions | Expected Result | Priority |
|---------|----------|---------------|-----------------|----------|
| PAG-01 | Default `page_size` is 20 | Instantiate `StandardResultsSetPagination()` | `instance.page_size == 20` | P2 |
| PAG-02 | `page_size_query_param` is `"page_size"` | Instantiate `StandardResultsSetPagination()` | `instance.page_size_query_param == "page_size"` | P2 |
| PAG-03 | `max_page_size` is 100 | Instantiate `StandardResultsSetPagination()` | `instance.max_page_size == 100` | P2 |
| PAG-04 | Request omits `page_size` param — default is applied | DB-FIXTURE: ≥21 objects in queryset; GET request without `page_size` | Response contains exactly 20 items; `count` field reflects total | P1 |
| PAG-05 | `page_size=50` param is honoured | DB-FIXTURE: ≥51 objects; GET `?page_size=50` | Response contains exactly 50 items | P1 |
| PAG-06 | `page_size=200` is capped at 100 (hard ceiling) | DB-FIXTURE: ≥101 objects; GET `?page_size=200` | Response contains exactly 100 items — must NOT return 200 items | P1 |
| PAG-07 | `page_size=0` or negative value — DRF default fallback | GET `?page_size=0` | Response uses `page_size = 20` (DRF ignores invalid values and reverts to default) | P1 |
| PAG-08 | Second page is consistent | DB-FIXTURE: 25 objects; GET `?page=2` | Response contains 5 items; `previous` link present, `next` is null | P2 |

**Note on PAG-04 through PAG-08:** These tests require a minimal DRF view wired to a queryset. The test-writer should create a `ListAPIView` stub in the test module itself (not in production code) that uses `StandardResultsSetPagination` as `pagination_class`. This avoids touching production views while still exercising the paginator in a real DRF request cycle.

**Note on PAG-06:** This is the security-relevant case. The docstring explicitly states the cap exists to "prevent bulk data exfiltration." Treat a failure here as a P0 regression if this paginator is applied to any endpoint that returns student PII.

---

### 4.3 `HasModulePermission` — `apps/modules/permissions.py`

All cases that require a real `User` row are INTEGRATION tests (DB-FIXTURE). The unauthenticated case (HMP-01) and the misconfiguration case (HMP-02) can be UNIT tests with stubs.

| Test ID | Scenario | Preconditions | Expected Result | Priority |
|---------|----------|---------------|-----------------|----------|
| HMP-01 | Unauthenticated request | `request.user` is `AnonymousUser` | `has_permission()` returns `False`; `ImproperlyConfigured` is NOT raised (early exit before the config check) | P1 |
| HMP-02 | View missing `required_permission` attribute | Authenticated user (stub); view object has no `required_permission` attribute | `ImproperlyConfigured` is raised with a message naming the view class | P1 |
| HMP-03 | View has `required_permission = None` (explicit null) | Authenticated user; `view.required_permission = None` | `ImproperlyConfigured` is raised — `None` is falsy and triggers the same guard as a missing attribute | P1 |
| HMP-04 | View has `required_permission = ""` (empty string) | Authenticated user; `view.required_permission = ""` | `ImproperlyConfigured` is raised — empty string is falsy | P1 |
| HMP-05 | Superuser bypasses permission check | DB-FIXTURE: `User` with `is_superuser = True`; view has valid `required_permission`; user does NOT have the perm | `has_permission()` returns `True` — `has_perm()` is never called | P1 |
| HMP-06 | Regular user WITH the required permission | DB-FIXTURE: `User` assigned `modules.access_admin` permission | `has_permission()` returns `True` | P1 |
| HMP-07 | Regular user WITHOUT the required permission | DB-FIXTURE: `User` with no permissions assigned | `has_permission()` returns `False` | P1 |
| HMP-08 | Regular user has a DIFFERENT permission (not the required one) | DB-FIXTURE: `User` has `modules.access_tienda`; view requires `modules.access_admin` | `has_permission()` returns `False` — validates specificity, not just any-perm presence | P1 |

**Decision points covered:**
1. `not request.user or not request.user.is_authenticated` → HMP-01
2. `not required` with three falsy values → HMP-02, HMP-03, HMP-04
3. `request.user.is_superuser` → HMP-05
4. `request.user.has_perm(required)` true/false → HMP-06, HMP-07, HMP-08

**Note on HMP-02 through HMP-04:** These test the "fail closed" contract from the docstring. They should assert `pytest.raises(ImproperlyConfigured)` and inspect the exception message to confirm the offending class name is included. This matters operationally: the error must be diagnosable without a stack trace deep-dive.

**Note on HMP-05:** To confirm `has_perm()` is truly not called, the test-writer may use `unittest.mock.patch` on `request.user.has_perm` and assert it was not invoked, or simply verify the user has no permissions assigned yet the call returns `True`.

**Note on HMP-06 through HMP-08:** Permission assignment requires DB write. Use `user.user_permissions.add(permission)` with a real `Permission` object fetched via `Permission.objects.get(codename="access_admin", content_type__app_label="modules")`. This requires `@pytest.mark.django_db` and depends on the `AppModule` permissions being loaded — which happens via `migrate`, not `loaddata`, because `AppModule.Meta.managed = False` means permissions are created by the migration that declares them.

---

## 5. Coverage Gaps

| Module | Current Coverage | Required | Gap | Action |
|--------|-----------------|----------|-----|--------|
| `apps/core/permissions.py` | 0% (no test file) | ≥80% | All 4 branches uncovered | Create `backend/tests/unit/test_core_permissions.py` |
| `apps/core/pagination.py` | 0% (no test file) | ≥80% | Class defaults and runtime cap uncovered | Create `backend/tests/integration/test_core_pagination.py` |
| `apps/modules/permissions.py` | 0% (no test file) | ≥80% | All 8 branches uncovered | Create `backend/tests/unit/test_module_permissions.py` (HMP-01/02/03/04) and `backend/tests/integration/test_module_permissions.py` (HMP-05 through HMP-08) |

**Total uncovered decision branches across all three classes:** 16 branches (4 + 5 + 8 falsy sub-branches) mapped to 19 distinct test cases.

---

## 6. File Placement Convention

Per `backend/CLAUDE.md` structure, place files as follows:

```
backend/
└── tests/
    ├── unit/
    │   ├── test_core_permissions.py      # ISU-01 through ISU-04
    │   └── test_module_permissions.py    # HMP-01 through HMP-04
    └── integration/
        ├── test_core_pagination.py       # PAG-04 through PAG-08
        └── test_module_permissions.py    # HMP-05 through HMP-08
```

PAG-01 through PAG-03 are attribute assertions with no DB requirement; place them in `tests/unit/test_core_pagination.py`.

A `conftest.py` at `backend/tests/` level should define shared fixtures: `regular_user`, `superuser_user`, `user_with_perm(perm_codename)`. These reuse the `User.objects.create_user()` pattern from `apps/users/tests/conftest.py` but are scoped to the top-level test suite.

---

## 7. [QA-BLOCK] Items

None. All decision points in the three classes are verifiable against the source. No acceptance criteria ambiguity identified.

---

## 8. Handoff to test-writer — Ordered Scenarios

Execute in this order to build coverage incrementally without DB dependencies blocking early runs:

| Order | Test IDs | File target | Test type | Priority |
|-------|----------|-------------|-----------|----------|
| 1 | PAG-01, PAG-02, PAG-03 | `tests/unit/test_core_pagination.py` | UNIT | P2 |
| 2 | ISU-01, ISU-02, ISU-03, ISU-04 | `tests/unit/test_core_permissions.py` | UNIT | P1 |
| 3 | HMP-01, HMP-02, HMP-03, HMP-04 | `tests/unit/test_module_permissions.py` | UNIT | P1 |
| 4 | PAG-04, PAG-05, PAG-06, PAG-07, PAG-08 | `tests/integration/test_core_pagination.py` | INTEGRATION (DB) | P1/P2 |
| 5 | HMP-05, HMP-06, HMP-07, HMP-08 | `tests/integration/test_module_permissions.py` | INTEGRATION (DB) | P1 |

**Critical path:** PAG-06 (hard ceiling) and HMP-05 (superuser bypass) are the two cases with the highest business-risk consequence if broken. Prioritize their assertion logic review after test-writer implementation.

**Prerequisite note for test-writer:** The `AppModule` model uses `managed = False` — its table does not exist at the DB level. However, Django still creates the permissions declared in `AppModule.Meta.permissions` during `migrate`. The test suite must run with `--reuse-db` disabled or ensure a fresh migration run, otherwise `modules.access_admin` and sibling permissions may not be available to fetch via `Permission.objects.get()`.
