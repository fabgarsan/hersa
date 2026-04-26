from __future__ import annotations

# All views in this module MUST use HasModulePermission and declare `required_permission`.
# Example:
#
#   class AdminView(APIView):
#       permission_classes = [IsAuthenticated, HasModulePermission]
#       required_permission = "modules.access_admin"
#
# Never rely on frontend ModuleGuard alone — server-side enforcement is mandatory.
from .permissions import HasModulePermission

__all__ = ["HasModulePermission"]
