import pytest
from django.conf import settings
from rest_framework.test import APIClient

AUTH_TOKEN_URL = "/api/token/"
FORGOT_PASSWORD_URL = "/api/users/forgot-password/"
RESET_PASSWORD_URL = "/api/users/reset-password/"


def _throttle_limit(scope: str) -> int:
    # django-stubs types REST_FRAMEWORK as object; runtime value is a dict
    rate: str = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"][scope]  # type: ignore[index]
    return int(rate.split("/")[0])


@pytest.mark.django_db
def test_login_throttle_returns_429_after_limit() -> None:
    limit = _throttle_limit("auth")
    api_client = APIClient()
    for i in range(limit):
        response = api_client.post(AUTH_TOKEN_URL, {"username": "invalid", "password": "invalid"})
        assert response.status_code == 401, f"Request {i + 1} of {limit} should be 401"

    response = api_client.post(AUTH_TOKEN_URL, {"username": "invalid", "password": "invalid"})
    assert response.status_code == 429


@pytest.mark.django_db
def test_forgot_password_throttle_enforced() -> None:
    limit = _throttle_limit("password_reset")
    api_client = APIClient()
    for i in range(limit):
        response = api_client.post(FORGOT_PASSWORD_URL, {"username_or_email": "test@example.com"})
        assert response.status_code == 200, f"Request {i + 1} of {limit} should be 200"

    response = api_client.post(FORGOT_PASSWORD_URL, {"username_or_email": "test@example.com"})
    assert response.status_code == 429


@pytest.mark.django_db
def test_password_reset_throttle_enforced() -> None:
    limit = _throttle_limit("password_reset")
    api_client = APIClient()
    payload = {
        "uid": "invalid",
        "token": "invalid",
        "new_password": "NewPass123!",
        "confirm_password": "NewPass123!",
    }
    for i in range(limit):
        response = api_client.post(RESET_PASSWORD_URL, payload)
        assert response.status_code == 400, f"Request {i + 1} of {limit} should be 400"

    response = api_client.post(RESET_PASSWORD_URL, payload)
    assert response.status_code == 429
