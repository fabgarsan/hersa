from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any

from django.contrib.auth.models import User
from django.db import models, transaction
from django.db.models import Sum
from django.utils import timezone

from apps.tienda.models import (
    DayCloseDetail,
    InventoryMovement,
    Location,
    LocationStock,
    OrderLine,
    Product,
    PurchaseOrder,
    SalesDay,
)
from apps.tienda.utils import decimal_safe_div, weighted_average

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------


class InsufficientStockError(Exception):
    """Raised when a SALIDA would make LocationStock.current_quantity negative (BR-022)."""

    def __init__(
        self,
        product: Product,
        location: Location,
        available: Decimal,
        requested: int,
    ) -> None:
        self.product = product
        self.location = location
        self.available = available
        self.requested = requested
        super().__init__(
            f"Insufficient stock for {product} at {location}: "
            f"available={available}, requested={requested}"
        )


class BulkInsufficientStockError(Exception):
    """Raised when one or more items in a bulk transfer have insufficient stock (BR-016)."""

    def __init__(self, errors: list[InsufficientStockError]) -> None:
        self.errors = errors
        super().__init__(
            f"Insufficient stock for {len(errors)} product(s): "
            + ", ".join(str(e.product) for e in errors)
        )


class SalesDayAlreadyClosedError(Exception):
    """Raised when trying to close an already-closed SalesDay (BR-010)."""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _get_or_create_stock_for_update(
    product: Product, location: Location
) -> LocationStock:
    """Get or create LocationStock and lock it with SELECT FOR UPDATE."""
    stock, _ = LocationStock.objects.get_or_create(
        product=product,
        location=location,
        defaults={"current_quantity": Decimal("0")},
    )
    # Re-fetch with row-level lock so we are sure we hold the lock.
    return LocationStock.objects.select_for_update().get(pk=stock.pk)


def _snapshot_avg_cost_from_movements(
    movements: list[InventoryMovement],
    default: Decimal = Decimal("0"),
) -> Decimal:
    """Compute weighted-average unit cost from a list of transfer movements (BR-004, BR-012).

    Returns `default` when the total quantity is zero.
    """
    total_cost: Decimal = sum(
        (Decimal(m.quantity) * m.unit_cost for m in movements), Decimal("0")
    )
    total_qty: int = sum((m.quantity for m in movements), 0)
    return decimal_safe_div(total_cost, Decimal(total_qty), default=default)


# ---------------------------------------------------------------------------
# recalc_avg_cost
# ---------------------------------------------------------------------------


def recalc_avg_cost(
    product: Product,
    incoming_qty: int,
    unit_cost: Decimal,
) -> None:
    """Recalculate product.avg_cost using the weighted average formula (BR-001, BR-002).

    Must be called inside an existing transaction.atomic() block (caller's responsibility).
    Only call for IN movements with concept=PURCHASE or ADJUSTMENT — never for SALIDA.
    """
    stock_total: Decimal = (
        LocationStock.objects.filter(product=product).aggregate(
            total=Sum("current_quantity")
        )["total"]
        or Decimal("0")
    )

    total_after: Decimal = stock_total + Decimal(incoming_qty)
    if total_after == Decimal("0"):
        # Edge case: nothing on hand and nothing coming in — leave avg_cost unchanged.
        return

    new_avg: Decimal = weighted_average(
        stock_total, product.avg_cost, incoming_qty, unit_cost
    )
    product.avg_cost = new_avg
    product.save(update_fields=["avg_cost"])


# ---------------------------------------------------------------------------
# apply_movement_atomically
# ---------------------------------------------------------------------------


def apply_movement_atomically(
    product: Product,
    location: Location,
    movement_type: str,
    quantity: int,
    unit_cost: Decimal,
    concept: str,
    recorded_by: User,
    *,
    note: str = "",
    purchase_order: PurchaseOrder | None = None,
    order_line: OrderLine | None = None,
    sales_day: SalesDay | None = None,
    paired_movement: InventoryMovement | None = None,
) -> InventoryMovement:
    """Apply a single inventory movement atomically (BR-021, BR-022, BR-001, BR-002).

    Runs in transaction.atomic(). Locks the LocationStock row with select_for_update().
    """
    with transaction.atomic():
        stock: LocationStock = _get_or_create_stock_for_update(product, location)

        if movement_type == InventoryMovement.MovementType.OUT:
            if stock.current_quantity < Decimal(quantity):
                raise InsufficientStockError(
                    product=product,
                    location=location,
                    available=stock.current_quantity,
                    requested=quantity,
                )
            stock.current_quantity -= Decimal(quantity)

        elif movement_type == InventoryMovement.MovementType.IN:
            recalc_concepts = {
                InventoryMovement.Concept.PURCHASE,
                InventoryMovement.Concept.ADJUSTMENT,
            }
            if concept in recalc_concepts:
                recalc_avg_cost(product, quantity, unit_cost)
            stock.current_quantity += Decimal(quantity)

        stock.save(update_fields=["current_quantity", "updated_at"])

        movement: InventoryMovement = InventoryMovement.objects.create(
            product=product,
            location=location,
            movement_type=movement_type,
            quantity=quantity,
            unit_cost=unit_cost,
            concept=concept,
            note=note,
            purchase_order=purchase_order,
            order_line=order_line,
            sales_day=sales_day,
            paired_movement=paired_movement,
            recorded_by=recorded_by,
        )

    return movement


# ---------------------------------------------------------------------------
# apply_transfer_atomic
# ---------------------------------------------------------------------------


def apply_transfer_atomic(
    product: Product,
    from_location: Location,
    to_location: Location,
    quantity: int,
    recorded_by: User,
    *,
    sales_day: SalesDay | None = None,
) -> tuple[InventoryMovement, InventoryMovement]:
    """Create a paired OUT/IN transfer between two locations (BR-003, BR-005, BR-002).

    Snapshot of avg_cost is taken at the start of the transaction before any mutations.
    """
    with transaction.atomic():
        # BR-003: refresh avg_cost from DB before snapshot to avoid stale in-memory value
        # under PostgreSQL READ COMMITTED (TOCTOU guard).
        product.refresh_from_db(fields=["avg_cost"])
        snapshot_cost: Decimal = product.avg_cost

        out_movement: InventoryMovement = apply_movement_atomically(
            product=product,
            location=from_location,
            movement_type=InventoryMovement.MovementType.OUT,
            quantity=quantity,
            unit_cost=snapshot_cost,
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=recorded_by,
            sales_day=sales_day,
        )

        # TRANSFER IN does NOT recalc avg_cost (BR-002).
        in_movement: InventoryMovement = apply_movement_atomically(
            product=product,
            location=to_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=quantity,
            unit_cost=snapshot_cost,
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=recorded_by,
            sales_day=sales_day,
        )

        # Link paired movements.
        out_movement.paired_movement = in_movement
        out_movement.save(update_fields=["paired_movement"])
        in_movement.paired_movement = out_movement
        in_movement.save(update_fields=["paired_movement"])

    return out_movement, in_movement


# ---------------------------------------------------------------------------
# apply_bulk_transfer_atomic
# ---------------------------------------------------------------------------


def apply_bulk_transfer_atomic(
    items: list[dict[str, Any]],
    from_location: Location,
    to_location: Location,
    recorded_by: User,
    *,
    sales_day: SalesDay | None = None,
) -> list[tuple[InventoryMovement, InventoryMovement]]:
    """Transfer multiple products in a single ALL-OR-NOTHING transaction (BR-016).

    items: list of {"product": Product, "quantity": int}
    Raises BulkInsufficientStockError if any item has insufficient stock.
    """
    with transaction.atomic():
        # First pass: validate all items, collect all failures.
        errors: list[InsufficientStockError] = []
        locked_stocks: dict[Any, LocationStock] = {}

        for item in items:
            product: Product = item["product"]
            quantity: int = item["quantity"]

            stock, _ = LocationStock.objects.get_or_create(
                product=product,
                location=from_location,
                defaults={"current_quantity": Decimal("0")},
            )
            locked_stock: LocationStock = LocationStock.objects.select_for_update().get(
                pk=stock.pk
            )
            locked_stocks[product.pk] = locked_stock

            if locked_stock.current_quantity < Decimal(quantity):
                errors.append(
                    InsufficientStockError(
                        product=product,
                        location=from_location,
                        available=locked_stock.current_quantity,
                        requested=quantity,
                    )
                )

        if errors:
            raise BulkInsufficientStockError(errors)

        # Second pass: execute all transfers (all stock validated above).
        results: list[tuple[InventoryMovement, InventoryMovement]] = []
        for item in items:
            product = item["product"]
            quantity = item["quantity"]
            pair = apply_transfer_atomic(
                product=product,
                from_location=from_location,
                to_location=to_location,
                quantity=quantity,
                recorded_by=recorded_by,
                sales_day=sales_day,
            )
            results.append(pair)

    return results


# ---------------------------------------------------------------------------
# compute_close_summary
# ---------------------------------------------------------------------------


def compute_close_summary(sales_day: SalesDay) -> list[dict[str, Any]]:
    """Build a pre-close summary per product for this SalesDay (BR-004, BR-011).

    Read-only — no DB writes.
    """
    transfers = (
        InventoryMovement.objects.filter(
            sales_day=sales_day,
            location=sales_day.location,
            movement_type=InventoryMovement.MovementType.IN,
            concept=InventoryMovement.Concept.TRANSFER,
        )
        .select_related("product")
        .order_by("product_id")
    )

    # Group transfers by product.
    product_transfers: dict[Any, list[InventoryMovement]] = {}
    for movement in transfers:
        product_transfers.setdefault(movement.product.pk, []).append(movement)

    result: list[dict[str, Any]] = []
    for product_pk, movements in product_transfers.items():
        product: Product = movements[0].product

        transferred_units: int = sum(m.quantity for m in movements)

        try:
            pos_stock: LocationStock = LocationStock.objects.get(
                product=product, location=sales_day.location
            )
            current_pos_stock: Decimal = pos_stock.current_quantity
        except LocationStock.DoesNotExist:
            current_pos_stock = Decimal("0")

        implied_sold_units: Decimal = Decimal(transferred_units) - current_pos_stock

        # BR-004: weighted avg of transfer unit_costs.
        snapshot_avg_cost: Decimal = _snapshot_avg_cost_from_movements(
            movements, default=Decimal("0")
        )

        estimated_revenue: Decimal = implied_sold_units * product.sale_price
        estimated_cogs: Decimal = implied_sold_units * snapshot_avg_cost
        proposed_return_qty: Decimal = current_pos_stock

        result.append(
            {
                "product": product,
                "transferred_units": transferred_units,
                "current_pos_stock": current_pos_stock,
                "implied_sold_units": implied_sold_units,
                "snapshot_avg_cost": snapshot_avg_cost,
                "estimated_revenue": estimated_revenue,
                "estimated_cogs": estimated_cogs,
                "proposed_return_qty": proposed_return_qty,
            }
        )

    return result


# ---------------------------------------------------------------------------
# compute_cash_alert
# ---------------------------------------------------------------------------


def compute_cash_alert(
    cash_delivery: Decimal,
    revenue_total: Decimal,
    cash_out_amount: Decimal | None,
) -> str:
    """Determine cash alert status for a SalesDay close (BR-024)."""
    effective_cash: Decimal = cash_delivery + (cash_out_amount or Decimal("0"))
    if effective_cash < revenue_total:
        return SalesDay.CashAlert.SHORTAGE
    if effective_cash > revenue_total:
        return SalesDay.CashAlert.SURPLUS
    return SalesDay.CashAlert.OK


# ---------------------------------------------------------------------------
# execute_sales_day_close
# ---------------------------------------------------------------------------


def execute_sales_day_close(
    sales_day: SalesDay,
    count_items: list[dict[str, Any]],
    cash_delivery: Decimal,
    closed_by: User,
    *,
    cash_out_amount: Decimal | None = None,
    cash_out_description: str = "",
) -> SalesDay:
    """Close a SalesDay, record physical counts, return transfers, and compute financials.

    count_items: list of {"product": Product, "final_count": int}
    Business rules: BR-010, BR-012, BR-023, BR-024.
    """
    if sales_day.status != SalesDay.Status.OPEN:
        raise SalesDayAlreadyClosedError(
            f"SalesDay {sales_day.pk} is already closed."
        )

    with transaction.atomic():
        pos_location: Location = sales_day.location
        central_location: Location = Location.objects.get(
            location_type=Location.LocationType.CENTRAL
        )

        created_details: list[DayCloseDetail] = []

        for item in count_items:
            product: Product = item["product"]
            final_count: int = item["final_count"]

            # Compute snapshot cost for this product's transfers today (BR-012).
            day_transfers = InventoryMovement.objects.filter(
                sales_day=sales_day,
                location=pos_location,
                movement_type=InventoryMovement.MovementType.IN,
                concept=InventoryMovement.Concept.TRANSFER,
                product=product,
            )

            transferred_units: int = (
                day_transfers.aggregate(total=Sum("quantity"))["total"] or 0
            )

            snapshot_avg_cost: Decimal = _snapshot_avg_cost_from_movements(
                list(day_transfers), default=product.avg_cost
            )

            sold_units: int = transferred_units - final_count
            if sold_units < 0:
                logger.warning(
                    "SalesDay %s: product %s final_count (%d) > transferred_units (%d); "
                    "sold_units clamped to 0.",
                    sales_day.pk,
                    product.pk,
                    final_count,
                    transferred_units,
                )
            return_qty: int = final_count

            # BR-012: return remaining inventory to CENTRAL at snapshot cost.
            if return_qty > 0:
                # Use apply_movement_atomically directly to control the unit_cost.
                out_mv: InventoryMovement = apply_movement_atomically(
                    product=product,
                    location=pos_location,
                    movement_type=InventoryMovement.MovementType.OUT,
                    quantity=return_qty,
                    unit_cost=snapshot_avg_cost,
                    concept=InventoryMovement.Concept.TRANSFER,
                    recorded_by=closed_by,
                    sales_day=sales_day,
                )
                in_mv: InventoryMovement = apply_movement_atomically(
                    product=product,
                    location=central_location,
                    movement_type=InventoryMovement.MovementType.IN,
                    quantity=return_qty,
                    unit_cost=snapshot_avg_cost,
                    concept=InventoryMovement.Concept.TRANSFER,
                    recorded_by=closed_by,
                    sales_day=sales_day,
                )
                out_mv.paired_movement = in_mv
                out_mv.save(update_fields=["paired_movement"])
                in_mv.paired_movement = out_mv
                in_mv.save(update_fields=["paired_movement"])

            revenue: Decimal = max(Decimal("0"), Decimal(sold_units)) * product.sale_price
            cogs: Decimal = max(Decimal("0"), Decimal(sold_units)) * snapshot_avg_cost
            gross_profit: Decimal = revenue - cogs

            # BR-023: read central stock AFTER the return transfer.
            try:
                central_ls: LocationStock = LocationStock.objects.get(
                    product=product, location=central_location
                )
                central_stock_at_close: Decimal = central_ls.current_quantity
            except LocationStock.DoesNotExist:
                central_stock_at_close = Decimal("0")

            detail: DayCloseDetail = DayCloseDetail.objects.create(
                sales_day=sales_day,
                product=product,
                transferred_units=transferred_units,
                final_count=final_count,
                sold_units=sold_units,
                revenue=revenue,
                cogs=cogs,
                gross_profit=gross_profit,
                snapshot_avg_cost_at_transfer=snapshot_avg_cost,
                central_stock_at_close=central_stock_at_close,
            )
            created_details.append(detail)

        revenue_total: Decimal = sum(
            (d.revenue for d in created_details), Decimal("0")
        )
        cash_alert: str = compute_cash_alert(
            cash_delivery, revenue_total, cash_out_amount
        )

        sales_day.status = SalesDay.Status.CLOSED
        sales_day.closed_by = closed_by
        sales_day.closed_at = timezone.now()  # type: ignore[assignment]
        sales_day.cash_delivery = cash_delivery
        sales_day.cash_out_amount = cash_out_amount
        sales_day.cash_out_description = cash_out_description
        sales_day.revenue_total = revenue_total
        sales_day.cash_alert = cash_alert
        sales_day.save(
            update_fields=[
                "status",
                "closed_by",
                "closed_at",
                "cash_delivery",
                "cash_out_amount",
                "cash_out_description",
                "revenue_total",
                "cash_alert",
            ]
        )

    return sales_day


# ---------------------------------------------------------------------------
# compute_replenishment_list
# ---------------------------------------------------------------------------


def compute_replenishment_list(
    central_location: Location,
) -> list[dict[str, Any]]:
    """Return products at CENTRAL that are at or below their reorder point (BR-026).

    Sorted by net_quantity_to_order descending.
    """
    stocks = (
        LocationStock.objects.filter(
            location=central_location,
            current_quantity__lte=models.F("product__reorder_point"),
            product__is_active=True,
        )
        .select_related("product")
    )

    active_po_statuses: list[str] = [
        PurchaseOrder.Status.INITIATED,
        PurchaseOrder.Status.PENDING,
    ]
    reception_statuses: list[str] = [
        PurchaseOrder.Status.PENDING,
        PurchaseOrder.Status.PARTIAL,
    ]

    result: list[dict[str, Any]] = []
    for stock in stocks:
        product: Product = stock.product

        units_in_active_orders: int = (
            OrderLine.objects.filter(
                product=product,
                purchase_order__status__in=active_po_statuses,
            ).aggregate(total=Sum("ordered_quantity"))["total"]
            or 0
        )

        units_in_reception: int = (
            OrderLine.objects.filter(
                product=product,
                purchase_order__status__in=reception_statuses,
            ).aggregate(total=Sum("ordered_quantity"))["total"]
            or 0
        )

        net_quantity_to_order: int = max(
            0,
            product.suggested_order_qty - units_in_active_orders,
        )

        result.append(
            {
                "product": product,
                "current_qty": stock.current_quantity,
                "reorder_point": product.reorder_point,
                "suggested_order_qty": product.suggested_order_qty,
                "units_in_active_orders": units_in_active_orders,
                "units_in_reception": units_in_reception,
                "net_quantity_to_order": net_quantity_to_order,
            }
        )

    result.sort(key=lambda r: r["net_quantity_to_order"], reverse=True)
    return result
