from __future__ import annotations

from decimal import Decimal

import pytest
from django.db import IntegrityError

from apps.tienda.helpers import (
    BulkInsufficientStockError,
    InsufficientStockError,
    apply_bulk_transfer_atomic,
    apply_movement_atomically,
    apply_transfer_atomic,
    compute_cash_alert,
    compute_close_summary,
    compute_replenishment_list,
    execute_sales_day_close,
)
from apps.tienda.models import (
    DayCloseDetail,
    InventoryMovement,
    Location,
    LocationStock,
    Product,
    PurchaseOrder,
    SalesDay,
)
from apps.tienda.tests.factories import (
    LocationFactory,
    LocationStockFactory,
    OrderLineFactory,
    ProductFactory,
    PurchaseOrderFactory,
    SalesDayFactory,
    UserFactory,
)


@pytest.mark.django_db
class TestApplyMovementAtomically:
    """Test apply_movement_atomically function."""

    def test_in_movement_increases_stock(self):
        """Test that IN movement increases LocationStock.current_quantity."""
        product = ProductFactory()
        location = LocationFactory()
        user = UserFactory()

        initial_qty = Decimal("50.0000")
        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=initial_qty,
        )

        movement = apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=10,
            unit_cost=Decimal("5.00"),
            concept=InventoryMovement.Concept.PURCHASE,
            recorded_by=user,
        )

        assert movement.movement_type == InventoryMovement.MovementType.IN
        assert movement.quantity == 10
        stock = LocationStock.objects.get(product=product, location=location)
        assert stock.current_quantity == initial_qty + Decimal("10")

    def test_in_movement_creates_stock_if_missing(self):
        """Test that IN movement creates LocationStock if it doesn't exist."""
        product = ProductFactory()
        location = LocationFactory()
        user = UserFactory()

        movement = apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=5,
            unit_cost=Decimal("10.00"),
            concept=InventoryMovement.Concept.PURCHASE,
            recorded_by=user,
        )

        assert movement.quantity == 5
        stock = LocationStock.objects.get(product=product, location=location)
        assert stock.current_quantity == Decimal("5")

    def test_out_movement_decreases_stock(self):
        """Test that OUT movement decreases LocationStock.current_quantity."""
        product = ProductFactory()
        location = LocationFactory()
        user = UserFactory()

        initial_qty = Decimal("50.0000")
        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=initial_qty,
        )

        movement = apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.OUT,
            quantity=10,
            unit_cost=Decimal("5.00"),
            concept=InventoryMovement.Concept.SALE,
            recorded_by=user,
        )

        assert movement.movement_type == InventoryMovement.MovementType.OUT
        assert movement.quantity == 10
        stock = LocationStock.objects.get(product=product, location=location)
        assert stock.current_quantity == initial_qty - Decimal("10")

    def test_out_movement_raises_insufficient_stock_error(self):
        """Test that OUT exceeding available stock raises InsufficientStockError."""
        product = ProductFactory()
        location = LocationFactory()
        user = UserFactory()

        initial_qty = Decimal("5.0000")
        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=initial_qty,
        )

        with pytest.raises(InsufficientStockError) as exc_info:
            apply_movement_atomically(
                product=product,
                location=location,
                movement_type=InventoryMovement.MovementType.OUT,
                quantity=10,
                unit_cost=Decimal("5.00"),
                concept=InventoryMovement.Concept.SALE,
                recorded_by=user,
            )

        assert exc_info.value.product == product
        assert exc_info.value.available == initial_qty
        assert exc_info.value.requested == 10

    def test_in_purchase_recalculates_avg_cost(self):
        """Test that PURCHASE IN movement recalculates product.avg_cost."""
        product = ProductFactory(avg_cost=Decimal("10.0000"))
        location = LocationFactory()
        user = UserFactory()

        # Create initial stock
        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=Decimal("100.0000"),
        )

        # Apply IN movement with different unit cost
        apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.0000"),
            concept=InventoryMovement.Concept.PURCHASE,
            recorded_by=user,
        )

        product.refresh_from_db()
        # avg_cost should be (100*10 + 100*20) / (100+100) = 15
        assert product.avg_cost == Decimal("15.0000")

    def test_in_adjustment_recalculates_avg_cost(self):
        """Test that ADJUSTMENT IN movement recalculates product.avg_cost."""
        product = ProductFactory(avg_cost=Decimal("10.0000"))
        location = LocationFactory()
        user = UserFactory()

        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=Decimal("100.0000"),
        )

        apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=50,
            unit_cost=Decimal("15.0000"),
            concept=InventoryMovement.Concept.ADJUSTMENT,
            recorded_by=user,
        )

        product.refresh_from_db()
        # avg_cost should be (100*10 + 50*15) / 150 = 11.67
        assert product.avg_cost == Decimal("11.6667")

    def test_in_transfer_does_not_recalculate_avg_cost(self):
        """Test that TRANSFER IN movement does NOT recalculate product.avg_cost."""
        product = ProductFactory(avg_cost=Decimal("10.0000"))
        location = LocationFactory()
        user = UserFactory()

        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=Decimal("100.0000"),
        )

        original_avg_cost = product.avg_cost
        apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=50,
            unit_cost=Decimal("20.0000"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=user,
        )

        product.refresh_from_db()
        assert product.avg_cost == original_avg_cost

    def test_out_movement_does_not_recalculate_avg_cost(self):
        """Test that OUT movement does NOT recalculate product.avg_cost."""
        product = ProductFactory(avg_cost=Decimal("10.0000"))
        location = LocationFactory()
        user = UserFactory()

        LocationStockFactory(
            product=product,
            location=location,
            current_quantity=Decimal("100.0000"),
        )

        original_avg_cost = product.avg_cost
        apply_movement_atomically(
            product=product,
            location=location,
            movement_type=InventoryMovement.MovementType.OUT,
            quantity=50,
            unit_cost=Decimal("10.0000"),
            concept=InventoryMovement.Concept.SALE,
            recorded_by=user,
        )

        product.refresh_from_db()
        assert product.avg_cost == original_avg_cost


@pytest.mark.django_db
class TestApplyTransferAtomic:
    """Test apply_transfer_atomic function."""

    def test_transfer_creates_paired_movements(self):
        """Test that transfer creates OUT and IN movements with correct pairing."""
        product = ProductFactory()
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        LocationStockFactory(
            product=product,
            location=from_location,
            current_quantity=Decimal("100.0000"),
        )

        out_mov, in_mov = apply_transfer_atomic(
            product=product,
            from_location=from_location,
            to_location=to_location,
            quantity=25,
            recorded_by=user,
        )

        assert out_mov.movement_type == InventoryMovement.MovementType.OUT
        assert out_mov.location == from_location
        assert out_mov.quantity == 25
        assert out_mov.concept == InventoryMovement.Concept.TRANSFER

        assert in_mov.movement_type == InventoryMovement.MovementType.IN
        assert in_mov.location == to_location
        assert in_mov.quantity == 25
        assert in_mov.concept == InventoryMovement.Concept.TRANSFER

        # Check pairing
        assert out_mov.paired_movement == in_mov
        assert in_mov.paired_movement == out_mov

    def test_transfer_updates_both_location_stocks(self):
        """Test that transfer correctly updates both source and destination stocks."""
        product = ProductFactory()
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        from_stock = LocationStockFactory(
            product=product,
            location=from_location,
            current_quantity=Decimal("100.0000"),
        )
        to_stock = LocationStockFactory(
            product=product,
            location=to_location,
            current_quantity=Decimal("0.0000"),
        )

        apply_transfer_atomic(
            product=product,
            from_location=from_location,
            to_location=to_location,
            quantity=30,
            recorded_by=user,
        )

        from_stock.refresh_from_db()
        to_stock.refresh_from_db()

        assert from_stock.current_quantity == Decimal("70.0000")
        assert to_stock.current_quantity == Decimal("30.0000")

    def test_transfer_snapshots_avg_cost(self):
        """Test that transfer uses snapshot of product.avg_cost at transfer time."""
        product = ProductFactory(avg_cost=Decimal("10.0000"))
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        LocationStockFactory(
            product=product,
            location=from_location,
            current_quantity=Decimal("100.0000"),
        )

        out_mov, in_mov = apply_transfer_atomic(
            product=product,
            from_location=from_location,
            to_location=to_location,
            quantity=50,
            recorded_by=user,
        )

        # Both movements should use the snapshot cost
        assert out_mov.unit_cost == Decimal("10.0000")
        assert in_mov.unit_cost == Decimal("10.0000")

    def test_transfer_insufficient_stock_raises_error(self):
        """Test that transfer with insufficient stock raises InsufficientStockError."""
        product = ProductFactory()
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        LocationStockFactory(
            product=product,
            location=from_location,
            current_quantity=Decimal("10.0000"),
        )

        with pytest.raises(InsufficientStockError):
            apply_transfer_atomic(
                product=product,
                from_location=from_location,
                to_location=to_location,
                quantity=50,
                recorded_by=user,
            )


@pytest.mark.django_db
class TestApplyBulkTransferAtomic:
    """Test apply_bulk_transfer_atomic function."""

    def test_bulk_transfer_all_items_success(self):
        """Test successful bulk transfer of multiple items."""
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        products = [ProductFactory() for _ in range(3)]
        for product in products:
            LocationStockFactory(
                product=product,
                location=from_location,
                current_quantity=Decimal("100.0000"),
            )

        items = [{"product": p, "quantity": 10 + i * 5} for i, p in enumerate(products)]

        results = apply_bulk_transfer_atomic(
            items=items,
            from_location=from_location,
            to_location=to_location,
            recorded_by=user,
        )

        assert len(results) == 3
        for out_mov, in_mov in results:
            assert out_mov.movement_type == InventoryMovement.MovementType.OUT
            assert in_mov.movement_type == InventoryMovement.MovementType.IN

    def test_bulk_transfer_insufficient_stock_rollback(self):
        """Test that bulk transfer rolls back all on any failure (all-or-nothing)."""
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        product1 = ProductFactory()
        product2 = ProductFactory()

        LocationStockFactory(
            product=product1,
            location=from_location,
            current_quantity=Decimal("100.0000"),
        )
        LocationStockFactory(
            product=product2,
            location=from_location,
            current_quantity=Decimal("5.0000"),  # Will fail
        )

        items = [
            {"product": product1, "quantity": 10},
            {"product": product2, "quantity": 20},  # Will fail
        ]

        with pytest.raises(BulkInsufficientStockError) as exc_info:
            apply_bulk_transfer_atomic(
                items=items,
                from_location=from_location,
                to_location=to_location,
                recorded_by=user,
            )

        assert len(exc_info.value.errors) == 1
        # Verify no movements were created
        assert InventoryMovement.objects.filter(
            product__in=[product1, product2]
        ).count() == 0

    def test_bulk_transfer_empty_items_list(self):
        """Test that bulk transfer with empty items succeeds with no transfers."""
        from_location = LocationFactory()
        to_location = LocationFactory()
        user = UserFactory()

        results = apply_bulk_transfer_atomic(
            items=[],
            from_location=from_location,
            to_location=to_location,
            recorded_by=user,
        )

        assert results == []


@pytest.mark.django_db
class TestComputeCashAlert:
    """Test compute_cash_alert function (pure logic, no DB)."""

    def test_cash_alert_ok(self):
        """Test OK alert when effective cash equals revenue."""
        cash_delivery = Decimal("1000.00")
        revenue_total = Decimal("1000.00")
        cash_out_amount = Decimal("0.00")

        alert = compute_cash_alert(cash_delivery, revenue_total, cash_out_amount)
        assert alert == SalesDay.CashAlert.OK

    def test_cash_alert_shortage(self):
        """Test SHORTAGE alert when effective cash is less than revenue."""
        cash_delivery = Decimal("800.00")
        revenue_total = Decimal("1000.00")
        cash_out_amount = Decimal("100.00")

        alert = compute_cash_alert(cash_delivery, revenue_total, cash_out_amount)
        assert alert == SalesDay.CashAlert.SHORTAGE

    def test_cash_alert_surplus(self):
        """Test SURPLUS alert when effective cash exceeds revenue."""
        cash_delivery = Decimal("1200.00")
        revenue_total = Decimal("1000.00")
        cash_out_amount = None

        alert = compute_cash_alert(cash_delivery, revenue_total, cash_out_amount)
        assert alert == SalesDay.CashAlert.SURPLUS

    def test_cash_alert_with_cash_out(self):
        """Test cash alert calculation including cash_out_amount."""
        cash_delivery = Decimal("900.00")
        revenue_total = Decimal("1000.00")
        cash_out_amount = Decimal("150.00")

        alert = compute_cash_alert(cash_delivery, revenue_total, cash_out_amount)
        # effective = 900 + 150 = 1050 > 1000 → SURPLUS
        assert alert == SalesDay.CashAlert.SURPLUS


@pytest.mark.django_db
class TestComputeCloseSummary:
    """Test compute_close_summary function."""

    def test_close_summary_single_product(self):
        """Test close summary with one product transferred to POS."""
        sales_day = SalesDayFactory()
        product = ProductFactory(sale_price=Decimal("50.00"))

        # Create TRANSFER IN movements (simulating traslado-apertura)
        apply_movement_atomically(
            product=product,
            location=sales_day.location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=sales_day.seller,
            sales_day=sales_day,
        )

        summary = compute_close_summary(sales_day)

        assert len(summary) == 1
        item = summary[0]
        assert item["product"] == product
        assert item["transferred_units"] == 100
        # The apply_movement_atomically creates stock at pos_location with 100 units
        # Since we haven't done any OUT movements, current_pos_stock should be 100
        assert item["current_pos_stock"] == Decimal("100.0000")
        # implied_sold = transferred - current = 100 - 100 = 0
        assert item["implied_sold_units"] == Decimal("0.0000")
        assert item["snapshot_avg_cost"] == Decimal("20.00")
        assert item["estimated_revenue"] == Decimal("0.00")  # 0 * 50
        assert item["estimated_cogs"] == Decimal("0.00")  # 0 * 20
        assert item["proposed_return_qty"] == Decimal("100.0000")

    def test_close_summary_multiple_products(self):
        """Test close summary with multiple products."""
        sales_day = SalesDayFactory()
        product1 = ProductFactory(sale_price=Decimal("50.00"))
        product2 = ProductFactory(sale_price=Decimal("100.00"))

        apply_movement_atomically(
            product=product1,
            location=sales_day.location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=sales_day.seller,
            sales_day=sales_day,
        )
        apply_movement_atomically(
            product=product2,
            location=sales_day.location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=50,
            unit_cost=Decimal("40.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=sales_day.seller,
            sales_day=sales_day,
        )

        summary = compute_close_summary(sales_day)

        assert len(summary) == 2


@pytest.mark.django_db
class TestComputeReplenishmentList:
    """Test compute_replenishment_list function."""

    def test_replenishment_list_below_reorder_point(self):
        """Test that products below reorder point are included."""
        central = LocationFactory(location_type=Location.LocationType.CENTRAL)

        product = ProductFactory(
            reorder_point=20,
            suggested_order_qty=50,
            is_active=True,
        )
        LocationStockFactory(
            product=product,
            location=central,
            current_quantity=Decimal("10.0000"),  # Below reorder point
        )

        replenishment = compute_replenishment_list(central)

        assert len(replenishment) == 1
        item = replenishment[0]
        assert item["product"] == product
        assert item["current_qty"] == Decimal("10.0000")
        assert item["reorder_point"] == 20
        assert item["suggested_order_qty"] == 50

    def test_replenishment_list_excludes_inactive_products(self):
        """Test that inactive products are excluded from replenishment."""
        central = LocationFactory(location_type=Location.LocationType.CENTRAL)

        inactive_product = ProductFactory(
            reorder_point=20,
            is_active=False,
        )
        LocationStockFactory(
            product=inactive_product,
            location=central,
            current_quantity=Decimal("5.0000"),
        )

        replenishment = compute_replenishment_list(central)

        assert len(replenishment) == 0

    def test_replenishment_list_excludes_above_reorder(self):
        """Test that products above reorder point are excluded."""
        central = LocationFactory(location_type=Location.LocationType.CENTRAL)

        product = ProductFactory(reorder_point=20, is_active=True)
        LocationStockFactory(
            product=product,
            location=central,
            current_quantity=Decimal("50.0000"),  # Above reorder point
        )

        replenishment = compute_replenishment_list(central)

        assert len(replenishment) == 0

    def test_replenishment_accounts_for_active_orders(self):
        """Test that active purchase orders reduce net_quantity_to_order."""
        central = LocationFactory(location_type=Location.LocationType.CENTRAL)

        product = ProductFactory(
            reorder_point=20,
            suggested_order_qty=100,
            is_active=True,
        )
        LocationStockFactory(
            product=product,
            location=central,
            current_quantity=Decimal("10.0000"),
        )

        # Create active purchase order with this product
        po = PurchaseOrderFactory(status=PurchaseOrder.Status.PENDING)
        OrderLineFactory(
            purchase_order=po,
            product=product,
            ordered_quantity=40,
        )

        replenishment = compute_replenishment_list(central)

        assert len(replenishment) == 1
        item = replenishment[0]
        # net_to_order = max(0, 100 - 40) = 60
        assert item["net_quantity_to_order"] == 60


@pytest.mark.django_db
class TestExecuteSalesDayClose:
    """Test execute_sales_day_close function."""

    def test_close_creates_day_close_details(self):
        """Test that close creates DayCloseDetail records."""
        sales_day = SalesDayFactory()
        product = ProductFactory(sale_price=Decimal("50.00"), avg_cost=Decimal("20.00"))
        closer = UserFactory()

        # Simulate transfers to POS
        apply_movement_atomically(
            product=product,
            location=sales_day.location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("20.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=sales_day.seller,
            sales_day=sales_day,
        )

        # Close with physical count
        count_items = [{"product": product, "final_count": 20}]
        closed_day = execute_sales_day_close(
            sales_day=sales_day,
            count_items=count_items,
            cash_delivery=Decimal("4000.00"),
            closed_by=closer,
        )

        assert closed_day.status == SalesDay.Status.CLOSED
        assert closed_day.closed_by == closer

        details = DayCloseDetail.objects.filter(sales_day=sales_day)
        assert details.count() == 1
        detail = details.first()
        assert detail.product == product
        assert detail.transferred_units == 100
        assert detail.final_count == 20
        assert detail.sold_units == 80

    def test_close_sets_cash_alert(self):
        """Test that close sets appropriate cash alert."""
        sales_day = SalesDayFactory()
        product = ProductFactory()
        closer = UserFactory()

        apply_movement_atomically(
            product=product,
            location=sales_day.location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("10.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=sales_day.seller,
            sales_day=sales_day,
        )

        count_items = [{"product": product, "final_count": 0}]
        # revenue = 100 * sale_price = 100 * 15 = 1500
        # cash_delivery = 1500 → OK
        closed_day = execute_sales_day_close(
            sales_day=sales_day,
            count_items=count_items,
            cash_delivery=product.sale_price * 100,
            closed_by=closer,
        )

        assert closed_day.cash_alert == SalesDay.CashAlert.OK

    def test_close_creates_return_movements(self, central_location):
        """Test that close creates return transfers to central."""
        pos = LocationFactory(location_type=Location.LocationType.POS)
        sales_day = SalesDayFactory(location=pos)
        product = ProductFactory()
        closer = UserFactory()

        apply_movement_atomically(
            product=product,
            location=central_location,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("10.00"),
            concept=InventoryMovement.Concept.PURCHASE,
            recorded_by=sales_day.seller,
        )
        apply_movement_atomically(
            product=product,
            location=pos,
            movement_type=InventoryMovement.MovementType.IN,
            quantity=100,
            unit_cost=Decimal("10.00"),
            concept=InventoryMovement.Concept.TRANSFER,
            recorded_by=sales_day.seller,
            sales_day=sales_day,
        )

        count_items = [{"product": product, "final_count": 30}]
        execute_sales_day_close(
            sales_day=sales_day,
            count_items=count_items,
            cash_delivery=Decimal("1050.00"),
            closed_by=closer,
        )

        # Check that 30 units were returned from POS to central_location
        movements = InventoryMovement.objects.filter(
            product=product,
            location=pos,
            movement_type=InventoryMovement.MovementType.OUT,
            concept=InventoryMovement.Concept.TRANSFER,
            sales_day=sales_day,
        )
        assert movements.count() == 1
        assert movements.first().quantity == 30
