from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from django.contrib.auth.models import Permission, User

from apps.modules.permissions import HasModulePermission


@pytest.mark.django_db
def test_has_module_permission_superuser_without_permissions_returns_true(
    superuser_user: User,
) -> None:
    permission = HasModulePermission()
    request = MagicMock()
    request.user = superuser_user
    view = MagicMock()
    view.required_permission = "modules.access_admin"

    assert permission.has_permission(request, view) is True


@pytest.mark.django_db
def test_has_module_permission_regular_user_with_access_admin_returns_true(
    regular_user: User,
) -> None:
    permission_obj = Permission.objects.get(
        codename="access_admin", content_type__app_label="modules"
    )
    regular_user.user_permissions.add(permission_obj)
    # Re-fetch to clear Django's per-instance permission cache.
    fresh_user = User.objects.get(pk=regular_user.pk)

    permission = HasModulePermission()
    request = MagicMock()
    request.user = fresh_user
    view = MagicMock()
    view.required_permission = "modules.access_admin"

    assert permission.has_permission(request, view) is True


@pytest.mark.django_db
def test_has_module_permission_regular_user_with_zero_permissions_returns_false(
    regular_user: User,
) -> None:
    permission = HasModulePermission()
    request = MagicMock()
    request.user = regular_user
    view = MagicMock()
    view.required_permission = "modules.access_admin"

    assert permission.has_permission(request, view) is False


@pytest.mark.django_db
def test_has_module_permission_regular_user_with_wrong_permission_returns_false(
    regular_user: User,
) -> None:
    tienda_perm = Permission.objects.get(
        codename="access_tienda", content_type__app_label="modules"
    )
    regular_user.user_permissions.add(tienda_perm)
    # Re-fetch to clear Django's per-instance permission cache.
    fresh_user = User.objects.get(pk=regular_user.pk)

    permission = HasModulePermission()
    request = MagicMock()
    request.user = fresh_user
    view = MagicMock()
    view.required_permission = "modules.access_admin"

    assert permission.has_permission(request, view) is False
