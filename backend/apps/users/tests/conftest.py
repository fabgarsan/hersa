import pytest
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def use_locmem_cache():  # type: ignore[no-untyped-def]
    with override_settings(
        CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
    ):
        cache.clear()
        yield
        cache.clear()


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


@pytest.fixture
def auth_client(user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client
