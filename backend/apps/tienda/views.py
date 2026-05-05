from __future__ import annotations

import logging
import uuid as _uuid
from decimal import Decimal

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tienda.helpers import compute_replenishment_list
from apps.tienda.models import (
    Location,
    LocationStock,
    Product,
    ProductSupplier,
    Supplier,
)
from apps.tienda.permissions import GROUP_TIENDA_ADMIN, IsTiendaAdmin, IsTiendaAdminOrVendedor
from apps.tienda.serializers import (
    LocationStockAdminSerializer,
    LocationStockSellerSerializer,
    ProductAdminSerializer,
    ProductSellerSerializer,
    ProductSupplierAssociationSerializer,
    ProductWriteSerializer,
    ReplenishmentItemSerializer,
    SupplierSerializer,
    SupplierWriteSerializer,
)

logger = logging.getLogger(__name__)

# Suppress unused import warning — IsAuthenticated is kept for documentation
# purposes: all views explicitly set permission_classes.
_ = IsAuthenticated


def _parse_uuid(value: str) -> _uuid.UUID | None:
    """Return a UUID object for value, or None if value is not a valid UUID."""
    try:
        return _uuid.UUID(value)
    except (ValueError, AttributeError):
        return None


class _TiendaRoleMixin:
    """Mixin that provides a role-check helper used for response differentiation."""

    def _is_admin(self, request: Request) -> bool:
        return request.user.groups.filter(name=GROUP_TIENDA_ADMIN).exists()


# ---------------------------------------------------------------------------
# EP-01 — Catalog
# ---------------------------------------------------------------------------


class ProductListView(_TiendaRoleMixin, APIView):
    """
    GET  /productos/  — list products (admin: all, seller: active only BR-020)
    POST /productos/  — create product (admin only)
    """

    def get_permissions(self) -> list[BasePermission]:
        if self.request.method in ("POST", "PATCH", "PUT", "DELETE"):
            return [IsTiendaAdmin()]
        return [IsTiendaAdminOrVendedor()]

    def get(self, request: Request) -> Response:
        is_admin: bool = self._is_admin(request)
        serializer: ProductAdminSerializer | ProductSellerSerializer

        if is_admin:
            qs = Product.objects.all()
            activo_param: str | None = request.query_params.get("activo")
            if activo_param is not None:
                is_active: bool = activo_param.lower() == "true"
                qs = qs.filter(is_active=is_active)
            serializer = ProductAdminSerializer(qs, many=True)
        else:
            # BR-020: sellers only see active products
            qs = Product.objects.filter(is_active=True)
            serializer = ProductSellerSerializer(qs, many=True)

        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        write_serializer = ProductWriteSerializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        product: Product = write_serializer.save(avg_cost=Decimal("0.0000"))
        return Response(ProductAdminSerializer(product).data, status=201)


class ProductDetailView(_TiendaRoleMixin, APIView):
    """
    GET   /productos/{pk}/  — retrieve a product
    PATCH /productos/{pk}/  — partial update (admin only)
    """

    def get_permissions(self) -> list[BasePermission]:
        if self.request.method in ("POST", "PATCH", "PUT", "DELETE"):
            return [IsTiendaAdmin()]
        return [IsTiendaAdminOrVendedor()]

    def get(self, request: Request, pk: _uuid.UUID) -> Response:
        product: Product = get_object_or_404(Product, pk=pk)
        is_admin: bool = self._is_admin(request)

        # BR-028: sellers get 404 for inactive products
        if not is_admin and not product.is_active:
            return Response({"detail": "No encontrado."}, status=404)

        detail_serializer: ProductAdminSerializer | ProductSellerSerializer
        if is_admin:
            detail_serializer = ProductAdminSerializer(product)
        else:
            detail_serializer = ProductSellerSerializer(product)

        return Response(detail_serializer.data)

    def patch(self, request: Request, pk: _uuid.UUID) -> Response:
        product: Product = get_object_or_404(Product, pk=pk)
        write_serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        write_serializer.is_valid(raise_exception=True)
        updated_product: Product = write_serializer.save()
        return Response(ProductAdminSerializer(updated_product).data)


class SupplierListView(APIView):
    """
    GET  /proveedores/  — list suppliers (admin only)
    POST /proveedores/  — create supplier (admin only)
    """

    permission_classes = [IsTiendaAdmin]

    def get(self, request: Request) -> Response:
        suppliers = Supplier.objects.all()
        serializer = SupplierSerializer(suppliers, many=True)
        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        write_serializer = SupplierWriteSerializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        supplier: Supplier = write_serializer.save()
        return Response(SupplierSerializer(supplier).data, status=201)


class SupplierDetailView(APIView):
    """
    GET   /proveedores/{pk}/  — retrieve a supplier (admin only)
    PATCH /proveedores/{pk}/  — partial update (admin only)
    """

    permission_classes = [IsTiendaAdmin]

    def get(self, request: Request, pk: _uuid.UUID) -> Response:
        supplier: Supplier = get_object_or_404(Supplier, pk=pk)
        return Response(SupplierSerializer(supplier).data)

    def patch(self, request: Request, pk: _uuid.UUID) -> Response:
        supplier: Supplier = get_object_or_404(Supplier, pk=pk)
        write_serializer = SupplierWriteSerializer(supplier, data=request.data, partial=True)
        write_serializer.is_valid(raise_exception=True)
        updated_supplier: Supplier = write_serializer.save()
        return Response(SupplierSerializer(updated_supplier).data)


class ProductSupplierView(APIView):
    """POST /productos/{pk}/proveedores/ — associate a supplier with a product (admin only)."""

    permission_classes = [IsTiendaAdmin]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        product: Product = get_object_or_404(Product, pk=pk)
        serializer = ProductSupplierAssociationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supplier: Supplier = serializer.validated_data["supplier"]

        if ProductSupplier.objects.filter(product=product, supplier=supplier).exists():
            return Response(
                {"detail": "Este proveedor ya está asociado a este producto."},
                status=400,
            )

        ProductSupplier.objects.create(product=product, supplier=supplier)
        logger.info(
            "ProductSupplier created: product=%s supplier=%s by user=%s",
            product.pk,
            supplier.pk,
            request.user.pk,
        )
        return Response(
            {"product_id": str(product.pk), "supplier_id": str(supplier.pk)},
            status=201,
        )


class ProductSupplierDetailView(APIView):
    """DELETE /productos/{pk}/proveedores/{supplier_pk}/ — remove supplier association (admin only)."""

    permission_classes = [IsTiendaAdmin]

    def delete(self, request: Request, pk: _uuid.UUID, supplier_pk: _uuid.UUID) -> Response:
        product: Product = get_object_or_404(Product, pk=pk)
        supplier: Supplier = get_object_or_404(Supplier, pk=supplier_pk)
        association: ProductSupplier = get_object_or_404(
            ProductSupplier, product=product, supplier=supplier
        )
        association.delete()
        logger.info(
            "ProductSupplier deleted: product=%s supplier=%s by user=%s",
            product.pk,
            supplier.pk,
            request.user.pk,
        )
        return Response(status=204)


# ---------------------------------------------------------------------------
# EP-07 — Stock
# ---------------------------------------------------------------------------


class StockListView(_TiendaRoleMixin, APIView):
    """GET /stock/ — list LocationStock filtered by product (and optionally location)."""

    permission_classes = [IsTiendaAdminOrVendedor]

    def get(self, request: Request) -> Response:
        producto_id: str | None = request.query_params.get("producto_id")
        if not producto_id:
            return Response(
                {"detail": "Se requiere el parámetro producto_id."},
                status=400,
            )
        if _parse_uuid(producto_id) is None:
            return Response({"detail": "producto_id inválido."}, status=400)

        ubicacion_id: str | None = request.query_params.get("ubicacion_id")
        if ubicacion_id and _parse_uuid(ubicacion_id) is None:
            return Response({"detail": "ubicacion_id inválido."}, status=400)

        qs = LocationStock.objects.filter(product_id=producto_id).select_related(
            "product", "location"
        )

        if ubicacion_id:
            qs = qs.filter(location_id=ubicacion_id)

        stock_serializer: LocationStockAdminSerializer | LocationStockSellerSerializer
        if self._is_admin(request):
            stock_serializer = LocationStockAdminSerializer(qs, many=True)
        else:
            stock_serializer = LocationStockSellerSerializer(qs, many=True)

        return Response(stock_serializer.data)


class StockTotalView(APIView):
    """GET /stock/total/ — aggregate total stock for a product across all locations (admin only)."""

    permission_classes = [IsTiendaAdmin]

    def get(self, request: Request) -> Response:
        producto_id: str | None = request.query_params.get("producto_id")
        if not producto_id:
            return Response(
                {"detail": "Se requiere el parámetro producto_id."},
                status=400,
            )
        if _parse_uuid(producto_id) is None:
            return Response({"detail": "producto_id inválido."}, status=400)

        product: Product = get_object_or_404(Product, pk=producto_id)
        stocks = LocationStock.objects.filter(product=product).select_related(
            "product", "location"
        )
        total: Decimal = stocks.aggregate(total=Sum("current_quantity"))["total"] or Decimal("0")

        return Response(
            {
                "product_id": str(product.pk),
                "name": product.name,
                "stock_total": total,
                "breakdown": LocationStockAdminSerializer(stocks, many=True).data,
            }
        )


class StockReplenishmentView(APIView):
    """GET /stock/reabastecimiento/ — list products needing replenishment (admin only, BR-026)."""

    permission_classes = [IsTiendaAdmin]

    def get(self, request: Request) -> Response:
        central_location: Location = get_object_or_404(
            Location, location_type=Location.LocationType.CENTRAL
        )
        items = compute_replenishment_list(central_location)
        serializer = ReplenishmentItemSerializer(items, many=True)  # type: ignore[arg-type]
        return Response(serializer.data)
