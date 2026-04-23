from __future__ import annotations

from django.contrib.auth.models import User
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Module, UserModulePermission


class MyModulePermissionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        assert isinstance(request.user, User)

        if request.user.is_superuser:
            slugs = list(
                Module.objects.filter(is_active=True).values_list("slug", flat=True)
            )
        else:
            slugs = list(
                UserModulePermission.objects.filter(
                    user=request.user,
                    module__is_active=True,
                )
                .select_related("module")
                .values_list("module__slug", flat=True)
            )

        return Response(slugs)
