import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

ME_URL = "/api/users/me/"
MY_PERMISSIONS_URL = "/api/users/my-permissions/"


@pytest.mark.django_db
def test_me_returns_authenticated_user_data(auth_client: APIClient, user: User) -> None:
    response = auth_client.get(ME_URL)
    assert response.status_code == 200
    assert "id" in response.data
    assert "username" in response.data
    assert "email" in response.data
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email


@pytest.mark.django_db
def test_me_rejects_anonymous(api_client: APIClient) -> None:
    response = api_client.get(ME_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_me_serializer_excludes_sensitive_fields(auth_client: APIClient) -> None:
    response = auth_client.get(ME_URL)
    assert response.status_code == 200
    assert "password" not in response.data
    assert "is_superuser" not in response.data
    assert "is_staff" not in response.data


@pytest.mark.django_db
def test_my_permissions_rejects_anonymous(api_client: APIClient) -> None:
    response = api_client.get(MY_PERMISSIONS_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_my_permissions_returns_user_own_permissions(api_client: APIClient) -> None:
    user_a = User.objects.create_user(
        username="usera",
        email="usera@example.com",
        password="StrongPass123!",
    )
    user_b = User.objects.create_user(
        username="userb",
        email="userb@example.com",
        password="StrongPass123!",
    )

    api_client.force_authenticate(user=user_a)
    response = api_client.get(MY_PERMISSIONS_URL)
    assert response.status_code == 200
    user_a_perms = response.data

    api_client.force_authenticate(user=user_b)
    response = api_client.get(MY_PERMISSIONS_URL)
    assert response.status_code == 200
    user_b_perms = response.data

    assert user_a_perms == user_b_perms


@pytest.mark.django_db
def test_my_permissions_superuser_returns_hersa_perms(api_client: APIClient) -> None:
    superuser = User.objects.create_superuser(
        username="superuser",
        email="super@example.com",
        password="StrongPass123!",
    )
    api_client.force_authenticate(user=superuser)
    response = api_client.get(MY_PERMISSIONS_URL)
    assert response.status_code == 200
    perms = response.data

    assert isinstance(perms, list)
    assert len(perms) > 0

    for perm in perms:
        assert isinstance(perm, str)
        assert "." in perm
        app_label, codename = perm.split(".")
        assert app_label in {"users", "modules"}
