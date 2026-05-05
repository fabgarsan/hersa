from __future__ import annotations

from decimal import Decimal

import pytest

from apps.tienda.models import InventoryMovement, PurchaseOrder
from apps.tienda.tests.factories import (
    OrderLineFactory,
    ProductFactory,
    PurchaseOrderFactory,
    SupplierFactory,
)


@pytest.mark.django_db
class TestPurchaseOrderListView:
    """Test PurchaseOrderListView (EP-02)."""

    def test_unauthenticated_get_returns_401(self, api_client):
        """Test that unauthenticated GET /ordenes-compra/ returns 401."""
        response = api_client.get("/api/v1/tienda/ordenes-compra/")

        assert response.status_code == 401

    def test_admin_post_creates_order(self, admin_client):
        """Test that admin POST /ordenes-compra/ creates purchase order."""
        supplier = SupplierFactory()
        product = ProductFactory()

        payload = {
            "supplier": str(supplier.id),
            "notes": "Test order",
            "order_lines": [
                {
                    "product": str(product.id),
                    "ordered_quantity": 10,
                    "expected_unit_cost": "15.00",
                }
            ],
        }

        response = admin_client.post("/api/v1/tienda/ordenes-compra/", payload, format="json")

        assert response.status_code == 201
        data = response.json()
        order = PurchaseOrder.objects.get(id=data["id"])
        assert order.supplier == supplier
        assert order.order_lines.count() == 1

    def test_seller_post_returns_403(self, seller_client):
        """Test that seller POST returns 403."""
        supplier = SupplierFactory()
        product = ProductFactory()

        payload = {
            "supplier": str(supplier.id),
            "order_lines": [
                {
                    "product": str(product.id),
                    "ordered_quantity": 10,
                    "expected_unit_cost": "15.00",
                }
            ],
        }

        response = seller_client.post("/api/v1/tienda/ordenes-compra/", payload)

        assert response.status_code == 403

    def test_get_purchase_orders_admin(self, admin_client):
        """Test that admin can GET purchase orders."""
        PurchaseOrderFactory()

        response = admin_client.get("/api/v1/tienda/ordenes-compra/")

        assert response.status_code == 200

    def test_filter_by_estado(self, admin_client):
        """Test filtering by estado parameter."""
        PurchaseOrderFactory(status=PurchaseOrder.Status.PENDING)
        PurchaseOrderFactory(status=PurchaseOrder.Status.INITIATED)

        response = admin_client.get(
            f"/api/v1/tienda/ordenes-compra/?estado={PurchaseOrder.Status.PENDING}"
        )

        assert response.status_code == 200
        data = response.json()
        for order in data["results"]:
            assert order["status"] == PurchaseOrder.Status.PENDING


@pytest.mark.django_db
class TestPurchaseOrderConfirmView:
    """Test PurchaseOrderConfirmView (EP-02)."""

    def test_confirm_order_with_no_supplier_returns_400(self, admin_client):
        """Test that confirming order with no supplier returns 400 (BR-025)."""
        order = PurchaseOrderFactory(supplier=None, status=PurchaseOrder.Status.INITIATED)
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=10,
            expected_unit_cost=Decimal("15.00"),
        )

        response = admin_client.post(f"/api/v1/tienda/ordenes-compra/{order.id}/confirmar/")

        assert response.status_code == 400
        assert "proveedor" in response.json()["detail"].lower()

    def test_confirm_order_with_supplier_succeeds(self, admin_client):
        """Test that confirming order with supplier succeeds."""
        order = PurchaseOrderFactory(status=PurchaseOrder.Status.INITIATED)
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=10,
            expected_unit_cost=Decimal("15.00"),
        )

        response = admin_client.post(f"/api/v1/tienda/ordenes-compra/{order.id}/confirmar/")

        assert response.status_code == 200
        order.refresh_from_db()
        assert order.status == PurchaseOrder.Status.PENDING

    def test_confirm_requires_all_fields_on_lines(self, admin_client):
        """Test that all order lines must have ordered_quantity and expected_unit_cost."""
        order = PurchaseOrderFactory(status=PurchaseOrder.Status.INITIATED)
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=None,  # Missing
            expected_unit_cost=Decimal("15.00"),
        )

        response = admin_client.post(f"/api/v1/tienda/ordenes-compra/{order.id}/confirmar/")

        assert response.status_code == 400

    def test_confirm_order_with_zero_unit_cost_returns_400(self, admin_client):
        """Test that confirming order with zero unit cost returns 400 (BR-025)."""
        order = PurchaseOrderFactory(status=PurchaseOrder.Status.INITIATED)
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=10,
            expected_unit_cost=Decimal("0.00"),  # Zero cost
        )

        response = admin_client.post(f"/api/v1/tienda/ordenes-compra/{order.id}/confirmar/")

        assert response.status_code == 400


@pytest.mark.django_db
class TestPurchaseOrderReceiveView:
    """Test PurchaseOrderReceiveView (EP-02)."""

    def test_receive_order_applies_stock_correctly(self, admin_client, central_location):
        """Test that recepcionar applies IN movements to stock (BR-021)."""
        order = PurchaseOrderFactory(status=PurchaseOrder.Status.PENDING)
        product = ProductFactory()
        order_line = OrderLineFactory(purchase_order=order, product=product)

        payload = {
            "order_line": str(order_line.id),
            "received_quantity_good": 50,
            "damaged_quantity": 5,
            "real_unit_cost": "12.00",
            "destinations": [
                {
                    "location": str(central_location.id),
                    "quantity": 50,
                }
            ],
        }

        response = admin_client.post(
            f"/api/v1/tienda/ordenes-compra/{order.id}/recepcionar/", payload, format="json"
        )

        assert response.status_code == 200
        # Verify stock increased at central
        from apps.tienda.models import LocationStock
        stock = LocationStock.objects.filter(
            product=product, location=central_location
        )
        assert stock.exists()

    def test_receive_creates_inventory_movements(self, admin_client, central_location):
        """Test that receive creates InventoryMovement records."""
        order = PurchaseOrderFactory(status=PurchaseOrder.Status.PENDING)
        product = ProductFactory()
        order_line = OrderLineFactory(purchase_order=order, product=product)

        payload = {
            "order_line": str(order_line.id),
            "received_quantity_good": 20,
            "damaged_quantity": 0,
            "real_unit_cost": "12.00",
            "destinations": [
                {
                    "location": str(central_location.id),
                    "quantity": 20,
                }
            ],
        }

        response = admin_client.post(
            f"/api/v1/tienda/ordenes-compra/{order.id}/recepcionar/", payload, format="json"
        )

        assert response.status_code == 200
        movements = InventoryMovement.objects.filter(purchase_order=order)
        assert movements.count() >= 1


@pytest.mark.django_db
class TestPurchaseOrderCloseView:
    """Test PurchaseOrderCloseView (EP-02)."""

    def test_close_order_with_discrepancy_and_no_justification_returns_422(
        self, admin_client
    ):
        """Test that closing with large discrepancy and no justification returns 422."""

        order = PurchaseOrderFactory(status=PurchaseOrder.Status.PARTIAL)
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=100,
            received_quantity_cumulative=10,  # Large discrepancy
        )

        payload = {"closing_justification": ""}

        response = admin_client.post(
            f"/api/v1/tienda/ordenes-compra/{order.id}/cerrar/", payload
        )

        assert response.status_code == 422
        data = response.json()
        assert "discrepancias" in data
        assert "justificacion_requerida" in data

    def test_close_order_with_justification_succeeds(self, admin_client):
        """Test that closing with justification succeeds."""
        order = PurchaseOrderFactory(status=PurchaseOrder.Status.PARTIAL)
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=100,
            received_quantity_cumulative=10,
        )

        payload = {"closing_justification": "Supplier unable to deliver remaining units"}

        response = admin_client.post(
            f"/api/v1/tienda/ordenes-compra/{order.id}/cerrar/", payload
        )

        assert response.status_code == 200
        order.refresh_from_db()
        assert order.status == PurchaseOrder.Status.CLOSED


@pytest.mark.django_db
class TestPurchaseOrderSellerView:
    """Test role-sensitive responses for sellers (BR-027)."""

    def test_seller_order_response_has_limited_fields(self, seller_client):
        """Test that seller sees only id, product, status in order lines (BR-027)."""
        order = PurchaseOrderFactory()
        product = ProductFactory()
        OrderLineFactory(
            purchase_order=order,
            product=product,
            ordered_quantity=50,
            expected_unit_cost=Decimal("20.00"),
        )

        response = seller_client.get(f"/api/v1/tienda/ordenes-compra/{order.id}/")

        assert response.status_code == 200
        data = response.json()
        lines = data["order_lines"]
        assert len(lines) >= 1
        line = lines[0]
        assert "id" in line
        assert "product" in line
        assert "status" in line
        # Should not include monetary fields or ordered_quantity
        assert "ordered_quantity" not in line
        assert "expected_unit_cost" not in line
        assert "received_quantity_cumulative" not in line
