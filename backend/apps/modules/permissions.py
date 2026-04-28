from __future__ import annotations

from django.core.exceptions import ImproperlyConfigured
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class HasModulePermission(BasePermission):
    """
    Grants access only if the authenticated user has the required module permission.
    Set `required_permission` on the view class, e.g.:
        required_permission = "modules.access_admin"

    Raises ImproperlyConfigured at runtime if the view omits `required_permission`,
    ensuring misconfigured views fail closed rather than silently granting access.
    """

    message = "You do not have permission to access this module."

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        required: str | None = getattr(view, "required_permission", None)
        if not required:
            raise ImproperlyConfigured(
                f"{view.__class__.__name__} uses HasModulePermission but does not"
                " declare `required_permission`."
            )
        if request.user.is_superuser:
            return True
        return request.user.has_perm(required)
