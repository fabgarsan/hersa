from __future__ import annotations

from unittest.mock import MagicMock

from django.contrib.auth.models import AnonymousUser

from apps.core.permissions import IsSuperUser


def test_is_superuser_anonymous_user_returns_false() -> None:
    permission = IsSuperUser()
    request = MagicMock()
    request.user = AnonymousUser()
    view = MagicMock()

    assert permission.has_permission(request, view) is False


def test_is_superuser_authenticated_non_superuser_returns_false() -> None:
    permission = IsSuperUser()
    request = MagicMock()
    request.user = MagicMock()
    request.user.is_authenticated = True
    request.user.is_superuser = False
    view = MagicMock()

    assert permission.has_permission(request, view) is False


def test_is_superuser_authenticated_superuser_returns_true() -> None:
    permission = IsSuperUser()
    request = MagicMock()
    request.user = MagicMock()
    request.user.is_authenticated = True
    request.user.is_superuser = True
    view = MagicMock()

    assert permission.has_permission(request, view) is True


def test_is_superuser_staff_without_superuser_returns_false() -> None:
    permission = IsSuperUser()
    request = MagicMock()
    request.user = MagicMock()
    request.user.is_authenticated = True
    request.user.is_superuser = False
    request.user.is_staff = True
    view = MagicMock()

    assert permission.has_permission(request, view) is False
