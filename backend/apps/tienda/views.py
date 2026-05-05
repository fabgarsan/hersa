from __future__ import annotations

import logging
import uuid as _uuid
from decimal import Decimal
from typing import Any

from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import BaseThrottle
from rest_framework.views import APIView

from apps.core.pagination import StandardResultsSetPagination
from apps.tienda.helpers import (
    BulkInsufficientStockError,
    InsufficientStockError,
    SalesDayAlreadyClosedError,
    apply_bulk_transfer_atomic,
    apply_movement_atomically,
    apply_transfer_atomic,
    compute_close_summary,
    compute_replenishment_list,
    execute_sales_day_close,
)
from apps.tienda.models import (
    DayCloseDetail,
    InventoryMovement,
    Location,
    LocationStock,
    OrderLine,
    Product,
    ProductSupplier,
    PurchaseOrder,
    SalesDay,
    Supplier,
)
from apps.tienda.permissions import GROUP_TIENDA_ADMIN, IsTiendaAdmin, IsTiendaAdminOrVendedor
from apps.tienda.serializers import (
    AdjustmentSerializer,
    BulkTransferSerializer,
    CloseOrderSerializer,
    CloseSalesDaySerializer,
    CloseSummaryItemAdminSerializer,
    CloseSummaryItemSellerSerializer,
    CreateOrderSerializer,
    CreateSalesDaySerializer,
    DayCloseDetailAdminSerializer,
    DayCloseDetailSellerSerializer,
    FromReplenishmentSerializer,
    InventoryMovementSerializer,
    LocationStockAdminSerializer,
    LocationStockSellerSerializer,
    ProductAdminSerializer,
    ProductSellerSerializer,
    ProductSupplierAssociationSerializer,
    ProductWriteSerializer,
    PurchaseOrderAdminSerializer,
    PurchaseOrderEditSerializer,
    PurchaseOrderSellerSerializer,
    ReceiveOrderSerializer,
    ReplenishmentItemSerializer,
    ReplenishmentTransferSerializer,
    SalesDayAdminSerializer,
    SalesDaySellerSerializer,
    SupplierSerializer,
    SupplierWriteSerializer,
)
from apps.tienda.throttles import TiendaWriteThrottle

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

    throttle_classes = [TiendaWriteThrottle]

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

    throttle_classes = [TiendaWriteThrottle]

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
    throttle_classes = [TiendaWriteThrottle]

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
    throttle_classes = [TiendaWriteThrottle]

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
    throttle_classes = [TiendaWriteThrottle]

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
    throttle_classes = [TiendaWriteThrottle]

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
    throttle_classes = [TiendaWriteThrottle]

    def get(self, request: Request) -> Response:
        central_location: Location = get_object_or_404(
            Location, location_type=Location.LocationType.CENTRAL
        )
        items = compute_replenishment_list(central_location)
        serializer = ReplenishmentItemSerializer(items, many=True)  # type: ignore[arg-type]
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# EP-02 — Purchase orders
# ---------------------------------------------------------------------------


class PurchaseOrderListView(_TiendaRoleMixin, APIView):
    """
    GET  /ordenes-compra/  — list purchase orders; admin sees all fields, sellers see stripped view.
    POST /ordenes-compra/  — create purchase order with optional order lines (admin only).
    """

    throttle_classes = [TiendaWriteThrottle]

    def get_permissions(self) -> list[BasePermission]:
        if self.request.method == "POST":
            return [IsTiendaAdmin()]
        return [IsTiendaAdminOrVendedor()]

    def get(self, request: Request) -> Response:
        qs = PurchaseOrder.objects.select_related("supplier", "created_by").prefetch_related(
            "order_lines__product"
        )
        estado: str | None = request.query_params.get("estado")
        if estado:
            qs = qs.filter(status=estado)
        proveedor_id: str | None = request.query_params.get("proveedor_id")
        if proveedor_id:
            if _parse_uuid(proveedor_id) is None:
                return Response({"detail": "proveedor_id inválido."}, status=400)
            qs = qs.filter(supplier_id=proveedor_id)
        if self._is_admin(request):
            return Response(PurchaseOrderAdminSerializer(qs, many=True).data)
        return Response(PurchaseOrderSellerSerializer(qs, many=True).data)

    def post(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data
        with transaction.atomic():
            order: PurchaseOrder = PurchaseOrder.objects.create(
                supplier=vd.get("supplier"),
                notes=vd.get("notes", ""),
                status=PurchaseOrder.Status.PENDING,
                created_by=request.user,
            )
            for line_data in vd.get("order_lines", []):
                OrderLine.objects.create(
                    purchase_order=order,
                    product=line_data["product"],
                    ordered_quantity=line_data.get("ordered_quantity"),
                    expected_unit_cost=line_data.get("expected_unit_cost"),
                )
        logger.info(
            "PurchaseOrder created: pk=%s supplier=%s lines=%d by user=%s",
            order.pk,
            order.supplier_id,
            order.order_lines.count(),
            request.user.pk,
        )
        return Response(PurchaseOrderAdminSerializer(order).data, status=201)


class PurchaseOrderFromReplenishmentView(APIView):
    """POST /ordenes-compra/desde-reabastecimiento/ — create initiated order from replenishment list (admin only)."""

    permission_classes = [IsTiendaAdmin]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        serializer = FromReplenishmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        products: list[Product] = serializer.validated_data["product_ids"]
        with transaction.atomic():
            order: PurchaseOrder = PurchaseOrder.objects.create(
                status=PurchaseOrder.Status.INITIATED,
                created_by=request.user,
            )
            for product in products:
                OrderLine.objects.create(purchase_order=order, product=product)
        logger.info(
            "PurchaseOrder from replenishment created: pk=%s products=%d by user=%s",
            order.pk,
            len(products),
            request.user.pk,
        )
        return Response(PurchaseOrderAdminSerializer(order).data, status=201)


class PurchaseOrderDetailView(_TiendaRoleMixin, APIView):
    """
    GET   /ordenes-compra/{pk}/  — retrieve purchase order (admin or seller).
    PATCH /ordenes-compra/{pk}/  — partial update when status='initiated' (admin only).
    """

    throttle_classes = [TiendaWriteThrottle]

    def get_permissions(self) -> list[BasePermission]:
        if self.request.method == "PATCH":
            return [IsTiendaAdmin()]
        return [IsTiendaAdminOrVendedor()]

    def get(self, request: Request, pk: _uuid.UUID) -> Response:
        order: PurchaseOrder = get_object_or_404(
            PurchaseOrder.objects.select_related("supplier", "created_by").prefetch_related(
                "order_lines__product"
            ),
            pk=pk,
        )
        if self._is_admin(request):
            return Response(PurchaseOrderAdminSerializer(order).data)
        return Response(PurchaseOrderSellerSerializer(order).data)

    def patch(self, request: Request, pk: _uuid.UUID) -> Response:
        order: PurchaseOrder = get_object_or_404(
            PurchaseOrder.objects.select_related("supplier", "created_by").prefetch_related(
                "order_lines__product"
            ),
            pk=pk,
        )
        if order.status != PurchaseOrder.Status.INITIATED:
            return Response(
                {"detail": "Solo se puede editar una orden en estado 'iniciada'."},
                status=400,
            )
        edit_serializer = PurchaseOrderEditSerializer(data=request.data)
        edit_serializer.is_valid(raise_exception=True)
        vd = edit_serializer.validated_data
        with transaction.atomic():
            if "supplier" in vd:
                order.supplier = vd["supplier"]
            if "notes" in vd:
                order.notes = vd["notes"]
            order.save(update_fields=["supplier_id", "notes", "updated_at"])
            if "order_lines" in vd:
                # Replace all lines atomically
                order.order_lines.all().delete()
                for line_data in vd["order_lines"]:
                    OrderLine.objects.create(
                        purchase_order=order,
                        product=line_data["product"],
                        ordered_quantity=line_data.get("ordered_quantity"),
                        expected_unit_cost=line_data.get("expected_unit_cost"),
                    )
        order = (
            PurchaseOrder.objects.select_related("supplier", "created_by")
            .prefetch_related("order_lines__product")
            .get(pk=order.pk)
        )
        return Response(PurchaseOrderAdminSerializer(order).data)


class PurchaseOrderConfirmView(APIView):
    """POST /ordenes-compra/{pk}/confirmar/ — transition initiated → pending (admin only, BR-025)."""

    permission_classes = [IsTiendaAdmin]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        order: PurchaseOrder = get_object_or_404(
            PurchaseOrder.objects.prefetch_related("order_lines"), pk=pk
        )
        if order.status != PurchaseOrder.Status.INITIATED:
            return Response(
                {"detail": "Solo se puede confirmar una orden en estado 'iniciada'."},
                status=400,
            )
        # BR-025: supplier must be set
        if not order.supplier_id:
            return Response(
                {"detail": "La orden debe tener un proveedor asignado antes de confirmar."},
                status=400,
            )
        lines = list(order.order_lines.all())
        if not lines:
            return Response(
                {"detail": "La orden debe tener al menos una línea."},
                status=400,
            )
        # BR-025: all lines must have ordered_quantity > 0 and expected_unit_cost > 0
        invalid_lines: list[str] = [
            str(line.pk)
            for line in lines
            if not line.ordered_quantity or not line.expected_unit_cost
        ]
        if invalid_lines:
            return Response(
                {
                    "detail": "Todas las líneas deben tener cantidad pedida y costo unitario esperado.",
                    "invalid_line_ids": invalid_lines,
                },
                status=400,
            )
        order.status = PurchaseOrder.Status.PENDING
        order.save(update_fields=["status", "updated_at"])
        logger.info(
            "PurchaseOrder confirmed: pk=%s by user=%s",
            order.pk,
            request.user.pk,
        )
        return Response(PurchaseOrderAdminSerializer(order).data)


class PurchaseOrderReceiveView(_TiendaRoleMixin, APIView):
    """POST /ordenes-compra/{pk}/recepcionar/ — receive goods for an order line (admin or seller)."""

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        order: PurchaseOrder = get_object_or_404(
            PurchaseOrder.objects.select_related("supplier", "created_by"),
            pk=pk,
        )
        if order.status not in (PurchaseOrder.Status.PENDING, PurchaseOrder.Status.PARTIAL):
            return Response(
                {
                    "detail": (
                        "Solo se puede recepcionar en órdenes en estado "
                        "'pendiente' o 'parcialmente recibida'."
                    )
                },
                status=400,
            )
        recv_serializer = ReceiveOrderSerializer(data=request.data, context={"order": order})
        recv_serializer.is_valid(raise_exception=True)
        vd = recv_serializer.validated_data
        order_line: OrderLine = vd["order_line"]
        received_good: int = vd["received_quantity_good"]
        damaged: int = vd["damaged_quantity"]
        real_cost: Decimal = vd["real_unit_cost"]

        with transaction.atomic():
            # IN movements per destination for good stock
            for dest in vd["destinations"]:
                apply_movement_atomically(
                    product=order_line.product,
                    location=dest["location"],
                    movement_type=InventoryMovement.MovementType.IN,
                    quantity=dest["quantity"],
                    unit_cost=real_cost,
                    concept=InventoryMovement.Concept.PURCHASE,
                    purchase_order=order,
                    order_line=order_line,
                    recorded_by=request.user,
                )
            # OUT movement for damaged units (at CENTRAL location)
            if damaged > 0:
                central: Location = get_object_or_404(
                    Location, location_type=Location.LocationType.CENTRAL
                )
                apply_movement_atomically(
                    product=order_line.product,
                    location=central,
                    movement_type=InventoryMovement.MovementType.OUT,
                    quantity=damaged,
                    unit_cost=real_cost,
                    concept=InventoryMovement.Concept.DAMAGE,
                    purchase_order=order,
                    order_line=order_line,
                    recorded_by=request.user,
                )
            # Update order line cumulative reception
            order_line.received_quantity_cumulative += received_good + damaged
            if (
                order_line.ordered_quantity
                and order_line.received_quantity_cumulative >= order_line.ordered_quantity
            ):
                order_line.status = OrderLine.Status.COMPLETE
            elif order_line.received_quantity_cumulative > 0:
                order_line.status = OrderLine.Status.PARTIAL
            order_line.save(update_fields=["received_quantity_cumulative", "status"])
            # Transition order to PARTIAL on first reception
            if order.status == PurchaseOrder.Status.PENDING:
                order.status = PurchaseOrder.Status.PARTIAL
                order.save(update_fields=["status", "updated_at"])

        logger.info(
            "PurchaseOrder reception: pk=%s line=%s good=%d damaged=%d by user=%s",
            order.pk,
            order_line.pk,
            received_good,
            damaged,
            request.user.pk,
        )
        order = (
            PurchaseOrder.objects.select_related("supplier", "created_by")
            .prefetch_related("order_lines__product")
            .get(pk=order.pk)
        )
        if self._is_admin(request):
            return Response(PurchaseOrderAdminSerializer(order).data)
        return Response(PurchaseOrderSellerSerializer(order).data)


class PurchaseOrderCloseView(APIView):
    """POST /ordenes-compra/{pk}/cerrar/ — close a purchase order (admin only)."""

    permission_classes = [IsTiendaAdmin]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        order: PurchaseOrder = get_object_or_404(
            PurchaseOrder.objects.select_related("supplier", "created_by").prefetch_related(
                "order_lines__product"
            ),
            pk=pk,
        )
        if order.status not in (PurchaseOrder.Status.PENDING, PurchaseOrder.Status.PARTIAL):
            return Response(
                {
                    "detail": (
                        "Solo se puede cerrar una orden en estado "
                        "'pendiente' o 'parcialmente recibida'."
                    )
                },
                status=400,
            )
        close_serializer = CloseOrderSerializer(data=request.data)
        close_serializer.is_valid(raise_exception=True)
        justification: str = close_serializer.validated_data.get("closing_justification", "")
        threshold: Decimal = settings.TIENDA_UMBRAL_DISCREPANCIA_ORDEN

        discrepancies: list[dict[str, object]] = []
        for line in order.order_lines.all():
            ordered: int = line.ordered_quantity or 0
            received: int = line.received_quantity_cumulative
            if ordered == 0:
                continue
            delta: int = ordered - received
            delta_pct: Decimal = Decimal(delta) / Decimal(ordered)
            if abs(delta_pct) > threshold:
                discrepancies.append(
                    {
                        "line_id": str(line.pk),
                        "product_id": str(line.product_id),
                        "ordered_quantity": ordered,
                        "received_quantity": received,
                        "delta": delta,
                        "delta_pct": float(round(delta_pct, 4)),
                    }
                )

        if discrepancies and not justification.strip():
            return Response(
                {
                    "discrepancias": discrepancies,
                    "umbral": float(threshold),
                    "justificacion_requerida": True,
                },
                status=422,
            )

        order.status = PurchaseOrder.Status.CLOSED
        order.closing_justification = justification
        order.save(update_fields=["status", "closing_justification", "updated_at"])
        logger.info(
            "PurchaseOrder closed: pk=%s discrepancies=%d by user=%s",
            order.pk,
            len(discrepancies),
            request.user.pk,
        )
        return Response(PurchaseOrderAdminSerializer(order).data)


# ---------------------------------------------------------------------------
# EP-03 / EP-04 — Jornada (Sales Day)
# ---------------------------------------------------------------------------


class SalesDayListView(_TiendaRoleMixin, APIView):
    """
    GET  /jornadas/  — list sales days; admin sees all, seller sees only own.
    POST /jornadas/  — create sales day (admin or seller); BR-008 → 409; BR-009 via serializer.
    """

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def get(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        qs = SalesDay.objects.select_related("location", "seller", "closed_by")
        if not is_admin:
            qs = qs.filter(seller=request.user)
        if is_admin:
            return Response(SalesDayAdminSerializer(qs, many=True).data)
        return Response(SalesDaySellerSerializer(qs, many=True).data)

    def post(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        serializer = CreateSalesDaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data
        location: Location = vd["location"]

        # BR-008: only one open jornada per location at a time.
        # select_for_update() prevents a concurrent request from passing the same
        # check before this transaction commits (requires transaction.atomic()).
        with transaction.atomic():
            if (
                SalesDay.objects.select_for_update()
                .filter(location=location, status=SalesDay.Status.OPEN)
                .exists()
            ):
                return Response(
                    {"detail": "Ya existe una jornada abierta para esta ubicación."},
                    status=409,
                )
            sales_day: SalesDay = SalesDay.objects.create(
                location=location,
                date=vd["date"],
                seller=request.user,
                status=SalesDay.Status.OPEN,
            )
        logger.info(
            "SalesDay created: pk=%s location=%s date=%s by user=%s",
            sales_day.pk,
            location.pk,
            vd["date"],
            request.user.pk,
        )
        sales_day = SalesDay.objects.select_related("location", "seller", "closed_by").get(
            pk=sales_day.pk
        )
        if is_admin:
            return Response(SalesDayAdminSerializer(sales_day).data, status=201)
        return Response(SalesDaySellerSerializer(sales_day).data, status=201)


class SalesDayOpenView(_TiendaRoleMixin, APIView):
    """GET /jornadas/abierta/ — returns the caller's open jornada or 204 if none."""

    permission_classes = [IsTiendaAdminOrVendedor]

    def get(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        qs = SalesDay.objects.select_related("location", "seller", "closed_by").filter(
            status=SalesDay.Status.OPEN
        )
        if not is_admin:
            qs = qs.filter(seller=request.user)
        sales_day: SalesDay | None = qs.first()
        if sales_day is None:
            return Response(status=204)
        if is_admin:
            return Response(SalesDayAdminSerializer(sales_day).data)
        return Response(SalesDaySellerSerializer(sales_day).data)


class SalesDayDetailView(_TiendaRoleMixin, APIView):
    """GET /jornadas/{pk}/ — retrieve a sales day; admin sees all, seller sees only own."""

    permission_classes = [IsTiendaAdminOrVendedor]

    def get(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        sales_day: SalesDay = get_object_or_404(
            SalesDay.objects.select_related("location", "seller", "closed_by"), pk=pk
        )
        is_admin: bool = self._is_admin(request)
        # Object-level auth: sellers can only see their own jornadas
        if not is_admin and sales_day.seller_id != request.user.pk:
            return Response({"detail": "No encontrado."}, status=404)
        if is_admin:
            return Response(SalesDayAdminSerializer(sales_day).data)
        return Response(SalesDaySellerSerializer(sales_day).data)


class SalesDayBulkTransferView(_TiendaRoleMixin, APIView):
    """POST /jornadas/{pk}/traslado-apertura/ — atomic bulk transfer from CENTRAL to jornada location."""

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        sales_day: SalesDay = get_object_or_404(
            SalesDay.objects.select_related("location", "seller", "closed_by"), pk=pk
        )
        if not is_admin and sales_day.seller_id != request.user.pk:
            return Response({"detail": "No encontrado."}, status=404)
        if sales_day.status != SalesDay.Status.OPEN:
            return Response(
                {"detail": "Solo se puede transferir a una jornada abierta."},
                status=400,
            )
        bulk_serializer = BulkTransferSerializer(data=request.data)
        bulk_serializer.is_valid(raise_exception=True)
        vd = bulk_serializer.validated_data
        central_location: Location = get_object_or_404(
            Location, location_type=Location.LocationType.CENTRAL
        )
        try:
            apply_bulk_transfer_atomic(
                items=vd["items"],
                from_location=central_location,
                to_location=sales_day.location,
                recorded_by=request.user,
                sales_day=sales_day,
            )
        except BulkInsufficientStockError as exc:
            return Response(
                {
                    "detail": "Stock insuficiente para algunos productos.",
                    "insufficient_products": [
                        {
                            "product_id": str(e.product.pk),
                            "product_name": e.product.name,
                            "available": float(e.available),
                            "requested": e.requested,
                        }
                        for e in exc.errors
                    ],
                },
                status=400,
            )
        logger.info(
            "SalesDay bulk transfer: jornada=%s products=%d by user=%s",
            sales_day.pk,
            len(vd["items"]),
            request.user.pk,
        )
        sales_day = SalesDay.objects.select_related("location", "seller", "closed_by").get(
            pk=sales_day.pk
        )
        if is_admin:
            return Response(SalesDayAdminSerializer(sales_day).data)
        return Response(SalesDaySellerSerializer(sales_day).data)


class SalesDayReplenishmentView(_TiendaRoleMixin, APIView):
    """POST /jornadas/{pk}/reposicion/ — single or multi-product replenishment from CENTRAL."""

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        sales_day: SalesDay = get_object_or_404(
            SalesDay.objects.select_related("location", "seller", "closed_by"), pk=pk
        )
        if not is_admin and sales_day.seller_id != request.user.pk:
            return Response({"detail": "No encontrado."}, status=404)
        if sales_day.status != SalesDay.Status.OPEN:
            return Response(
                {"detail": "Solo se puede reabastecer una jornada abierta."},
                status=400,
            )
        replenishment_serializer = ReplenishmentTransferSerializer(data=request.data)
        replenishment_serializer.is_valid(raise_exception=True)
        vd = replenishment_serializer.validated_data
        central_location: Location = get_object_or_404(
            Location, location_type=Location.LocationType.CENTRAL
        )
        try:
            with transaction.atomic():
                for item in vd["items"]:
                    apply_transfer_atomic(
                        product=item["product"],
                        from_location=central_location,
                        to_location=sales_day.location,
                        quantity=item["quantity"],
                        recorded_by=request.user,
                        sales_day=sales_day,
                    )
        except InsufficientStockError as exc:
            return Response(
                {
                    "detail": "Stock insuficiente.",
                    "product_id": str(exc.product.pk),
                    "product_name": exc.product.name,
                    "available": float(exc.available),
                    "requested": exc.requested,
                },
                status=400,
            )
        logger.info(
            "SalesDay replenishment: jornada=%s products=%d by user=%s",
            sales_day.pk,
            len(vd["items"]),
            request.user.pk,
        )
        sales_day = SalesDay.objects.select_related("location", "seller", "closed_by").get(
            pk=sales_day.pk
        )
        if is_admin:
            return Response(SalesDayAdminSerializer(sales_day).data)
        return Response(SalesDaySellerSerializer(sales_day).data)


# ---------------------------------------------------------------------------
# EP-05 / EP-06 — Cierre y reporte
# ---------------------------------------------------------------------------


class SalesDayCloseSummaryView(_TiendaRoleMixin, APIView):
    """POST /jornadas/{pk}/resumen-cierre/ — read-only close preview, never persists."""

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        sales_day: SalesDay = get_object_or_404(
            SalesDay.objects.select_related("location", "seller", "closed_by"), pk=pk
        )
        if not is_admin and sales_day.seller_id != request.user.pk:
            return Response({"detail": "No encontrado."}, status=404)
        if sales_day.status != SalesDay.Status.OPEN:
            return Response({"detail": "La jornada no está abierta."}, status=400)
        summary: list[dict[str, Any]] = compute_close_summary(sales_day)
        if is_admin:
            return Response(CloseSummaryItemAdminSerializer(summary, many=True).data)  # type: ignore[arg-type]
        return Response(CloseSummaryItemSellerSerializer(summary, many=True).data)  # type: ignore[arg-type]


class SalesDayCloseView(_TiendaRoleMixin, APIView):
    """POST /jornadas/{pk}/cerrar/ — atomic commit: close the jornada and persist details."""

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def post(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        serializer = CloseSalesDaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data

        # Lock only the SalesDay row (of=("self",) avoids outer-join conflict on
        # nullable closed_by FK in PostgreSQL's FOR UPDATE clause).
        with transaction.atomic():
            sales_day: SalesDay = get_object_or_404(
                SalesDay.objects.select_for_update(of=("self",)).select_related(
                    "location", "seller", "closed_by"
                ),
                pk=pk,
            )
            if not is_admin and sales_day.seller_id != request.user.pk:
                return Response({"detail": "No encontrado."}, status=404)
            if sales_day.status != SalesDay.Status.OPEN:
                return Response({"detail": "La jornada ya está cerrada."}, status=400)
            try:
                sales_day = execute_sales_day_close(
                    sales_day=sales_day,
                    count_items=vd["items"],
                    cash_delivery=vd["cash_delivery"],
                    closed_by=request.user,
                    cash_out_amount=vd.get("cash_out_amount"),
                    cash_out_description=vd.get("cash_out_description", ""),
                )
            except SalesDayAlreadyClosedError:
                return Response({"detail": "La jornada ya está cerrada."}, status=400)

        logger.info(
            "SalesDay closed: pk=%s by user=%s",
            sales_day.pk,
            request.user.pk,
        )
        sales_day = SalesDay.objects.select_related("location", "seller", "closed_by").get(
            pk=sales_day.pk
        )
        if is_admin:
            return Response(SalesDayAdminSerializer(sales_day).data)
        return Response(SalesDaySellerSerializer(sales_day).data)


class SalesDayReportView(_TiendaRoleMixin, APIView):
    """GET /jornadas/{pk}/reporte/ — end-of-day report from DayCloseDetail rows."""

    permission_classes = [IsTiendaAdminOrVendedor]
    throttle_classes = [TiendaWriteThrottle]

    def get(self, request: Request, pk: _uuid.UUID) -> Response:
        assert isinstance(request.user, User)
        is_admin: bool = self._is_admin(request)
        sales_day: SalesDay = get_object_or_404(
            SalesDay.objects.select_related("location", "seller", "closed_by"), pk=pk
        )
        if not is_admin and sales_day.seller_id != request.user.pk:
            return Response({"detail": "No encontrado."}, status=404)
        if sales_day.status != SalesDay.Status.CLOSED:
            return Response({"detail": "La jornada no ha sido cerrada."}, status=400)
        details = DayCloseDetail.objects.filter(sales_day=sales_day).select_related("product")
        if is_admin:
            central_location: Location = get_object_or_404(
                Location, location_type=Location.LocationType.CENTRAL
            )
            replenishment = compute_replenishment_list(central_location)
            return Response(
                {
                    "sales_day": SalesDayAdminSerializer(sales_day).data,
                    "details": DayCloseDetailAdminSerializer(details, many=True).data,
                    "replenishment_list": ReplenishmentItemSerializer(replenishment, many=True).data,  # type: ignore[arg-type]
                }
            )
        return Response(
            {
                "sales_day": SalesDaySellerSerializer(sales_day).data,
                "details": DayCloseDetailSellerSerializer(details, many=True).data,
            }
        )


# ---------------------------------------------------------------------------
# EP-08 — Ajustes (Inventory Adjustments)
# ---------------------------------------------------------------------------


class AdjustmentView(APIView):
    """
    GET  /ajustes/  — list ADJUSTMENT movements, optionally filtered by product_id (admin only)
    POST /ajustes/  — create a manual ADJUSTMENT movement (admin only, BR-015 note required)
    """

    permission_classes = [IsTiendaAdmin]

    def get_throttles(self) -> list[BaseThrottle]:
        if self.request.method == "POST":
            return [TiendaWriteThrottle()]
        return []

    def get(self, request: Request) -> Response:
        qs = InventoryMovement.objects.filter(
            concept=InventoryMovement.Concept.ADJUSTMENT
        ).select_related("product", "recorded_by")

        raw_product_id: str | None = request.query_params.get("product_id")
        if raw_product_id is not None:
            product_uuid = _parse_uuid(raw_product_id)
            if product_uuid is None:
                return Response(
                    {"detail": "product_id debe ser un UUID válido."}, status=400
                )
            qs = qs.filter(product_id=product_uuid)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        if page is not None:
            return paginator.get_paginated_response(
                InventoryMovementSerializer(page, many=True).data
            )
        return Response(InventoryMovementSerializer(qs, many=True).data)

    def post(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        serializer = AdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data

        movement: InventoryMovement = apply_movement_atomically(
            product=vd["product"],
            location=vd["location"],
            movement_type=vd["movement_type"],
            quantity=vd["quantity"],
            unit_cost=vd["unit_cost"],
            concept=InventoryMovement.Concept.ADJUSTMENT,
            recorded_by=request.user,
            note=vd["note"],
        )
        logger.info(
            "Adjustment created: movement=%s product=%s location=%s type=%s qty=%d by user=%s",
            movement.pk,
            vd["product"].pk,
            vd["location"].pk,
            vd["movement_type"],
            vd["quantity"],
            request.user.pk,
        )
        movement = InventoryMovement.objects.select_related("product", "recorded_by").get(
            pk=movement.pk
        )
        return Response(InventoryMovementSerializer(movement).data, status=201)
