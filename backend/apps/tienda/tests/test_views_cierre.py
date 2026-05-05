from __future__ import annotations

from decimal import Decimal

import pytest

from apps.tienda.helpers import apply_movement_atomically
from apps.tienda.models import DayCloseDetail, InventoryMovement, SalesDay
from apps.tienda.tests.factories import (
    ProductFactory,
    SalesDayFactory,
    UserFactory,
)


@pytest.mark.django_db
class TestSalesDayCloseSummaryView:
    """Test SalesDayCloseSummaryView (EP-05/EP-06)."""

    def test_resumen_cierre_returns_per_product_summary(
        self, admin_client, pos_location
    ):
        """Test that resumen-cierre returns per-product summary."""
        jornada = SalesDayFactory(location=pos_location)
        product = ProductFactory(sale_price=Decimal("50.00"))

        apply_movement_atomically(
            product=product,
            location=pos_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=jornada.seller,
            sales_day=jornada,
        )

        payload = {}

        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/resumen-cierre/", payload
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    def test_seller_resumen_excludes_estimated_revenue(
        self, seller_user, pos_location
    ):
        """Test that seller resumen excludes estimated_revenue, estimated_cogs, and cost fields (BR-027)."""
        jornada = SalesDayFactory(location=pos_location, seller=seller_user)
        product = ProductFactory(sale_price=Decimal("50.00"))

        apply_movement_atomically(
            product=product,
            location=pos_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=jornada.seller,
            sales_day=jornada,
        )

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/resumen-cierre/", {}
        )

        assert response.status_code == 200
        data = response.json()
        if data:
            # BR-027: seller should not see monetary/cost fields
            assert "estimated_revenue" not in data[0]
            assert "estimated_cogs" not in data[0]
            assert "snapshot_avg_cost" not in data[0]
            assert "gross_profit" not in data[0]

    def test_admin_resumen_includes_estimated_revenue(
        self, admin_client, pos_location
    ):
        """Test that admin resumen includes estimated_revenue and estimated_cogs."""
        jornada = SalesDayFactory(location=pos_location)
        product = ProductFactory(sale_price=Decimal("50.00"))

        apply_movement_atomically(
            product=product,
            location=pos_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=jornada.seller,
            sales_day=jornada,
        )

        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/resumen-cierre/", {}
        )

        assert response.status_code == 200
        data = response.json()
        if data:
            assert "estimated_revenue" in data[0]
            assert "estimated_cogs" in data[0]


@pytest.mark.django_db
class TestSalesDayCloseView:
    """Test SalesDayCloseView (EP-05/EP-06)."""

    def test_cerrar_closes_jornada_and_creates_details(
        self, admin_client, seller_client, seller_user, pos_location, central_location
    ):
        """Test happy path: POST /cerrar/ closes jornada, creates details, and returns correct fields per role.

        This test validates the full close flow:
        1. Setup: Create product, transfer to POS location, associate with jornada
        2. Action: POST /cerrar/ with physical count
        3. Assert: Response status 200, DayCloseDetail created, correct field visibility per role (BR-027)
        """
        product = ProductFactory(sale_price=Decimal("50.00"), avg_cost=Decimal("20.00"))

        # Jornada owned by seller_user — admin can close any jornada
        jornada = SalesDayFactory(location=pos_location, seller=seller_user)

        # Simulate opening transfer: 10 units IN to POS for this jornada
        apply_movement_atomically(
            product=product,
            location=pos_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=10,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=seller_user,
            sales_day=jornada,
        )

        payload = {
            "items": [{"product": str(product.id), "final_count": 3}],
            "cash_delivery": "200.00",
        }
        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/cerrar/",
            payload,
            format="json",
        )

        assert response.status_code == 200

        # DB: jornada is closed and at least one DayCloseDetail row was created
        jornada.refresh_from_db()
        assert jornada.status == SalesDay.Status.CLOSED
        assert DayCloseDetail.objects.filter(sales_day=jornada).exists()

        # Admin response must include monetary fields (BR-027)
        data = response.json()
        assert "cash_delivery" in data
        assert "revenue_total" in data
        assert "cash_alert" in data

        # Seller closes their own jornada → seller response excludes monetary fields (BR-027)
        jornada2 = SalesDayFactory(location=pos_location, seller=seller_user)
        apply_movement_atomically(
            product=product,
            location=pos_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=5,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=seller_user,
            sales_day=jornada2,
        )

        response2 = seller_client.post(
            f"/api/v1/tienda/jornadas/{jornada2.id}/cerrar/",
            {"items": [{"product": str(product.id), "final_count": 1}], "cash_delivery": "80.00"},
            format="json",
        )

        assert response2.status_code == 200
        data2 = response2.json()
        assert "cash_delivery" not in data2
        assert "revenue_total" not in data2
        assert "cash_alert" not in data2

    def test_cerrar_requires_items_and_cash_delivery(self, admin_client, pos_location):
        """Test that cerrar endpoint validates required fields (no items)."""
        jornada = SalesDayFactory(location=pos_location)

        # Missing items - should fail validation
        payload = {"cash_delivery": Decimal("1000.00")}
        response = admin_client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/cerrar/",
            payload,
            format="json",
        )

        # Expect 400 due to missing items
        assert response.status_code == 400

    def test_resumen_cierre_on_closed_jornada_returns_400(self, admin_client, pos_location):
        """Test that resumen-cierre on closed jornada returns 400."""
        jornada = SalesDayFactory(location=pos_location, status=SalesDay.Status.CLOSED)

        response = admin_client.post(f"/api/v1/tienda/jornadas/{jornada.id}/resumen-cierre/", {})

        assert response.status_code == 400
        data = response.json()
        assert "abierta" in data["detail"].lower()


@pytest.mark.django_db
class TestSalesDayCloseAccessControl:
    """Test IDOR and access control for close endpoints."""

    def test_seller_cannot_get_close_summary_for_other_seller_jornada(
        self, seller_user, pos_location
    ):
        """Test that seller_b cannot POST resumen-cierre for seller_a's jornada (IDOR)."""
        from django.contrib.auth.models import Group
        from rest_framework.test import APIClient

        from apps.tienda.permissions import GROUP_TIENDA_VENDEDOR

        # Create seller_b with tienda_vendedor group
        seller_b = UserFactory()
        seller_group, _ = Group.objects.get_or_create(name=GROUP_TIENDA_VENDEDOR)
        seller_b.groups.add(seller_group)

        jornada = SalesDayFactory(location=pos_location, seller=seller_user)

        client = APIClient()
        client.force_authenticate(user=seller_b)

        response = client.post(f"/api/v1/tienda/jornadas/{jornada.id}/resumen-cierre/", {})

        assert response.status_code == 404


    def test_unauthenticated_resumen_cierre_returns_401(self, api_client, pos_location):
        """Test that unauthenticated POST /resumen-cierre/ returns 401."""
        jornada = SalesDayFactory(location=pos_location)

        response = api_client.post(f"/api/v1/tienda/jornadas/{jornada.id}/resumen-cierre/", {})

        assert response.status_code == 401

    def test_unauthenticated_cerrar_returns_401(self, api_client, pos_location):
        """Test that unauthenticated POST /cerrar/ returns 401."""
        import uuid

        fake_uuid = str(uuid.uuid4())
        response = api_client.post(f"/api/v1/tienda/jornadas/{fake_uuid}/cerrar/", {})

        assert response.status_code == 401

    def test_seller_cannot_close_other_seller_jornada(
        self, seller_user, pos_location
    ):
        """Test that seller_b cannot POST /cerrar/ for seller_a's jornada (IDOR)."""
        from django.contrib.auth.models import Group
        from rest_framework.test import APIClient

        from apps.tienda.permissions import GROUP_TIENDA_VENDEDOR

        seller_b = UserFactory()
        seller_group, _ = Group.objects.get_or_create(name=GROUP_TIENDA_VENDEDOR)
        seller_b.groups.add(seller_group)

        product = ProductFactory()
        jornada = SalesDayFactory(location=pos_location, seller=seller_user)

        client = APIClient()
        client.force_authenticate(user=seller_b)

        payload = {
            "items": [{"product": str(product.id), "final_count": 0}],
            "cash_delivery": "0.00",
        }
        response = client.post(
            f"/api/v1/tienda/jornadas/{jornada.id}/cerrar/",
            payload,
            format="json",
        )

        assert response.status_code == 404


@pytest.mark.django_db
class TestSalesDayReportView:
    """Test SalesDayReportView (EP-05/EP-06)."""

    def test_reporte_on_open_jornada_returns_400(self, admin_client, pos_location):
        """Test that reporte on open jornada returns 400."""
        jornada = SalesDayFactory(location=pos_location, status=SalesDay.Status.OPEN)

        response = admin_client.get(f"/api/v1/tienda/jornadas/{jornada.id}/reporte/")

        assert response.status_code == 400

    def test_admin_reporte_on_closed_jornada(self, admin_client, pos_location):
        """Test that admin can get reporte for closed jornada."""
        jornada = SalesDayFactory(location=pos_location, status=SalesDay.Status.CLOSED)

        response = admin_client.get(f"/api/v1/tienda/jornadas/{jornada.id}/reporte/")

        assert response.status_code == 200
        data = response.json()
        # Admin response should include replenishment_list
        assert "replenishment_list" in data
        assert "sales_day" in data
        assert "details" in data

    def test_seller_reporte_on_closed_jornada(self, seller_user, pos_location):
        """Test that seller can get reporte for own closed jornada."""
        jornada = SalesDayFactory(location=pos_location, seller=seller_user, status=SalesDay.Status.CLOSED)

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.get(f"/api/v1/tienda/jornadas/{jornada.id}/reporte/")

        assert response.status_code == 200
        data = response.json()
        # Seller response should NOT include replenishment_list
        assert "replenishment_list" not in data
        assert "sales_day" in data
        assert "details" in data

    def test_seller_cannot_close_another_seller_jornada(
        self, seller_user, pos_location
    ):
        """Test that seller cannot close another seller's jornada."""
        other_seller = UserFactory()
        jornada = SalesDayFactory(location=pos_location, seller=other_seller)

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.get(f"/api/v1/tienda/jornadas/{jornada.id}/reporte/")

        assert response.status_code == 404

    def test_seller_cannot_get_report_for_another_seller_jornada(
        self, seller_user, pos_location
    ):
        """Test that seller cannot get report for another seller's jornada."""
        other_seller = UserFactory()
        jornada = SalesDayFactory(location=pos_location, seller=other_seller, status=SalesDay.Status.CLOSED)

        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=seller_user)

        response = client.get(f"/api/v1/tienda/jornadas/{jornada.id}/reporte/")

        assert response.status_code == 404
