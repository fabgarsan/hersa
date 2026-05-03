import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

TOKEN_OBTAIN_URL = "/api/token/"
TOKEN_REFRESH_URL = "/api/token/refresh/"


@pytest.mark.django_db
def test_token_obtain_with_valid_credentials(api_client: APIClient) -> None:
    user = User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="StrongPass123!",
    )
    response = api_client.post(
        TOKEN_OBTAIN_URL,
        {"username": user.username, "password": "StrongPass123!"},
    )
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_token_obtain_invalid_credentials_returns_401(api_client: APIClient) -> None:
    User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="StrongPass123!",
    )
    response = api_client.post(
        TOKEN_OBTAIN_URL,
        {"username": "testuser", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "password" not in response.data


@pytest.mark.django_db
def test_token_obtain_inactive_user_returns_401(api_client: APIClient) -> None:
    user = User.objects.create_user(
        username="inactiveuser",
        email="inactive@example.com",
        password="StrongPass123!",
        is_active=False,
    )
    response = api_client.post(
        TOKEN_OBTAIN_URL,
        {"username": user.username, "password": "StrongPass123!"},
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_refresh_token_rotation_blacklists_old_token(api_client: APIClient) -> None:
    user = User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="StrongPass123!",
    )
    response = api_client.post(
        TOKEN_OBTAIN_URL,
        {"username": user.username, "password": "StrongPass123!"},
    )
    assert response.status_code == 200
    refresh_1 = response.data["refresh"]

    response = api_client.post(TOKEN_REFRESH_URL, {"refresh": refresh_1})
    assert response.status_code == 200

    response = api_client.post(TOKEN_REFRESH_URL, {"refresh": refresh_1})
    assert response.status_code == 401
