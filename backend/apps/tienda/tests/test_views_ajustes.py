from __future__ import annotations

from decimal import Decimal

import pytest

from apps.tienda.models import InventoryMovement
from apps.tienda.tests.factories import LocationFactory, ProductFactory


@pytest.mark.django_db
class TestAdjustmentView:
    """Test AdjustmentView (EP-08)."""

    def test_unauthenticated_get_returns_401(self, api_client):
        """Test that unauthenticated GET /ajustes/ returns 401."""
        response = api_client.get("/api/v1/tienda/ajustes/")

        assert response.status_code == 401

    def test_seller_get_returns_403(self, seller_client):
        """Test that seller GET /ajustes/ returns 403."""
        response = seller_client.get("/api/v1/tienda/ajustes/")

        assert response.status_code == 403

    def test_seller_post_returns_403(self, seller_client):
        """Test that seller POST /ajustes/ returns 403."""
        location = LocationFactory()
        product = ProductFactory()

        payload = {
            "product": str(product.id),
            "location": str(location.id),
            "movement_type": InventoryMovement.MovementType.IN,
            "quantity": 10,
            "unit_cost": "10.00",
            "note": "Test adjustment",
        }

        response = seller_client.post("/api/v1/tienda/ajustes/", payload)

        assert response.status_code == 403

    def test_admin_post_with_empty_note_returns_400(self, admin_client):
        """Test that POST with empty note returns 400 (BR-015)."""
        location = LocationFactory()
        product = ProductFactory()

        payload = {
            "product": str(product.id),
            "location": str(location.id),
            "movement_type": InventoryMovement.MovementType.IN,
            "quantity": 10,
            "unit_cost": "10.00",
            "note": "",  # Empty
        }

        response = admin_client.post("/api/v1/tienda/ajustes/", payload)

        assert response.status_code == 400

    def test_admin_post_with_whitespace_only_note_returns_400(self, admin_client):
        """Test that POST with whitespace-only note returns 400 (BR-015)."""
        location = LocationFactory()
        product = ProductFactory()

        payload = {
            "product": str(product.id),
            "location": str(location.id),
            "movement_type": InventoryMovement.MovementType.IN,
            "quantity": 10,
            "unit_cost": "10.00",
            "note": "   ",  # Whitespace only
        }

        response = admin_client.post("/api/v1/tienda/ajustes/", payload)

        assert response.status_code == 400

    def test_admin_post_entrada_recalculates_avg_cost(self, admin_client, central_location):
        """Test that admin POST ENTRADA recalculates avg_cost."""
        product = ProductFactory(avg_cost=Decimal("10.00"))

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )

        payload = {
            "product": str(product.id),
            "location": str(central_location.id),
            "movement_type": InventoryMovement.MovementType.IN,
            "quantity": 50,
            "unit_cost": "20.00",
            "note": "Adjustment entry",
        }

        response = admin_client.post("/api/v1/tienda/ajustes/", payload)

        assert response.status_code == 201
        product.refresh_from_db()
        # avg_cost should be (100*10 + 50*20) / 150 = 13.33
        assert product.avg_cost == Decimal("13.3333")

    def test_admin_post_salida_unchanged_avg_cost(self, admin_client, central_location):
        """Test that admin POST SALIDA does NOT change avg_cost."""
        product = ProductFactory(avg_cost=Decimal("10.00"))

        from apps.tienda.tests.factories import LocationStockFactory

        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )

        original_avg = product.avg_cost
        payload = {
            "product": str(product.id),
            "location": str(central_location.id),
            "movement_type": InventoryMovement.MovementType.OUT,
            "quantity": 20,
            "unit_cost": "10.00",
            "note": "Adjustment exit",
        }

        response = admin_client.post("/api/v1/tienda/ajustes/", payload)

        assert response.status_code == 201
        product.refresh_from_db()
        assert product.avg_cost == original_avg

    def test_get_with_invalid_product_id_returns_400(self, admin_client):
        """Test that GET with invalid product_id returns 400."""
        response = admin_client.get("/api/v1/tienda/ajustes/?product_id=not-a-uuid")

        assert response.status_code == 400

    def test_get_with_valid_product_id_filters_results(self, admin_client, central_location):
        """Test that GET with valid product_id filters results."""
        product1 = ProductFactory()
        product2 = ProductFactory()

        # Create adjustments for both products
        admin_client.post(
            "/api/v1/tienda/ajustes/",
            {
                "product": str(product1.id),
                "location": str(central_location.id),
                "movement_type": InventoryMovement.MovementType.IN,
                "quantity": 10,
                "unit_cost": "10.00",
                "note": "Adjustment 1",
            },
        )
        admin_client.post(
            "/api/v1/tienda/ajustes/",
            {
                "product": str(product2.id),
                "location": str(central_location.id),
                "movement_type": InventoryMovement.MovementType.IN,
                "quantity": 20,
                "unit_cost": "10.00",
                "note": "Adjustment 2",
            },
        )

        response = admin_client.get(f"/api/v1/tienda/ajustes/?product_id={product1.id}")

        assert response.status_code == 200
        data = response.json()
        # All results should be for product1
        for item in data["results"]:
            assert item["product"]["id"] == str(product1.id)

    def test_admin_get_returns_200(self, admin_client):
        """Test that admin GET /ajustes/ returns 200."""
        response = admin_client.get("/api/v1/tienda/ajustes/")

        assert response.status_code == 200
