from typing import Any
from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from apps.users.constants import MESSAGES

URL = "/api/users/forgot-password/"


@pytest.mark.django_db
def test_forgot_password_with_username_sends_email(
    api_client: APIClient, user: User, mailoutbox: list[Any]
) -> None:
    response = api_client.post(URL, {"username_or_email": user.username})
    assert response.status_code == 200
    assert response.data["detail"] == MESSAGES["success"]["PASSWORD_RESET_EMAIL_SENT"]
    assert len(mailoutbox) == 1
    assert user.email in mailoutbox[0].to
    assert "reset-password" in mailoutbox[0].body


@pytest.mark.django_db
def test_forgot_password_with_email_sends_email(
    api_client: APIClient, user: User, mailoutbox: list[Any]
) -> None:
    response = api_client.post(URL, {"username_or_email": user.email})
    assert response.status_code == 200
    assert len(mailoutbox) == 1
    assert user.email in mailoutbox[0].to


@pytest.mark.django_db
def test_forgot_password_unknown_user_no_email_same_message(
    api_client: APIClient, mailoutbox: list[Any]
) -> None:
    response = api_client.post(URL, {"username_or_email": "doesnotexist"})
    assert response.status_code == 200
    assert response.data["detail"] == MESSAGES["success"]["PASSWORD_RESET_EMAIL_SENT"]
    assert len(mailoutbox) == 0


@pytest.mark.django_db
def test_forgot_password_inactive_user_no_email(
    api_client: APIClient, inactive_user: User, mailoutbox: list[Any]
) -> None:
    response = api_client.post(URL, {"username_or_email": inactive_user.username})
    assert response.status_code == 200
    assert len(mailoutbox) == 0


@pytest.mark.django_db
def test_forgot_password_user_without_email_no_email_sent(
    api_client: APIClient, mailoutbox: list[Any]
) -> None:
    User.objects.create_user(username="noemail", password="StrongPass123!")
    response = api_client.post(URL, {"username_or_email": "noemail"})
    assert response.status_code == 200
    assert len(mailoutbox) == 0


@pytest.mark.django_db
def test_forgot_password_accessible_without_auth(api_client: APIClient, user: User) -> None:
    # Bypass throttling — this test only verifies authentication is not required
    with patch("apps.users.views.ForgotPasswordView.throttle_classes", []):
        response = api_client.post(URL, {"username_or_email": user.username})
    assert response.status_code == 200


@pytest.mark.django_db
def test_username_field_rejects_oversized_payload(api_client: APIClient) -> None:
    response = api_client.post(URL, {"username_or_email": "a" * 255})
    assert response.status_code == 400
    assert "username_or_email" in response.data


@pytest.mark.django_db
def test_username_field_with_sql_injection_payload(api_client: APIClient) -> None:
    response = api_client.post(URL, {"username_or_email": "' OR 1=1; --"})
    assert response.status_code in (200, 400)
    assert response.status_code != 500


@pytest.mark.django_db
def test_forgot_password_email_send_failure_gracefully_handles_exception(
    api_client: APIClient, user: User
) -> None:
    with patch("apps.users.views.ForgotPasswordView.throttle_classes", []):
        with patch("django.core.mail.send_mail", side_effect=Exception("SMTP error")):
            response = api_client.post(URL, {"username_or_email": user.username})
    assert response.status_code == 200
    assert response.data["detail"] == MESSAGES["success"]["PASSWORD_RESET_EMAIL_SENT"]
