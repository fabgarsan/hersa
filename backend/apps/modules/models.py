from __future__ import annotations

import uuid

from django.contrib.auth.models import User
from django.db import models


class Module(models.Model):
    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    slug = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class UserModulePermission(models.Model):
    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="module_permissions")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="user_permissions")

    class Meta:
        unique_together = ("user", "module")

    def __str__(self) -> str:
        return f"{self.user.username} → {self.module.slug}"
