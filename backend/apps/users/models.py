from __future__ import annotations

import uuid

from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Profile({self.user.username})"
