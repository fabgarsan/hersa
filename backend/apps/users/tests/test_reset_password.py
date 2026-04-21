import pytest
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

URL = "/api/users/reset-password/"
_token_generator = PasswordResetTokenGenerator()


def _make_uid_token(user: User) -> tuple[str, str]:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = _token_generator.make_token(user)
    return uid, token


@pytest.mark.django_db
def test_reset_password_success(api_client: APIClient, user: User) -> None:
    uid, token = _make_uid_token(user)
    response = api_client.post(
        URL,
        {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("NewStrongPass456@")


@pytest.mark.django_db
def test_reset_password_token_invalidated_after_use(api_client: APIClient, user: User) -> None:
    uid, token = _make_uid_token(user)
    payload = {
        "uid": uid,
        "token": token,
        "new_password": "NewStrongPass456@",
        "confirm_password": "NewStrongPass456@",
    }
    api_client.post(URL, payload)
    response = api_client.post(URL, payload)
    assert response.status_code == 400


@pytest.mark.django_db
def test_reset_password_invalid_uid(api_client: APIClient, user: User) -> None:
    _, token = _make_uid_token(user)
    response = api_client.post(
        URL,
        {
            "uid": "invaliduid",
            "token": token,
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_reset_password_invalid_token(api_client: APIClient, user: User) -> None:
    uid, _ = _make_uid_token(user)
    response = api_client.post(
        URL,
        {
            "uid": uid,
            "token": "invalid-token",
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_reset_password_inactive_user(api_client: APIClient, inactive_user: User) -> None:
    uid, token = _make_uid_token(inactive_user)
    response = api_client.post(
        URL,
        {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 403


@pytest.mark.parametrize(
    "payload_override,expected_error_key",
    [
        ({"confirm_password": "Mismatch!"}, "confirm_password"),
        ({"new_password": "weak", "confirm_password": "weak"}, "new_password"),
    ],
)
@pytest.mark.django_db
def test_reset_password_validation_errors(
    api_client: APIClient,
    user: User,
    payload_override: dict[str, str],
    expected_error_key: str,
) -> None:
    uid, token = _make_uid_token(user)
    payload = {
        "uid": uid,
        "token": token,
        "new_password": "NewStrongPass456@",
        "confirm_password": "NewStrongPass456@",
        **payload_override,
    }
    response = api_client.post(URL, payload)
    assert response.status_code == 400
    assert expected_error_key in response.data


@pytest.mark.django_db
def test_reset_password_accessible_without_auth(api_client: APIClient, user: User) -> None:
    uid, token = _make_uid_token(user)
    response = api_client.post(
        URL,
        {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongPass456@",
            "confirm_password": "NewStrongPass456@",
        },
    )
    assert response.status_code == 200
