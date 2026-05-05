from __future__ import annotations

from decimal import Decimal

import factory
from django.contrib.auth.models import User
from factory.django import DjangoModelFactory
from faker import Faker

from apps.tienda.models import (
    InventoryMovement,
    Location,
    LocationStock,
    OrderLine,
    Product,
    PurchaseOrder,
    SalesDay,
    Supplier,
)

fake = Faker()


class UserFactory(DjangoModelFactory):
    """Factory for Django User."""

    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override the default _create to use create_user for password hashing."""
        password = kwargs.pop("password", "StrongPass123!")
        user = model_class.objects.create_user(*args, **kwargs)
        if password:
            user.set_password(password)
            user.save()
        return user


class ProductFactory(DjangoModelFactory):
    """Factory for Product model."""

    class Meta:
        model = Product

    name = factory.Faker("word")
    description = factory.Faker("sentence")
    unit_label = Product.UnitLabel.UNIT
    sale_price = Decimal("15.00")
    avg_cost = Decimal("10.00")
    reorder_point = 5
    suggested_order_qty = 10
    is_active = True


class SupplierFactory(DjangoModelFactory):
    """Factory for Supplier model."""

    class Meta:
        model = Supplier

    name = factory.Faker("company")
    contact = factory.Faker("phone_number")


class LocationFactory(DjangoModelFactory):
    """Factory for Location model."""

    class Meta:
        model = Location

    name = factory.Faker("word")
    location_type = Location.LocationType.POS


class PurchaseOrderFactory(DjangoModelFactory):
    """Factory for PurchaseOrder model."""

    class Meta:
        model = PurchaseOrder

    supplier = factory.SubFactory(SupplierFactory)
    status = PurchaseOrder.Status.INITIATED
    notes = factory.Faker("sentence")
    created_by = factory.SubFactory(UserFactory)
    order_date = factory.Faker("date_object")


class OrderLineFactory(DjangoModelFactory):
    """Factory for OrderLine model."""

    class Meta:
        model = OrderLine

    purchase_order = factory.SubFactory(PurchaseOrderFactory)
    product = factory.SubFactory(ProductFactory)
    ordered_quantity = 10
    expected_unit_cost = Decimal("12.00")
    status = OrderLine.Status.PENDING


class SalesDayFactory(DjangoModelFactory):
    """Factory for SalesDay model."""

    class Meta:
        model = SalesDay

    date = factory.Faker("date_object")
    location = factory.SubFactory(LocationFactory, location_type=Location.LocationType.POS)
    seller = factory.SubFactory(UserFactory)
    status = SalesDay.Status.OPEN
    cash_delivery = Decimal("0.00")


class InventoryMovementFactory(DjangoModelFactory):
    """Factory for InventoryMovement model."""

    class Meta:
        model = InventoryMovement

    product = factory.SubFactory(ProductFactory)
    location = factory.SubFactory(LocationFactory)
    movement_type = InventoryMovement.MovementType.IN
    quantity = 10
    unit_cost = Decimal("10.00")
    concept = InventoryMovement.Concept.PURCHASE
    recorded_by = factory.SubFactory(UserFactory)


class LocationStockFactory(DjangoModelFactory):
    """Factory for LocationStock model."""

    class Meta:
        model = LocationStock

    product = factory.SubFactory(ProductFactory)
    location = factory.SubFactory(LocationFactory)
    current_quantity = Decimal("100.0000")
