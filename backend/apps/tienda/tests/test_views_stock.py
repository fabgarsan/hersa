from __future__ import annotations

from decimal import Decimal

import pytest

from apps.tienda.tests.factories import LocationStockFactory, ProductFactory


@pytest.mark.django_db
class TestStockListView:
    """Test StockListView (EP-07)."""

    def test_unauthenticated_get_returns_401(self, api_client, product):
        """Test that unauthenticated GET /stock/ returns 401."""
        response = api_client.get(f"/api/v1/tienda/stock/?producto_id={product.id}")

        assert response.status_code == 401

    def test_admin_get_includes_avg_cost(self, admin_client, product_with_stock):
        """Test that admin GET /stock/ includes avg_cost in product fields."""
        response = admin_client.get(
            f"/api/v1/tienda/stock/?producto_id={product_with_stock.product.id}"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        product_data = data[0]["product"]
        assert "avg_cost" in product_data

    def test_seller_get_excludes_avg_cost(self, seller_client, product_with_stock):
        """Test that seller GET /stock/ excludes avg_cost (BR-027)."""
        response = seller_client.get(
            f"/api/v1/tienda/stock/?producto_id={product_with_stock.product.id}"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        product_data = data[0]["product"]
        assert "avg_cost" not in product_data

    def test_invalid_producto_id_returns_400(self, admin_client):
        """Test that invalid producto_id returns 400."""
        response = admin_client.get("/api/v1/tienda/stock/?producto_id=not-a-uuid")

        assert response.status_code == 400

    def test_missing_producto_id_returns_400(self, admin_client):
        """Test that missing producto_id returns 400."""
        response = admin_client.get("/api/v1/tienda/stock/")

        assert response.status_code == 400

    def test_invalid_ubicacion_id_returns_400(self, admin_client, product):
        """Test that invalid ubicacion_id returns 400."""
        response = admin_client.get(
            f"/api/v1/tienda/stock/?producto_id={product.id}&ubicacion_id=not-a-uuid"
        )

        assert response.status_code == 400

    def test_filter_by_location(self, admin_client, central_location, pos_location, product):
        """Test filtering by ubicacion_id."""
        stock_central = LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )
        LocationStockFactory(
            product=product,
            location=pos_location,
            current_quantity=Decimal("50.0000"),
        )

        response = admin_client.get(
            f"/api/v1/tienda/stock/?producto_id={product.id}&ubicacion_id={central_location.id}"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == str(stock_central.id)


@pytest.mark.django_db
class TestStockTotalView:
    """Test StockTotalView (EP-07)."""

    def test_seller_get_returns_403(self, seller_client, product):
        """Test that seller GET /stock/total/ returns 403."""
        response = seller_client.get(
            f"/api/v1/tienda/stock/total/?producto_id={product.id}"
        )

        assert response.status_code == 403

    def test_admin_get_aggregates_stock(self, admin_client, product, central_location, pos_location):
        """Test that admin GET /stock/total/ returns aggregated stock."""
        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("100.0000"),
        )
        LocationStockFactory(
            product=product,
            location=pos_location,
            current_quantity=Decimal("50.0000"),
        )

        response = admin_client.get(
            f"/api/v1/tienda/stock/total/?producto_id={product.id}"
        )

        assert response.status_code == 200
        data = response.json()
        # stock_total should be 150.0000 as Decimal
        assert float(data["stock_total"]) == 150.0
        assert data["breakdown"] is not None
        assert len(data["breakdown"]) == 2


@pytest.mark.django_db
class TestStockReplenishmentView:
    """Test StockReplenishmentView (EP-07)."""

    def test_admin_get_replenishment_list(self, admin_client, central_location):
        """Test that admin GET /stock/reabastecimiento/ returns products below reorder point."""
        product = ProductFactory(
            reorder_point=50,
            suggested_order_qty=100,
            is_active=True,
        )
        LocationStockFactory(
            product=product,
            location=central_location,
            current_quantity=Decimal("20.0000"),  # Below reorder
        )

        response = admin_client.get("/api/v1/tienda/stock/reabastecimiento/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        item = next((d for d in data if d["product"]["id"] == str(product.id)), None)
        assert item is not None
        assert item["current_qty"] == "20.0000"
        assert item["reorder_point"] == 50

    def test_seller_get_returns_403(self, seller_client):
        """Test that seller GET /stock/reabastecimiento/ returns 403."""
        response = seller_client.get("/api/v1/tienda/stock/reabastecimiento/")

        assert response.status_code == 403
