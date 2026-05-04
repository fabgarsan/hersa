from __future__ import annotations

import uuid
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


class Location(models.Model):
    class LocationType(models.TextChoices):
        CENTRAL = "central", "Almacén central"
        POS = "pos", "Tienda"

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name: models.CharField[str, str] = models.CharField(max_length=100, unique=True)
    location_type: models.CharField[str, str] = models.CharField(max_length=10, choices=LocationType.choices)

    class Meta:
        verbose_name = "Ubicación"
        verbose_name_plural = "Ubicaciones"

    def __str__(self) -> str:
        return f"{self.name} ({self.get_location_type_display()})"


class Supplier(models.Model):
    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name: models.CharField[str, str] = models.CharField(max_length=200)
    contact: models.TextField[str, str] = models.TextField(blank=True, default="")
    created_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    class UnitLabel(models.TextChoices):
        BOX = "box", "Caja"
        PACK = "pack", "Paquete"
        UNIT = "unit", "Unidad"

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name: models.CharField[str, str] = models.CharField(max_length=200)
    description: models.TextField[str, str] = models.TextField(blank=True, default="")
    unit_label: models.CharField[str, str] = models.CharField(max_length=10, choices=UnitLabel.choices)
    sale_price: models.DecimalField[Decimal, Decimal] = models.DecimalField(max_digits=10, decimal_places=2)
    avg_cost: models.DecimalField[Decimal, Decimal] = models.DecimalField(
        max_digits=12, decimal_places=4, default=Decimal("0.0000"), editable=False
    )
    reorder_point: models.PositiveIntegerField[int, int] = models.PositiveIntegerField()
    suggested_order_qty: models.PositiveIntegerField[int, int] = models.PositiveIntegerField()
    is_active: models.BooleanField[bool, bool] = models.BooleanField(default=True, db_index=True)
    created_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now=True)
    suppliers: models.ManyToManyField[Supplier, ProductSupplier] = models.ManyToManyField(
        "Supplier", through="ProductSupplier", related_name="products"
    )

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        constraints = [
            models.CheckConstraint(condition=Q(sale_price__gte=0), name="product_sale_price_gte_0"),
            models.CheckConstraint(condition=Q(avg_cost__gte=0), name="product_avg_cost_gte_0"),
        ]

    def __str__(self) -> str:
        return self.name


class ProductSupplier(models.Model):
    """M2M through table linking Product and Supplier."""

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product: models.ForeignKey[Product, Product] = models.ForeignKey("Product", on_delete=models.CASCADE)
    supplier: models.ForeignKey[Supplier, Supplier] = models.ForeignKey("Supplier", on_delete=models.PROTECT)
    created_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Asociación producto–proveedor"
        verbose_name_plural = "Asociaciones producto–proveedor"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "supplier"], name="productsupplier_unique"
            )
        ]

    def __str__(self) -> str:
        return f"{self.product} — {self.supplier}"


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        INITIATED = "initiated", "Iniciada"
        PENDING = "pending", "Pendiente"
        PARTIAL = "partially_received", "Parcialmente recibida"
        CLOSED = "closed", "Cerrada"

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier: models.ForeignKey[Supplier | None, Supplier | None] = models.ForeignKey(
        "Supplier",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="purchase_orders",
    )  # nullable to support status='initiated' with no supplier yet
    order_date: models.DateField[str | None, str | None] = models.DateField(null=True, blank=True, db_index=True)
    status: models.CharField[str, str] = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    notes: models.TextField[str, str] = models.TextField(blank=True, default="")
    closing_justification: models.TextField[str, str] = models.TextField(blank=True, default="")
    created_by: models.ForeignKey[User, User] = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="purchase_orders_created"
    )
    created_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Orden de compra"
        verbose_name_plural = "Órdenes de compra"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        supplier_name = str(self.supplier.name) if self.supplier else "Sin proveedor"
        return f"OC {self.id} — {supplier_name} ({self.status})"


class OrderLine(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PARTIAL = "partially_received", "Parcialmente recibida"
        COMPLETE = "complete", "Completa"

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase_order: models.ForeignKey[PurchaseOrder, PurchaseOrder] = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="order_lines"
    )
    product: models.ForeignKey[Product, Product] = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="order_lines"
    )
    ordered_quantity: models.PositiveIntegerField[int | None, int | None] = models.PositiveIntegerField(
        null=True, blank=True
    )
    received_quantity_cumulative: models.PositiveIntegerField[int, int] = models.PositiveIntegerField(
        default=0
    )
    expected_unit_cost: models.DecimalField[Decimal | None, Decimal | None] = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    status: models.CharField[str, str] = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING
    )

    class Meta:
        verbose_name = "Línea de orden"
        verbose_name_plural = "Líneas de orden"
        constraints = [
            models.UniqueConstraint(
                fields=["purchase_order", "product"], name="orderline_unique_per_order"
            ),
        ]

    def __str__(self) -> str:
        return f"Línea {self.product} en {self.purchase_order_id}"


class InventoryMovement(models.Model):
    class MovementType(models.TextChoices):
        IN = "IN", "Entrada"
        OUT = "OUT", "Salida"

    class Concept(models.TextChoices):
        PURCHASE = "PURCHASE", "Compra"
        TRANSFER = "TRANSFER", "Traslado"
        SALE = "SALE", "Venta"
        DAMAGE = "DAMAGE", "Avería"
        ADJUSTMENT = "ADJUSTMENT", "Ajuste"

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product: models.ForeignKey[Product, Product] = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="inventory_movements"
    )
    location: models.ForeignKey[Location, Location] = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="inventory_movements"
    )
    movement_type: models.CharField[str, str] = models.CharField(max_length=10, choices=MovementType.choices)
    quantity: models.PositiveIntegerField[int, int] = models.PositiveIntegerField()
    unit_cost: models.DecimalField[Decimal, Decimal] = models.DecimalField(max_digits=10, decimal_places=2)
    concept: models.CharField[str, str] = models.CharField(max_length=20, choices=Concept.choices)
    note: models.TextField[str, str] = models.TextField(blank=True, default="")
    purchase_order: models.ForeignKey[PurchaseOrder | None, PurchaseOrder | None] = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    order_line: models.ForeignKey[OrderLine | None, OrderLine | None] = models.ForeignKey(
        OrderLine,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    sales_day: models.ForeignKey[SalesDay | None, SalesDay | None] = models.ForeignKey(
        "SalesDay",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    paired_movement: models.ForeignKey[InventoryMovement | None, InventoryMovement | None] = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inverse_pair",
    )
    recorded_by: models.ForeignKey[User, User] = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="recorded_movements"
    )
    timestamp: models.DateTimeField[str, str] = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Movimiento de inventario"
        verbose_name_plural = "Movimientos de inventario"
        ordering = ["-timestamp"]
        constraints = [
            models.CheckConstraint(condition=Q(quantity__gt=0), name="movement_quantity_gt_0"),
            models.CheckConstraint(
                condition=Q(unit_cost__gte=0), name="movement_unit_cost_gte_0"
            ),
        ]
        indexes = [
            models.Index(fields=["product", "location"], name="mov_prod_loc_idx"),
            models.Index(fields=["sales_day"], name="mov_sales_day_idx"),
            models.Index(fields=["concept", "movement_type"], name="mov_concept_type_idx"),
            models.Index(fields=["recorded_by"], name="mov_recorded_by_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.movement_type} {self.concept} — {self.product} x{self.quantity}"


class LocationStock(models.Model):
    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product: models.ForeignKey[Product, Product] = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="location_stocks"
    )
    location: models.ForeignKey[Location, Location] = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="location_stocks"
    )
    current_quantity: models.DecimalField[Decimal, Decimal] = models.DecimalField(
        max_digits=12, decimal_places=4, default=Decimal("0")
    )
    updated_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stock por ubicación"
        verbose_name_plural = "Stocks por ubicación"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "location"], name="locationstock_unique"
            ),
            models.CheckConstraint(
                condition=Q(current_quantity__gte=0), name="locationstock_quantity_gte_0"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product} @ {self.location}: {self.current_quantity}"


class SalesDay(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Abierta"
        CLOSED = "closed", "Cerrada"

    class CashAlert(models.TextChoices):
        OK = "ok", "OK"
        SHORTAGE = "shortage", "Faltante"
        SURPLUS = "surplus", "Sobrante"

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date: models.DateField[str, str] = models.DateField(db_index=True)
    location: models.ForeignKey[Location, Location] = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name="sales_days",
        limit_choices_to={"location_type": Location.LocationType.POS},
    )
    seller: models.ForeignKey[User, User] = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="initiated_sales_days"
    )
    status: models.CharField[str, str] = models.CharField(
        max_length=10, choices=Status.choices, default=Status.OPEN
    )
    closed_by: models.ForeignKey[User | None, User | None] = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="closed_sales_days",
    )
    closed_at: models.DateTimeField[str | None, str | None] = models.DateTimeField(null=True, blank=True)
    cash_delivery: models.DecimalField[Decimal | None, Decimal | None] = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    cash_out_amount: models.DecimalField[Decimal | None, Decimal | None] = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    cash_out_description: models.TextField[str, str] = models.TextField(blank=True, default="")
    cash_alert: models.CharField[str | None, str | None] = models.CharField(
        max_length=10, choices=CashAlert.choices, null=True, blank=True
    )
    revenue_total: models.DecimalField[Decimal | None, Decimal | None] = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )  # snapshot at close, sum of DayCloseDetail.revenue
    created_at: models.DateTimeField[str, str] = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Jornada de venta"
        verbose_name_plural = "Jornadas de venta"
        ordering = ["-date", "-created_at"]
        constraints = [
            # BR-008: only one open sales day per location (PostgreSQL partial unique index)
            models.UniqueConstraint(
                fields=["location"],
                condition=Q(status="open"),
                name="salesday_unique_open_per_location",
            ),
        ]
        indexes = [
            models.Index(fields=["seller"], name="salesday_seller_idx"),
            models.Index(fields=["closed_by"], name="salesday_closed_by_idx"),
        ]

    def __str__(self) -> str:
        return f"Jornada {self.date} — {self.location} ({self.status})"


class DayCloseDetail(models.Model):
    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sales_day: models.ForeignKey[SalesDay, SalesDay] = models.ForeignKey(
        SalesDay, on_delete=models.CASCADE, related_name="day_close_details"
    )
    product: models.ForeignKey[Product, Product] = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="day_close_details"
    )
    transferred_units: models.PositiveIntegerField[int, int] = models.PositiveIntegerField()
    final_count: models.PositiveIntegerField[int, int] = models.PositiveIntegerField()
    sold_units: models.IntegerField[int, int] = models.IntegerField()  # may be negative if count > transferred (UX warns admin)
    revenue: models.DecimalField[Decimal, Decimal] = models.DecimalField(max_digits=12, decimal_places=2)
    cogs: models.DecimalField[Decimal, Decimal] = models.DecimalField(max_digits=12, decimal_places=2)
    gross_profit: models.DecimalField[Decimal, Decimal] = models.DecimalField(max_digits=12, decimal_places=2)
    snapshot_avg_cost_at_transfer: models.DecimalField[Decimal, Decimal] = models.DecimalField(
        max_digits=10, decimal_places=2, editable=False
    )
    central_stock_at_close: models.DecimalField[Decimal, Decimal] = models.DecimalField(
        max_digits=12, decimal_places=4, editable=False
    )

    class Meta:
        verbose_name = "Detalle de cierre de jornada"
        verbose_name_plural = "Detalles de cierre de jornada"
        constraints = [
            models.UniqueConstraint(
                fields=["sales_day", "product"],
                name="dayclosedetail_unique_per_salesday_product",
            ),
        ]

    def __str__(self) -> str:
        return f"Cierre {self.sales_day_id} — {self.product}"
