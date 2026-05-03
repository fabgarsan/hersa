from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ImproperlyConfigured
from rest_framework.views import APIView

from apps.modules.permissions import HasModulePermission


def test_has_module_permission_anonymous_user_returns_false() -> None:
    permission = HasModulePermission()
    request = MagicMock()
    request.user = AnonymousUser()
    view = MagicMock()

    assert permission.has_permission(request, view) is False


def test_has_module_permission_view_missing_required_permission_attribute_raises() -> None:
    class _ViewWithoutPerm(APIView):
        pass

    permission = HasModulePermission()
    request = MagicMock()
    request.user = MagicMock()
    request.user.is_authenticated = True
    view = _ViewWithoutPerm()

    with pytest.raises(ImproperlyConfigured) as exc_info:
        permission.has_permission(request, view)

    assert "_ViewWithoutPerm" in str(exc_info.value)
    assert "required_permission" in str(exc_info.value)


@pytest.mark.parametrize(
    "required_permission",
    [None, ""],
    ids=["none", "empty_string"],
)
def test_has_module_permission_falsy_required_permission_raises(
    required_permission: str | None,
) -> None:
    permission = HasModulePermission()
    request = MagicMock()
    request.user = MagicMock()
    request.user.is_authenticated = True
    view = MagicMock()
    view.__class__.__name__ = "AdminView"
    view.required_permission = required_permission

    with pytest.raises(ImproperlyConfigured) as exc_info:
        permission.has_permission(request, view)

    assert "AdminView" in str(exc_info.value)
