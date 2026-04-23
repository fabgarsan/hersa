from __future__ import annotations

from django.contrib import admin

from .models import Module, UserModulePermission


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["name", "slug", "is_active"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["is_active"]


@admin.register(UserModulePermission)
class UserModulePermissionAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["user", "module"]
    list_select_related = ["user", "module"]
    search_fields = ["user__username", "module__slug"]
