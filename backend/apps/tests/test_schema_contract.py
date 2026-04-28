"""Contract tests using schemathesis 4.x.

Strategy
--------
Tests are split into two groups:

1. Schema validity — pure YAML parsing, no HTTP calls, no DB required.
2. Stateless fuzzing — schemathesis generates payloads from the OpenAPI schema
   and calls the Django WSGI app in-process.

Schema loading
--------------
Group 1 reads ``schema.yml`` directly from disk.

Group 2 loads ``schema.yml`` via ``schemathesis.openapi.from_path``, then
injects the Django WSGI application into ``schema.app`` so that
``case.call_and_validate()`` uses the WSGI transport instead of making real
HTTP requests.  This keeps tests fast and CI-friendly (no network, no port).

If ``schema.yml`` is absent, all fuzzing tests are skipped with an explicit
message directing the developer to generate the file.

Endpoint coverage
-----------------

Fuzzed automatically (AllowAny — no credentials required):
  POST /api/token/                    obtain JWT pair
  POST /api/token/refresh/            refresh JWT
  POST /api/users/forgot-password/    request password-reset email
  POST /api/users/reset-password/     consume uid+token, set new password

Excluded from fuzzing — auth required (covered by integration tests):
  GET  /api/users/me/                 IsAuthenticated  → apps/users/tests/
  GET  /api/users/my-permissions/     IsAuthenticated  → apps/users/tests/
  POST /api/users/change-password/    IsAuthenticated  → apps/users/tests/

Excluded — internal tooling behind IsAdminUser permission gate:
  GET  /api/schema/
  GET  /api/docs/
  GET  /api/redoc/

Regenerating schema.yml
------------------------
    # Inside the running Docker backend container:
    docker compose exec backend pipenv run python manage.py spectacular \\
        --color --file ../schema.yml

    # Or using the convenience script:
    bash backend/scripts/generate_schema.sh
"""

from __future__ import annotations

import pathlib
from typing import Any

import pytest
import yaml
from schemathesis.openapi import from_path

# ---------------------------------------------------------------------------
# Paths and constants
# ---------------------------------------------------------------------------

# schema.yml lives at the monorepo root — four levels above this file:
# backend/apps/tests/test_schema_contract.py  →  ../../../..  →  monorepo root
_MONOREPO_ROOT: pathlib.Path = pathlib.Path(__file__).resolve().parents[4]
_SCHEMA_PATH: pathlib.Path = _MONOREPO_ROOT / "schema.yml"

# Paths excluded from stateless fuzzing because they require authentication
# or are internal admin tooling.  These are covered by other test suites.
_EXCLUDED_PATHS: list[str] = [
    "/api/users/me/",
    "/api/users/my-permissions/",
    "/api/users/change-password/",
    "/api/schema/",
    "/api/docs/",
    "/api/redoc/",
]


# ---------------------------------------------------------------------------
# Schema validity tests — no DB or running server needed
# ---------------------------------------------------------------------------


class TestSchemaValidity:
    """Verify that schema.yml is a parseable, non-empty OpenAPI document."""

    def test_schema_file_exists(self) -> None:
        """schema.yml must be present at the monorepo root.

        Run the following command before executing this suite:

            docker compose exec backend pipenv run python manage.py spectacular \\
                --color --file ../schema.yml

        Or equivalently:

            bash backend/scripts/generate_schema.sh
        """
        assert _SCHEMA_PATH.exists(), (
            f"schema.yml not found at {_SCHEMA_PATH}. "
            "Run backend/scripts/generate_schema.sh to generate it."
        )

    def test_schema_is_valid_openapi(self) -> None:
        """schema.yml must be valid YAML with the mandatory OpenAPI keys."""
        if not _SCHEMA_PATH.exists():
            pytest.skip("schema.yml not present — run generate_schema.sh first")

        with _SCHEMA_PATH.open(encoding="utf-8") as fh:
            doc: dict[str, Any] = yaml.safe_load(fh)

        assert isinstance(doc, dict), "schema.yml must be a YAML mapping at the top level"
        assert "openapi" in doc or "swagger" in doc, (
            "schema.yml must contain an 'openapi' or 'swagger' key"
        )
        assert "paths" in doc, "schema.yml must contain a 'paths' section"
        assert len(doc["paths"]) > 0, "schema.yml must expose at least one path"

    def test_schema_has_expected_endpoints(self) -> None:
        """Core user-management endpoints must appear in the schema."""
        if not _SCHEMA_PATH.exists():
            pytest.skip("schema.yml not present — run generate_schema.sh first")

        with _SCHEMA_PATH.open(encoding="utf-8") as fh:
            doc: dict[str, Any] = yaml.safe_load(fh)

        paths: dict[str, Any] = doc.get("paths", {})
        expected = [
            "/api/token/",
            "/api/token/refresh/",
            "/api/users/me/",
            "/api/users/my-permissions/",
            "/api/users/change-password/",
            "/api/users/forgot-password/",
            "/api/users/reset-password/",
        ]
        missing = [ep for ep in expected if ep not in paths]
        assert not missing, (
            f"Expected endpoints absent from schema: {missing}. "
            "Regenerate schema.yml after ensuring @extend_schema decorators are in place."
        )

    def test_schema_info_block(self) -> None:
        """schema.yml must have a non-empty info.title and info.version."""
        if not _SCHEMA_PATH.exists():
            pytest.skip("schema.yml not present — run generate_schema.sh first")

        with _SCHEMA_PATH.open(encoding="utf-8") as fh:
            doc: dict[str, Any] = yaml.safe_load(fh)

        info: dict[str, Any] = doc.get("info", {})
        assert info.get("title"), "schema info.title must not be empty"
        assert info.get("version"), "schema info.version must not be empty"


# ---------------------------------------------------------------------------
# Stateless fuzzing — public (AllowAny) endpoints only
# ---------------------------------------------------------------------------
#
# schemathesis 4.x pattern for WSGI testing without a running server:
#
#   1. Load schema from schema.yml at module import time using ``from_path``.
#   2. Inject the Django WSGI app into ``schema.app`` so that the WSGI
#      transport is selected automatically by ``transport.get(schema.app)``.
#   3. Exclude auth-required paths via ``schema.exclude(path=...)``.
#   4. Decorate the test function with ``schema.parametrize()`` at definition
#      time — pytest-schemathesis plugin generates one test case per operation.
#
# If schema.yml is absent at import time, ``_fuzz_schema`` is None and a
# placeholder skip-test is registered instead.
# ---------------------------------------------------------------------------


def _build_fuzz_schema() -> Any:
    """Load and configure the fuzzing schema from schema.yml.

    Returns None if the file does not exist (tests will be skipped).
    """
    if not _SCHEMA_PATH.exists():
        return None

    from hersa.wsgi import application as _wsgi_app

    schema = from_path(_SCHEMA_PATH).exclude(path=_EXCLUDED_PATHS)
    # Inject the WSGI app so that schemathesis uses the in-process transport
    # instead of making real HTTP requests.
    schema.app = _wsgi_app
    return schema


_fuzz_schema: Any = _build_fuzz_schema()


if _fuzz_schema is not None:

    @_fuzz_schema.parametrize()  # type: ignore[untyped-decorator]
    @pytest.mark.django_db(databases=["default"])
    def test_public_endpoints_no_server_error(case: Any) -> None:
        """No public endpoint must return HTTP 5xx for any schema-valid payload.

        schemathesis generates boundary-case and random payloads for each
        operation defined in the schema and asserts that:
          - The server does not return an HTTP 5xx status code.
          - Response bodies conform to the declared response schema.
          - No unhandled exceptions leak through the WSGI layer.

        Because the schema is loaded with the WSGI app injected, requests go
        directly through the Django application stack without any network I/O.

        Auth-required and admin endpoints are excluded via ``_EXCLUDED_PATHS``.
        They are covered by the integration tests in ``apps/users/tests/``.
        """
        case.call_and_validate()

else:

    def test_public_endpoints_no_server_error_skipped() -> None:
        """Fuzzing tests skipped because schema.yml is not present.

        Generate schema.yml first:
            docker compose exec backend pipenv run python manage.py spectacular \\
                --color --file ../schema.yml
        """
        pytest.skip(
            "schema.yml not present — run backend/scripts/generate_schema.sh "
            "and re-run tests."
        )
