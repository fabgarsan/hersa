import pytest
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient

AUTH_TOKEN_URL = "/api/token/"
FORGOT_PASSWORD_URL = "/api/users/forgot-password/"
RESET_PASSWORD_URL = "/api/users/reset-password/"


@pytest.mark.django_db
@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
def test_login_throttle_returns_429_after_limit() -> None:
    cache.clear()
    api_client = APIClient()
    for i in range(10):
        response = api_client.post(AUTH_TOKEN_URL, {"username": "invalid", "password": "invalid"})
        assert response.status_code == 401, f"Request {i + 1} should be 401"

    response = api_client.post(AUTH_TOKEN_URL, {"username": "invalid", "password": "invalid"})
    assert response.status_code == 429


@pytest.mark.django_db
@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
def test_forgot_password_throttle_enforced() -> None:
    cache.clear()
    api_client = APIClient()
    for i in range(5):
        response = api_client.post(FORGOT_PASSWORD_URL, {"username_or_email": "test@example.com"})
        assert response.status_code == 200, f"Request {i + 1} should be 200"

    response = api_client.post(FORGOT_PASSWORD_URL, {"username_or_email": "test@example.com"})
    assert response.status_code == 429


@pytest.mark.django_db
@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
def test_password_reset_throttle_enforced() -> None:
    cache.clear()
    api_client = APIClient()
    for i in range(5):
        response = api_client.post(
            RESET_PASSWORD_URL,
            {
                "uid": "invalid",
                "token": "invalid",
                "new_password": "NewPass123!",
                "confirm_password": "NewPass123!",
            },
        )
        assert response.status_code == 400, f"Request {i + 1} should be 400"

    response = api_client.post(
        RESET_PASSWORD_URL,
        {
            "uid": "invalid",
            "token": "invalid",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!",
        },
    )
    assert response.status_code == 429
