import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

URL = "/api/users/change-password/"


@pytest.mark.django_db
def test_change_password_requires_auth(api_client: APIClient) -> None:
    response = api_client.post(URL, {})
    assert response.status_code == 401


@pytest.mark.django_db
def test_change_password_success(api_client: APIClient, user: User) -> None:
    api_client.force_authenticate(user=user)
    response = api_client.post(
        URL,
        {
            "current_password": "StrongPass123!",
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("NewStrongPass456@")


@pytest.mark.django_db
def test_change_password_wrong_current_password(api_client: APIClient, user: User) -> None:
    api_client.force_authenticate(user=user)
    response = api_client.post(
        URL,
        {
            "current_password": "WrongPassword!",
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 400
    assert "current_password" in response.data


@pytest.mark.django_db
def test_change_password_inactive_user(api_client: APIClient, inactive_user: User) -> None:
    api_client.force_authenticate(user=inactive_user)
    response = api_client.post(
        URL,
        {
            "current_password": "StrongPass123!",
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 403


@pytest.mark.parametrize(
    "payload,expected_error_key",
    [
        (
            {
                "current_password": "StrongPass123!",
                "new_password": "NewStrongPass456@",
                "confirm_password": "Mismatch!",
            },
            "confirm_password",
        ),
        (
            {
                "current_password": "StrongPass123!",
                "new_password": "weak",
                "confirm_password": "weak",
            },
            "new_password",
        ),
    ],
)
@pytest.mark.django_db
def test_change_password_validation_errors(
    api_client: APIClient,
    user: User,
    payload: dict[str, str],
    expected_error_key: str,
) -> None:
    api_client.force_authenticate(user=user)
    response = api_client.post(URL, payload)
    assert response.status_code == 400
    assert expected_error_key in response.data


@pytest.mark.django_db
def test_active_jwt_remains_valid_after_password_change(api_client: APIClient, user: User) -> None:
    response = api_client.post(
        "/api/token/",
        {"username": user.username, "password": "StrongPass123!"},
    )
    assert response.status_code == 200
    refresh_token_old = response.data["refresh"]

    api_client.force_authenticate(user=user)
    response = api_client.post(
        URL,
        {
            "current_password": "StrongPass123!",
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 200

    api_client = APIClient()
    response = api_client.post("/api/token/refresh/", {"refresh": refresh_token_old})
    # KNOWN RISK: refresh tokens issued before password change remain valid until expiry (4h). See GAP-04.
    assert response.status_code == 200


@pytest.mark.django_db
def test_change_password_rejects_same_as_current_password(api_client: APIClient, user: User) -> None:
    api_client.force_authenticate(user=user)
    response = api_client.post(
        URL,
        {
            "current_password": "StrongPass123!",
            "new_password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
        },
    )
    assert response.status_code == 400
    assert "new_password" in response.data
