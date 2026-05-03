import pytest
from django.contrib.auth.models import Permission, User
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
def test_my_permissions_does_not_leak_other_users_permissions(api_client: APIClient) -> None:
    user_a = User.objects.create_user(
        username="usera", email="usera@example.com", password="StrongPass123!"
    )
    user_b = User.objects.create_user(
        username="userb", email="userb@example.com", password="StrongPass123!"
    )

    perm = Permission.objects.filter(content_type__app_label="users").first()
    assert perm is not None, "No permissions found for users app — check migrations"
    user_a.user_permissions.add(perm)
    # Refresh from DB so Django's permission cache is cleared
    user_a = User.objects.get(pk=user_a.pk)

    api_client.force_authenticate(user=user_a)
    response_a = api_client.get(MY_PERMISSIONS_URL)
    assert response_a.status_code == 200

    api_client.force_authenticate(user=user_b)
    response_b = api_client.get(MY_PERMISSIONS_URL)
    assert response_b.status_code == 200

    assert len(response_a.data) > 0
    assert len(response_b.data) == 0
    assert response_a.data != response_b.data


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
