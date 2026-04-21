import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db: None) -> User:
    return User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="StrongPass123!",
        is_active=True,
    )


@pytest.fixture
def inactive_user(db: None) -> User:
    return User.objects.create_user(
        username="inactive",
        email="inactive@example.com",
        password="StrongPass123!",
        is_active=False,
    )
