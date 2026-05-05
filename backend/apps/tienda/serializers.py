from __future__ import annotations

from decimal import Decimal
from typing import Any

from django.contrib.auth.models import User
from rest_framework import serializers

from apps.tienda.models import (
    DayCloseDetail,
    InventoryMovement,
    Location,
    LocationStock,
    OrderLine,
    Product,
    PurchaseOrder,
    SalesDay,
    Supplier,
)

_MAX_BULK_ITEMS: int = 100
_MAX_RECEIVE_DESTINATIONS: int = 20

# ---------------------------------------------------------------------------
# 1.1  Product — role-sensitive pair (BR-027)
# ---------------------------------------------------------------------------


class ProductAdminSerializer(serializers.ModelSerializer[Product]):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "unit_label",
            "sale_price",
            "avg_cost",
            "reorder_point",
            "suggested_order_qty",
            "is_active",
            "created_at",
        ]


class ProductSellerSerializer(serializers.ModelSerializer[Product]):
    """Seller view — no monetary fields (BR-027)."""

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "unit_label",
            "reorder_point",
            "suggested_order_qty",
        ]


# ---------------------------------------------------------------------------
# 1.2  Supplier — admin only
# ---------------------------------------------------------------------------


class SupplierSerializer(serializers.ModelSerializer[Supplier]):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact", "created_at"]


# ---------------------------------------------------------------------------
# 1.3  LocationStock — role-sensitive pair (BR-027)
# ---------------------------------------------------------------------------


class LocationStockAdminSerializer(serializers.ModelSerializer[LocationStock]):
    product = ProductAdminSerializer(read_only=True)

    class Meta:
        model = LocationStock
        fields = ["id", "product", "location", "current_quantity", "updated_at"]


class LocationStockSellerSerializer(serializers.ModelSerializer[LocationStock]):
    product = ProductSellerSerializer(read_only=True)

    class Meta:
        model = LocationStock
        fields = ["id", "product", "location", "current_quantity", "updated_at"]


# ---------------------------------------------------------------------------
# 1.4  OrderLine — role-sensitive pair (BR-027)
# ---------------------------------------------------------------------------


class OrderLineAdminSerializer(serializers.ModelSerializer[OrderLine]):
    class Meta:
        model = OrderLine
        fields = [
            "id",
            "product",
            "ordered_quantity",
            "received_quantity_cumulative",
            "expected_unit_cost",
            "status",
        ]


class OrderLineSellerSerializer(serializers.ModelSerializer[OrderLine]):
    """Seller view — no monetary or procurement volume fields (BR-027)."""

    class Meta:
        model = OrderLine
        fields = ["id", "product", "status"]


# ---------------------------------------------------------------------------
# 1.5  PurchaseOrder detail — role-sensitive pair (BR-027)
# ---------------------------------------------------------------------------


class PurchaseOrderAdminSerializer(serializers.ModelSerializer[PurchaseOrder]):
    order_lines = OrderLineAdminSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "supplier",
            "order_date",
            "status",
            "notes",
            "closing_justification",
            "created_by",
            "created_at",
            "order_lines",
        ]


class PurchaseOrderSellerSerializer(serializers.ModelSerializer[PurchaseOrder]):
    """Seller view — supplier as name only, no closing_justification (BR-027)."""

    order_lines = OrderLineSellerSerializer(many=True, read_only=True)
    supplier: serializers.StringRelatedField[Supplier] = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "supplier",
            "order_date",
            "status",
            "notes",
            "created_at",
            "order_lines",
        ]


# ---------------------------------------------------------------------------
# 1.6  SalesDay — role-sensitive pair (BR-024, BR-027)
# ---------------------------------------------------------------------------


class SalesDayAdminSerializer(serializers.ModelSerializer[SalesDay]):
    class Meta:
        model = SalesDay
        fields = [
            "id",
            "date",
            "location",
            "seller",
            "status",
            "closed_by",
            "closed_at",
            "cash_delivery",
            "cash_out_amount",
            "cash_out_description",
            "cash_alert",
            "revenue_total",
            "created_at",
        ]


class SalesDaySellerSerializer(serializers.ModelSerializer[SalesDay]):
    """Seller view — no cash or revenue fields (BR-024, BR-027)."""

    class Meta:
        model = SalesDay
        fields = [
            "id",
            "date",
            "location",
            "seller",
            "status",
            "closed_at",
            "created_at",
        ]


# ---------------------------------------------------------------------------
# 1.7  DayCloseDetail — role-sensitive pair (BR-027)
# ---------------------------------------------------------------------------


class DayCloseDetailAdminSerializer(serializers.ModelSerializer[DayCloseDetail]):
    product = ProductAdminSerializer(read_only=True)

    class Meta:
        model = DayCloseDetail
        fields = [
            "id",
            "product",
            "transferred_units",
            "final_count",
            "sold_units",
            "revenue",
            "cogs",
            "gross_profit",
            "snapshot_avg_cost_at_transfer",
            "central_stock_at_close",
        ]


class DayCloseDetailSellerSerializer(serializers.ModelSerializer[DayCloseDetail]):
    """Seller view — no monetary/cost fields (BR-027)."""

    product = ProductSellerSerializer(read_only=True)

    class Meta:
        model = DayCloseDetail
        fields = [
            "id",
            "product",
            "transferred_units",
            "final_count",
            "sold_units",
        ]


# ---------------------------------------------------------------------------
# 1.8  CloseSummary — plain Serializer (output of compute_close_summary)
# ---------------------------------------------------------------------------


class CloseSummaryItemAdminSerializer(serializers.Serializer[dict[str, Any]]):
    product = ProductAdminSerializer(read_only=True)
    transferred_units = serializers.IntegerField()
    current_pos_stock = serializers.DecimalField(max_digits=12, decimal_places=4)
    implied_sold_units = serializers.DecimalField(max_digits=12, decimal_places=4)
    snapshot_avg_cost = serializers.DecimalField(max_digits=12, decimal_places=4)
    estimated_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    estimated_cogs = serializers.DecimalField(max_digits=12, decimal_places=2)
    proposed_return_qty = serializers.DecimalField(max_digits=12, decimal_places=4)


class CloseSummaryItemSellerSerializer(serializers.Serializer[dict[str, Any]]):
    """Seller view — no monetary/cost fields (BR-027)."""

    product = ProductSellerSerializer(read_only=True)
    transferred_units = serializers.IntegerField()
    current_pos_stock = serializers.DecimalField(max_digits=12, decimal_places=4)
    implied_sold_units = serializers.DecimalField(max_digits=12, decimal_places=4)
    proposed_return_qty = serializers.DecimalField(max_digits=12, decimal_places=4)


# ---------------------------------------------------------------------------
# 1.9  ReplenishmentList — plain Serializer (output of compute_replenishment_list)
# ---------------------------------------------------------------------------


class ReplenishmentItemSerializer(serializers.Serializer[dict[str, Any]]):
    """Admin-only endpoint (BR-026)."""

    product = ProductAdminSerializer(read_only=True)
    current_qty = serializers.DecimalField(max_digits=12, decimal_places=4)
    reorder_point = serializers.IntegerField()
    suggested_order_qty = serializers.IntegerField()
    units_in_active_orders = serializers.IntegerField()
    units_in_reception = serializers.IntegerField()
    net_quantity_to_order = serializers.IntegerField()


# ---------------------------------------------------------------------------
# 2.1  OrderLineWriteSerializer — nested or standalone write (defined first so
#       CreateOrderSerializer and PurchaseOrderEditSerializer can reference it)
# ---------------------------------------------------------------------------


class OrderLineWriteSerializer(serializers.ModelSerializer[OrderLine]):
    """All fields nullable — validated at confirm step, not at creation (BR-025)."""

    class Meta:
        model = OrderLine
        fields = ["id", "product", "ordered_quantity", "expected_unit_cost"]
        read_only_fields = ["id"]


# ---------------------------------------------------------------------------
# 2.2  CreateOrderSerializer (POST /ordenes-compra/)
# ---------------------------------------------------------------------------


class CreateOrderSerializer(serializers.Serializer[None]):
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), required=False, allow_null=True
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="", max_length=1000)
    order_lines = OrderLineWriteSerializer(many=True, required=False, default=list)
    # created_by is set by the view from request.user — NOT a writable field

    def validate_order_lines(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        product_ids = [item["product"].pk for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                "No pueden haber productos duplicados en la orden."
            )
        return value


# ---------------------------------------------------------------------------
# 2.2b  FromReplenishmentSerializer (POST /ordenes-compra/desde-reabastecimiento/)
# ---------------------------------------------------------------------------


class FromReplenishmentSerializer(serializers.Serializer[None]):
    """Create an initiated order from replenishment list (blank order lines, no supplier yet)."""

    product_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Product.objects.filter(is_active=True)
        ),
        min_length=1,
        max_length=_MAX_BULK_ITEMS,
    )

    def validate_product_ids(self, value: list[Product]) -> list[Product]:
        ids = [p.pk for p in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError(
                "No pueden haber productos duplicados."
            )
        return value


# ---------------------------------------------------------------------------
# 2.2c  PurchaseOrderEditSerializer (PATCH /ordenes-compra/{id}/)
# ---------------------------------------------------------------------------


class PurchaseOrderEditSerializer(serializers.Serializer[None]):
    """Partial update for a PurchaseOrder when status='initiated'."""

    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), required=False, allow_null=True
    )
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    order_lines = OrderLineWriteSerializer(many=True, required=False)

    def validate_order_lines(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        product_ids = [item["product"].pk for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                "No pueden haber productos duplicados en la orden."
            )
        return value


# ---------------------------------------------------------------------------
# 2.3  ConfirmOrderSerializer (POST /ordenes-compra/{id}/confirmar/)
# ---------------------------------------------------------------------------


class ConfirmOrderSerializer(serializers.Serializer[None]):
    """Validates that an order is ready to transition from 'initiated' to 'pending'.

    BR-025: supplier must be set, all lines must have ordered_quantity > 0
    and expected_unit_cost > 0. Validation logic lives in the view.
    """

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return attrs


# ---------------------------------------------------------------------------
# 2.4  CloseOrderSerializer (POST /ordenes-compra/{id}/cerrar/)
# ---------------------------------------------------------------------------


class CloseOrderSerializer(serializers.Serializer[None]):
    closing_justification = serializers.CharField(
        required=False, allow_blank=True, default="", max_length=1000
    )


# ---------------------------------------------------------------------------
# 2.5  ReceiveOrderSerializer (POST /ordenes-compra/{id}/recepcionar/)
# ---------------------------------------------------------------------------


class ReceiveDestinationSerializer(serializers.Serializer[None]):
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    quantity = serializers.IntegerField(min_value=0)


class ReceiveOrderSerializer(serializers.Serializer[None]):
    order_line = serializers.PrimaryKeyRelatedField(queryset=OrderLine.objects.all())
    received_quantity_good = serializers.IntegerField(min_value=0, default=0)
    damaged_quantity = serializers.IntegerField(min_value=0, default=0)
    real_unit_cost = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    destinations = ReceiveDestinationSerializer(many=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        total_qty: int = attrs["received_quantity_good"] + attrs["damaged_quantity"]

        # real_unit_cost mandatory when any qty > 0 (§6.2)
        if total_qty > 0 and not attrs.get("real_unit_cost"):
            raise serializers.ValidationError(
                {
                    "real_unit_cost": (
                        "El costo unitario real es obligatorio cuando se recibe mercancía."
                    )
                }
            )

        # upper bound on destinations to prevent DoS
        if len(attrs.get("destinations", [])) > _MAX_RECEIVE_DESTINATIONS:
            raise serializers.ValidationError(
                {
                    "destinations": (
                        f"No se pueden especificar más de {_MAX_RECEIVE_DESTINATIONS} destinos."
                    )
                }
            )

        # sum of destinations must equal received_quantity_good (§6.2)
        dest_total: int = sum(d["quantity"] for d in attrs.get("destinations", []))
        if dest_total != attrs["received_quantity_good"]:
            raise serializers.ValidationError(
                {
                    "destinations": (
                        "La suma de cantidades en destinos debe ser igual a "
                        "cantidad_recibida_buen_estado."
                    )
                }
            )

        # BR-020/BR-028: product must be active
        order_line: OrderLine = attrs["order_line"]
        if not order_line.product.is_active:
            raise serializers.ValidationError(
                {
                    "order_line": (
                        "El producto de esta línea está inactivo y no puede recepcionarse."
                    )
                }
            )

        return attrs


# ---------------------------------------------------------------------------
# 2.6  BulkTransferSerializer (POST /jornadas/{id}/traslado-apertura/)
# ---------------------------------------------------------------------------


class TransferItemSerializer(serializers.Serializer[None]):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True)  # BR-020
    )
    quantity = serializers.IntegerField(min_value=1)


class BulkTransferSerializer(serializers.Serializer[None]):
    items = TransferItemSerializer(many=True)

    def validate_items(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un producto.")
        if len(value) > _MAX_BULK_ITEMS:
            raise serializers.ValidationError(
                f"No se pueden procesar más de {_MAX_BULK_ITEMS} productos por solicitud."
            )
        product_ids = [item["product"].pk for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                "No pueden haber productos duplicados en la transferencia."
            )
        return value


# ---------------------------------------------------------------------------
# 2.7  ReplenishmentTransferSerializer (POST /jornadas/{id}/reposicion/)
# ---------------------------------------------------------------------------


class ReplenishmentTransferSerializer(serializers.Serializer[None]):
    items = TransferItemSerializer(many=True)

    def validate_items(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un producto.")
        if len(value) > _MAX_BULK_ITEMS:
            raise serializers.ValidationError(
                f"No se pueden procesar más de {_MAX_BULK_ITEMS} productos por solicitud."
            )
        product_ids = [item["product"].pk for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                "No pueden haber productos duplicados en la transferencia."
            )
        return value


# ---------------------------------------------------------------------------
# 2.8  CreateSalesDaySerializer (POST /jornadas/)
# ---------------------------------------------------------------------------


class CreateSalesDaySerializer(serializers.Serializer[None]):
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    date = serializers.DateField()

    def validate_location(self, value: Location) -> Location:
        # BR-009: location must be type 'pos'
        if value.location_type != Location.LocationType.POS:
            raise serializers.ValidationError(
                "La ubicación debe ser de tipo POS para crear una jornada de venta."
            )
        return value


# ---------------------------------------------------------------------------
# 2.9  CloseSalesDaySerializer (POST /jornadas/{id}/cerrar/)
# ---------------------------------------------------------------------------


class CloseCountItemSerializer(serializers.Serializer[None]):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True)
    )
    final_count = serializers.IntegerField(min_value=0)


class CloseSalesDaySerializer(serializers.Serializer[None]):
    items = CloseCountItemSerializer(many=True)
    cash_delivery = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0
    )
    cash_out_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True, min_value=0
    )
    cash_out_description = serializers.CharField(
        required=False, allow_blank=True, default="", max_length=1000
    )

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        # §6.2: cash_out_description mandatory when cash_out_amount > 0
        cash_out = attrs.get("cash_out_amount")
        if cash_out and cash_out > 0 and not attrs.get("cash_out_description", "").strip():
            raise serializers.ValidationError(
                {
                    "cash_out_description": (
                        "La descripción es obligatoria cuando hay un monto de salida de caja."
                    )
                }
            )
        items = attrs.get("items") or []
        if not items:
            raise serializers.ValidationError(
                {"items": "Debe incluir al menos un producto en el conteo."}
            )
        seen: set[Any] = set()
        for item in items:
            pid = item["product"].pk
            if pid in seen:
                raise serializers.ValidationError(
                    {"items": "No se permiten productos duplicados en el conteo."}
                )
            seen.add(pid)
        return attrs


# ---------------------------------------------------------------------------
# 2.10  AdjustmentSerializer (POST /ajustes/)
# ---------------------------------------------------------------------------


class AdjustmentSerializer(serializers.Serializer[None]):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True)
    )
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    movement_type = serializers.ChoiceField(
        choices=[
            InventoryMovement.MovementType.IN,
            InventoryMovement.MovementType.OUT,
        ]
    )
    quantity = serializers.IntegerField(min_value=1)
    unit_cost = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0
    )
    note = serializers.CharField(max_length=1000)

    def validate_note(self, value: str) -> str:
        # BR-015: note mandatory for ADJUSTMENT
        if not value.strip():
            raise serializers.ValidationError(
                "La nota es obligatoria para movimientos de tipo AJUSTE."
            )
        return value


# ---------------------------------------------------------------------------
# 2.11  InventoryMovementSerializer — admin-only read (GET /ajustes/ history)
# ---------------------------------------------------------------------------


class InventoryMovementSerializer(serializers.ModelSerializer[InventoryMovement]):
    product = ProductAdminSerializer(read_only=True)
    recorded_by: serializers.StringRelatedField[User] = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            "id",
            "product",
            "location",
            "movement_type",
            "quantity",
            "unit_cost",
            "concept",
            "note",
            "recorded_by",
            "timestamp",
        ]


# ---------------------------------------------------------------------------
# 3.1  ProductWriteSerializer — create/update a Product
# ---------------------------------------------------------------------------


class ProductWriteSerializer(serializers.ModelSerializer[Product]):
    """Create/update a Product. avg_cost is system-managed (editable=False), excluded automatically."""

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "unit_label",
            "sale_price",
            "reorder_point",
            "suggested_order_qty",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate_sale_price(self, value: Decimal) -> Decimal:
        if value <= Decimal("0"):
            raise serializers.ValidationError("El precio de venta debe ser mayor a 0.")
        return value

    def validate_reorder_point(self, value: int) -> int:
        if value < 0:
            raise serializers.ValidationError("El punto de reorden no puede ser negativo.")
        return value

    def validate_suggested_order_qty(self, value: int) -> int:
        if value < 0:
            raise serializers.ValidationError(
                "La cantidad sugerida de orden no puede ser negativa."
            )
        return value


# ---------------------------------------------------------------------------
# 3.2  SupplierWriteSerializer — create/update a Supplier
# ---------------------------------------------------------------------------


class SupplierWriteSerializer(serializers.ModelSerializer[Supplier]):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact"]
        read_only_fields = ["id"]
        extra_kwargs = {"contact": {"max_length": 1000}}


# ---------------------------------------------------------------------------
# 3.3  ProductSupplierAssociationSerializer — link a Supplier to a Product
# ---------------------------------------------------------------------------


class ProductSupplierAssociationSerializer(serializers.Serializer[None]):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())
