from __future__ import annotations

import pytest
from django.contrib.auth.models import User


@pytest.fixture
def regular_user(db: None) -> User:
    return User.objects.create_user(
        username="regularuser",
        email="regular@example.com",
        password="StrongPass123!",
        is_active=True,
        is_superuser=False,
    )


@pytest.fixture
def superuser_user(db: None) -> User:
    return User.objects.create_superuser(
        username="superuser",
        email="superuser@example.com",
        password="StrongPass123!",
    )
