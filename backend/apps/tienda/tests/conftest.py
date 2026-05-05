from __future__ import annotations

from decimal import Decimal

import pytest
from django.contrib.auth.models import Group, User
from rest_framework.test import APIClient

from apps.tienda.models import Location, LocationStock, Product
from apps.tienda.permissions import GROUP_TIENDA_ADMIN, GROUP_TIENDA_VENDEDOR
from apps.tienda.tests.factories import LocationStockFactory, ProductFactory, UserFactory


@pytest.fixture
def api_client() -> APIClient:
    """Return an unauthenticated APIClient."""
    return APIClient()


@pytest.fixture
def admin_user(db) -> User:
    """Create a user with tienda_admin group membership."""
    user = UserFactory()
    admin_group, _ = Group.objects.get_or_create(name=GROUP_TIENDA_ADMIN)
    user.groups.add(admin_group)
    return user


@pytest.fixture
def seller_user(db) -> User:
    """Create a user with tienda_vendedor group membership."""
    user = UserFactory()
    seller_group, _ = Group.objects.get_or_create(name=GROUP_TIENDA_VENDEDOR)
    user.groups.add(seller_group)
    return user


@pytest.fixture
def admin_client(admin_user) -> APIClient:
    """Return an APIClient authenticated as an admin user."""
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def seller_client(seller_user) -> APIClient:
    """Return an APIClient authenticated as a seller user."""
    client = APIClient()
    client.force_authenticate(user=seller_user)
    return client


@pytest.fixture
def central_location(db) -> Location:
    """Get or create the CENTRAL location (seeded by migration 0002)."""
    location, _ = Location.objects.get_or_create(
        location_type=Location.LocationType.CENTRAL,
        defaults={"name": "CENTRAL"},
    )
    return location


@pytest.fixture
def pos_location(db) -> Location:
    """Get or create a POS location (seeded by migration 0002)."""
    location, _ = Location.objects.get_or_create(
        name="Tienda",
        defaults={"location_type": Location.LocationType.POS},
    )
    return location


@pytest.fixture
def product(db) -> Product:
    """Create a basic product."""
    return ProductFactory()


@pytest.fixture
def product_with_stock(db, product, central_location) -> LocationStock:
    """Create LocationStock for a product at central location with quantity 100."""
    return LocationStockFactory(
        product=product,
        location=central_location,
        current_quantity=Decimal("100.0000"),
    )
