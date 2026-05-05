from __future__ import annotations

from decimal import Decimal

import pytest

from apps.tienda.models import Product, ProductSupplier, Supplier
from apps.tienda.tests.factories import ProductFactory, SupplierFactory


@pytest.mark.django_db
class TestProductListView:
    """Test ProductListView (EP-01)."""

    def test_admin_sees_all_products_including_inactive(self, admin_client):
        """Test that admin GET /productos/ returns all products."""
        active = ProductFactory(is_active=True)
        inactive = ProductFactory(is_active=False)

        response = admin_client.get("/api/v1/tienda/productos/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        product_ids = [p["id"] for p in data]
        assert str(active.id) in product_ids
        assert str(inactive.id) in product_ids

    def test_seller_sees_only_active_products(self, seller_client):
        """Test that seller GET /productos/ sees only active products (BR-020)."""
        active = ProductFactory(is_active=True)
        inactive = ProductFactory(is_active=False)

        response = seller_client.get("/api/v1/tienda/productos/")

        assert response.status_code == 200
        data = response.json()
        product_ids = [p["id"] for p in data]
        assert str(active.id) in product_ids
        assert str(inactive.id) not in product_ids

    def test_admin_can_filter_by_activo_param(self, admin_client):
        """Test that admin can filter with ?activo=false."""
        active = ProductFactory(is_active=True)
        inactive = ProductFactory(is_active=False)

        response = admin_client.get("/api/v1/tienda/productos/?activo=false")

        assert response.status_code == 200
        data = response.json()
        product_ids = [p["id"] for p in data]
        assert str(active.id) not in product_ids
        assert str(inactive.id) in product_ids

    def test_unauthenticated_returns_401(self, api_client):
        """Test that unauthenticated GET returns 401."""
        response = api_client.get("/api/v1/tienda/productos/")

        assert response.status_code == 401

    def test_admin_response_includes_monetary_fields(self, admin_client):
        """Test that admin response includes avg_cost and sale_price."""
        product = ProductFactory(
            sale_price=Decimal("99.99"),
            avg_cost=Decimal("50.00"),
        )

        response = admin_client.get("/api/v1/tienda/productos/")

        assert response.status_code == 200
        data = response.json()
        product_data = next(p for p in data if p["id"] == str(product.id))
        assert "avg_cost" in product_data
        assert "sale_price" in product_data
        assert product_data["sale_price"] == "99.99"
        assert product_data["avg_cost"] == "50.0000"

    def test_seller_response_excludes_monetary_fields(self, seller_client):
        """Test that seller response excludes avg_cost and sale_price."""
        product = ProductFactory(is_active=True)

        response = seller_client.get("/api/v1/tienda/productos/")

        assert response.status_code == 200
        data = response.json()
        product_data = next(p for p in data if p["id"] == str(product.id))
        assert "avg_cost" not in product_data
        assert "sale_price" not in product_data

    def test_post_product_admin_only(self, admin_client, seller_client):
        """Test that only admin can POST to create product."""
        payload = {
            "name": "New Product",
            "unit_label": "unit",
            "sale_price": "25.00",
            "reorder_point": 5,
            "suggested_order_qty": 10,
            "is_active": True,
        }

        admin_response = admin_client.post("/api/v1/tienda/productos/", payload)
        assert admin_response.status_code == 201

        seller_response = seller_client.post("/api/v1/tienda/productos/", payload)
        assert seller_response.status_code == 403


@pytest.mark.django_db
class TestProductDetailView:
    """Test ProductDetailView (EP-01)."""

    def test_admin_sees_inactive_product(self, admin_client):
        """Test that admin can GET inactive product."""
        product = ProductFactory(is_active=False)

        response = admin_client.get(f"/api/v1/tienda/productos/{product.id}/")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(product.id)

    def test_seller_gets_404_for_inactive_product(self, seller_client):
        """Test that seller gets 404 for inactive product (BR-028)."""
        product = ProductFactory(is_active=False)

        response = seller_client.get(f"/api/v1/tienda/productos/{product.id}/")

        assert response.status_code == 404

    def test_admin_response_includes_avg_cost(self, admin_client):
        """Test that admin response includes avg_cost."""
        product = ProductFactory(avg_cost=Decimal("30.00"))

        response = admin_client.get(f"/api/v1/tienda/productos/{product.id}/")

        assert response.status_code == 200
        assert response.json()["avg_cost"] == "30.0000"

    def test_seller_response_excludes_avg_cost(self, seller_client):
        """Test that seller response excludes avg_cost."""
        product = ProductFactory(is_active=True, avg_cost=Decimal("30.00"))

        response = seller_client.get(f"/api/v1/tienda/productos/{product.id}/")

        assert response.status_code == 200
        assert "avg_cost" not in response.json()

    def test_patch_product_admin_only(self, admin_client, seller_client):
        """Test that only admin can PATCH product."""
        product = ProductFactory()
        payload = {"name": "Updated Name"}

        admin_response = admin_client.patch(
            f"/api/v1/tienda/productos/{product.id}/", payload
        )
        assert admin_response.status_code == 200

        seller_response = seller_client.patch(
            f"/api/v1/tienda/productos/{product.id}/", payload
        )
        assert seller_response.status_code == 403

    def test_patch_product_updates_fields(self, admin_client):
        """Test that PATCH updates product fields."""
        product = ProductFactory(name="Original")
        payload = {"name": "Updated"}

        response = admin_client.patch(
            f"/api/v1/tienda/productos/{product.id}/", payload
        )

        assert response.status_code == 200
        product.refresh_from_db()
        assert product.name == "Updated"


@pytest.mark.django_db
class TestSupplierListView:
    """Test SupplierListView (EP-01)."""

    def test_seller_get_returns_403(self, seller_client):
        """Test that seller GET /proveedores/ returns 403."""
        response = seller_client.get("/api/v1/tienda/proveedores/")

        assert response.status_code == 403

    def test_admin_get_returns_200(self, admin_client):
        """Test that admin GET /proveedores/ returns 200."""
        SupplierFactory()

        response = admin_client.get("/api/v1/tienda/proveedores/")

        assert response.status_code == 200

    def test_admin_post_creates_supplier(self, admin_client):
        """Test that admin POST creates supplier."""
        payload = {
            "name": "New Supplier",
            "contact": "supplier@example.com",
        }

        response = admin_client.post("/api/v1/tienda/proveedores/", payload)

        assert response.status_code == 201
        assert response.json()["name"] == "New Supplier"


@pytest.mark.django_db
class TestProductSupplierView:
    """Test ProductSupplierView (EP-01)."""

    def test_admin_creates_product_supplier_association(self, admin_client):
        """Test that admin can POST to associate supplier with product."""
        product = ProductFactory()
        supplier = SupplierFactory()

        payload = {"supplier": str(supplier.id)}

        response = admin_client.post(
            f"/api/v1/tienda/productos/{product.id}/proveedores/", payload
        )

        assert response.status_code == 201
        assert ProductSupplier.objects.filter(
            product=product, supplier=supplier
        ).exists()

    def test_duplicate_association_returns_400(self, admin_client):
        """Test that duplicate association returns 400."""
        product = ProductFactory()
        supplier = SupplierFactory()
        ProductSupplier.objects.create(product=product, supplier=supplier)

        payload = {"supplier": str(supplier.id)}

        response = admin_client.post(
            f"/api/v1/tienda/productos/{product.id}/proveedores/", payload
        )

        assert response.status_code == 400

    def test_seller_post_returns_403(self, seller_client):
        """Test that seller POST returns 403."""
        product = ProductFactory()
        supplier = SupplierFactory()

        payload = {"supplier": str(supplier.id)}

        response = seller_client.post(
            f"/api/v1/tienda/productos/{product.id}/proveedores/", payload
        )

        assert response.status_code == 403
