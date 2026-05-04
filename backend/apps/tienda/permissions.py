from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

GROUP_TIENDA_ADMIN = "tienda_admin"
GROUP_TIENDA_VENDEDOR = "tienda_vendedor"


class IsTiendaAdmin(BasePermission):
    """Allows access only to users in the tienda_admin group."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name=GROUP_TIENDA_ADMIN).exists()
        )


class IsTiendaVendedor(BasePermission):
    """Allows access only to users in the tienda_vendedor group."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name=GROUP_TIENDA_VENDEDOR).exists()
        )


class IsTiendaAdminOrVendedor(BasePermission):
    """Allows access to users in either the tienda_admin or tienda_vendedor group."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(
            name__in=[GROUP_TIENDA_ADMIN, GROUP_TIENDA_VENDEDOR]
        ).exists()
