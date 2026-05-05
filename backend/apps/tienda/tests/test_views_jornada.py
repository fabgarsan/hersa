from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest

from apps.tienda.models import InventoryMovement, Location, SalesDay
from apps.tienda.tests.factories import (
    LocationFactory,
    ProductFactory,
    SalesDayFactory,
    UserFactory,
)


@pytest.mark.django_db
class TestSalesDayListView:
    """Test SalesDayListView (EP-03/EP-04)."""

    def test_unauthenticated_get_returns_401(self, api_client):
        """Test that unauthenticated GET /jornadas/ returns 401."""
        response = api_client.get("/api/v1/tienda/jornadas/")

        assert response.status_code == 401

    def test_admin_post_creates_jornada(self, admin_client, pos_location):
        """Test that admin POST /jornadas/ creates sales day."""
        payload = {
            "location": str(pos_location.id),
            "date": date.today().isoformat(),
        }

        response = admin_client.post("/api/v1/tienda/jornadas/", payload)

        assert response.status_code == 201
        data = response.json()
        sales_day = SalesDay.objects.get(id=data["id"])
        assert sales_day.location == pos_location
        assert sales_day.status == SalesDay.Status.OPEN

    def test_seller_post_creates_jornada_for_self(self, seller_client, pos_location):
        """Test that seller can create jornada for their own sales."""
        payload = {
            "location": str(pos_location.id),
            "date": date.today().isoformat(),
        }

        response = seller_client.post("/api/v1/tienda/jornadas/", payload)

        assert response.status_code == 201

    def test_duplicate_open_jornada_returns_409(self, admin_client, pos_location):
        """Test that duplicate open jornada returns 409 (BR-008)."""
        SalesDayFactory(location=pos_location, status=SalesDay.Status.OPEN)

        payload = {
            "location": str(pos_location.id),
            "date": date.today().isoformat(),
        }

        response = admin_client.post("/api/v1/tienda/jornadas/", payload)

        assert response.status_code == 409

    def test_admin_sees_all_jornadas(self, admin_client, seller_user):
        """Test that admin can see all jornadas."""
        seller1 = seller_user
        seller2 = UserFactory()
        location1 = LocationFactory(location_type=Location.LocationType.POS)
        location2 = LocationFactory(location_type=Location.LocationType.POS)
        SalesDayFactory(seller=seller1, location=location1)
        SalesDayFactory(seller=seller2, location=location2)

        response = admin_client.get("/api/v1/tienda/jornadas/")

        assert response.status_code == 200

    def test_seller_sees_only_own_jornadas(self, seller_client, seller_user):
        """Test that seller sees only their own jornadas."""
        seller2 = UserFactory()
        location1 = LocationFactory(location_type=Location.LocationType.POS)
        location2 = LocationFactory(location_type=Location.LocationType.POS)
        own = SalesDayFactory(seller=seller_user, location=location1)
        other = SalesDayFactory(seller=seller2, location=location2)

        response = seller_client.get("/api/v1/tienda/jornadas/")

        assert response.status_code == 200
        data = response.json()
        ids = [j["id"] for j in data]
        assert str(own.id) in ids
        assert str(other.id) not in ids


@pytest.mark.django_db
class TestSalesDayDetailView:
    """Test SalesDayDetailView (EP-03/EP-04)."""

    def test_seller_cannot_see_another_sellers_jornada(
        self, seller_user, pos_location
    ):
        """Test that seller gets 404 for another seller's jornada (IDOR)."""
        other_seller = UserFactory()
        jornada = SalesDayFactory(seller=other_seller, location=pos_location)

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.get(f"/api/v1/tienda/jornadas/{jornada.id}/")

        assert response.status_code == 404

    def test_admin_can_see_any_jornada(self, admin_client, seller_user, pos_location):
        """Test that admin can see any seller's jornada."""
        jornada = SalesDayFactory(seller=seller_user, location=pos_location)

        response = admin_client.get(f"/api/v1/tienda/jornadas/{jornada.id}/")

        assert response.status_code == 200

    def test_seller_response_excludes_financial_fields(
        self, seller_user, pos_location
    ):
        """Test that seller response excludes cash_delivery, revenue_total, etc."""
        jornada = SalesDayFactory(seller=seller_user, location=pos_location)
        jornada.cash_delivery = Decimal("1000.00")
        jornada.revenue_total = Decimal("1500.00")
        jornada.save()

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.get(f"/api/v1/tienda/jornadas/{jornada.id}/")

        assert response.status_code == 200
        data = response.json()
        assert "cash_delivery" not in data
        assert "revenue_total" not in data
        assert "cash_alert" not in data

    def test_admin_response_includes_financial_fields(self, admin_client, seller_user, pos_location):
        """Test that admin response includes financial fields."""
        jornada = SalesDayFactory(seller=seller_user, location=pos_location)
        jornada.cash_delivery = Decimal("1000.00")
        jornada.revenue_total = Decimal("1500.00")
        jornada.cash_alert = SalesDay.CashAlert.OK
        jornada.save()

        response = admin_client.get(f"/api/v1/tienda/jornadas/{jornada.id}/")

        assert response.status_code == 200
        data = response.json()
        assert "cash_delivery" in data
        assert "revenue_total" in data
        assert "cash_alert" in data


@pytest.mark.django_db
class TestSalesDayBulkTransferView:
    """Test SalesDayBulkTransferView (EP-03/EP-04)."""

    def test_bulk_transfer_to_closed_jornada_returns_400(
        self, admin_client, central_location, pos_location
    ):
        """Test that bulk transfer to closed jornada returns 400."""
        jornada = SalesDayFactory(location=pos_location, status=SalesDay.Status.CLOSED)
        product = ProductFactory()

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )

        payload = {
            "items": [
                {
                    "product": str(product.id),
                    "quantity": 20,
                }
            ]
        }

        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/traslado-apertura/", payload
        )

        assert response.status_code == 400

    def test_seller_bulk_transfer_another_seller_jornada_returns_404(
        self, seller_user, central_location, pos_location
    ):
        """Test that seller cannot bulk transfer on another seller's jornada."""
        other_seller = UserFactory()
        jornada = SalesDayFactory(seller=other_seller, location=pos_location)
        product = ProductFactory()

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )

        payload = {
            "items": [
                {
                    "product": str(product.id),
                    "quantity": 20,
                }
            ]
        }

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/traslado-apertura/", payload
        )

        assert response.status_code == 404

    def test_bulk_transfer_insufficient_stock_returns_400(
        self, admin_client, central_location, pos_location
    ):
        """Test that bulk transfer with insufficient stock returns 400."""
        jornada = SalesDayFactory(location=pos_location)
        product = ProductFactory()

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("10.0000"),  # Less than requested
        )

        payload = {
            "items": [
                {
                    "product": str(product.id),
                    "quantity": 50,
                }
            ]
        }

        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/traslado-apertura/", payload, format="json"
        )

        assert response.status_code == 400
        data = response.json()
        assert "insufficient_products" in data


@pytest.mark.django_db
class TestSalesDayReplenishmentView:
    """Test SalesDayReplenishmentView (EP-03/EP-04)."""

    def test_replenishment_single_product(
        self, admin_client, central_location, pos_location
    ):
        """Test replenishment transfer of single product."""
        jornada = SalesDayFactory(location=pos_location)
        product = ProductFactory()

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )

        payload = {
            "items": [
                {
                    "product": str(product.id),
                    "quantity": 20,
                }
            ]
        }

        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/reposicion/", payload, format="json"
        )

        assert response.status_code == 200

    def test_replenishment_multi_product_with_failure_rolls_back(
        self, admin_client, central_location, pos_location
    ):
        """Test that multi-product replenishment rolls back on any failure."""
        jornada = SalesDayFactory(location=pos_location)
        product1 = ProductFactory()
        product2 = ProductFactory()

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product1,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )
        LocationStockFactory(
            product=product2,
            location=central_location,
            current_quantity=Decimal("5.0000"),  # Will fail
        )

        payload = {
            "items": [
                {
                    "product": str(product1.id),
                    "quantity": 20,
                },
                {
                    "product": str(product2.id),
                    "quantity": 50,  # Will fail
                },
            ]
        }

        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/reposicion/", payload
        )

        assert response.status_code == 400
        # Verify no movements were created
        assert InventoryMovement.objects.filter(sales_day=jornada).count() == 0
