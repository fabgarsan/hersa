from __future__ import annotations

import pytest
from django.contrib.auth.models import User
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.core.pagination import StandardResultsSetPagination


class UserSerializer(ModelSerializer):  # type: ignore[type-arg]
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserListView(ListAPIView):  # type: ignore[type-arg]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]


@pytest.mark.django_db
def test_pagination_default_page_size_twenty() -> None:
    users = [
        User.objects.create_user(
            username=f"user{i}", email=f"user{i}@example.com", password="pass"
        )
        for i in range(25)
    ]
    auth_user = users[0]

    factory = APIRequestFactory()
    view = UserListView.as_view()
    request = factory.get("/")
    force_authenticate(request, user=auth_user)
    response = view(request)

    assert response.status_code == 200
    assert len(response.data["results"]) == 20
    assert response.data["count"] == 25


@pytest.mark.django_db
def test_pagination_custom_page_size_fifty() -> None:
    users = [
        User.objects.create_user(
            username=f"user{i}", email=f"user{i}@example.com", password="pass"
        )
        for i in range(55)
    ]
    auth_user = users[0]

    factory = APIRequestFactory()
    view = UserListView.as_view()
    request = factory.get("/?page_size=50")
    force_authenticate(request, user=auth_user)
    response = view(request)

    assert response.status_code == 200
    assert len(response.data["results"]) == 50
    assert response.data["count"] == 55


@pytest.mark.django_db
def test_pagination_hard_cap_at_hundred() -> None:
    users = [
        User.objects.create_user(
            username=f"user{i}", email=f"user{i}@example.com", password="pass"
        )
        for i in range(105)
    ]
    auth_user = users[0]

    factory = APIRequestFactory()
    view = UserListView.as_view()
    request = factory.get("/?page_size=200")
    force_authenticate(request, user=auth_user)
    response = view(request)

    assert response.status_code == 200
    assert len(response.data["results"]) == 100
    assert response.data["count"] == 105


@pytest.mark.django_db
def test_pagination_zero_page_size_defaults_to_twenty() -> None:
    users = [
        User.objects.create_user(
            username=f"user{i}", email=f"user{i}@example.com", password="pass"
        )
        for i in range(25)
    ]
    auth_user = users[0]

    factory = APIRequestFactory()
    view = UserListView.as_view()
    request = factory.get("/?page_size=0")
    force_authenticate(request, user=auth_user)
    response = view(request)

    assert response.status_code == 200
    assert len(response.data["results"]) == 20
    assert response.data["count"] == 25


@pytest.mark.django_db
def test_pagination_second_page_with_fewer_items() -> None:
    users = [
        User.objects.create_user(
            username=f"user{i}", email=f"user{i}@example.com", password="pass"
        )
        for i in range(25)
    ]
    auth_user = users[0]

    factory = APIRequestFactory()
    view = UserListView.as_view()
    request = factory.get("/?page=2")
    force_authenticate(request, user=auth_user)
    response = view(request)

    assert response.status_code == 200
    assert len(response.data["results"]) == 5
    assert response.data["count"] == 25
    assert response.data["next"] is None
    assert response.data["previous"] is not None
