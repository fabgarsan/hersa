from __future__ import annotations

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class HasModulePermission(BasePermission):
    """
    Grants access only if the authenticated user has the required module permission.
    Set `required_permission` on the view class, e.g.:
        required_permission = "modules.access_admin"
    """

    message = "You do not have permission to access this module."

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        required: str | None = getattr(view, "required_permission", None)
        if not required:
            return True
        if request.user.is_superuser:
            return True
        return request.user.has_perm(required)
