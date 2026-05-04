from __future__ import annotations

from django.contrib import admin
from django.http import HttpRequest

from .models import (
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


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin[Location]):
    list_display = ["name", "location_type"]
    list_filter = ["location_type"]
    search_fields = ["name"]


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin[Supplier]):
    list_display = ["name", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin[Product]):
    list_display = ["name", "unit_label", "sale_price", "avg_cost", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    readonly_fields = ["avg_cost", "created_at", "updated_at"]
    fieldsets = [
        ("Información general", {"fields": ["name", "description", "unit_label", "is_active"]}),
        ("Precios e inventario", {
            "fields": ["sale_price", "avg_cost", "reorder_point", "suggested_order_qty"]
        }),
        ("Fechas", {"fields": ["created_at", "updated_at"]}),
    ]


@admin.register(ProductSupplier)
class ProductSupplierAdmin(admin.ModelAdmin[ProductSupplier]):
    list_display = ["product", "supplier", "created_at"]
    list_filter = ["supplier"]
    autocomplete_fields = ["product", "supplier"]
    readonly_fields = ["created_at"]


class OrderLineInline(admin.TabularInline):  # type: ignore[type-arg]
    model = OrderLine
    extra = 0
    readonly_fields = ["received_quantity_cumulative", "status"]
    fields = [
        "product",
        "ordered_quantity",
        "expected_unit_cost",
        "received_quantity_cumulative",
        "status",
    ]


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin[PurchaseOrder]):
    list_display = ["id", "supplier", "status", "order_date", "created_by", "created_at"]
    list_filter = ["status", "supplier"]
    search_fields = ["id", "supplier__name"]
    readonly_fields = ["created_by", "created_at", "updated_at"]
    inlines = [OrderLineInline]
    fieldsets = [
        ("Información general", {"fields": ["supplier", "status", "order_date"]}),
        ("Notas", {"fields": ["notes", "closing_justification"]}),
        ("Trazabilidad", {"fields": ["created_by", "created_at", "updated_at"]}),
    ]

    def save_model(
        self,
        request: HttpRequest,
        obj: PurchaseOrder,
        form: object,
        change: bool,
    ) -> None:
        if not obj.pk:
            obj.created_by = request.user  # type: ignore[assignment]
        super().save_model(request, obj, form, change)


@admin.register(OrderLine)
class OrderLineAdmin(admin.ModelAdmin[OrderLine]):
    list_display = ["purchase_order", "product", "ordered_quantity", "received_quantity_cumulative", "status"]
    list_filter = ["status"]
    search_fields = ["product__name"]
    readonly_fields = ["received_quantity_cumulative"]


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin[InventoryMovement]):
    list_display = ["movement_type", "concept", "product", "location", "quantity", "unit_cost", "recorded_by", "timestamp"]
    list_filter = ["movement_type", "concept", "location"]
    search_fields = ["product__name"]
    readonly_fields = ["timestamp", "recorded_by", "paired_movement"]
    date_hierarchy = "timestamp"

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(self, request: HttpRequest, obj: object = None) -> bool:
        return False


@admin.register(LocationStock)
class LocationStockAdmin(admin.ModelAdmin[LocationStock]):
    list_display = ["product", "location", "current_quantity", "updated_at"]
    list_filter = ["location"]
    search_fields = ["product__name"]
    readonly_fields = ["updated_at"]

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(self, request: HttpRequest, obj: object = None) -> bool:
        return False


class DayCloseDetailInline(admin.TabularInline):  # type: ignore[type-arg]
    model = DayCloseDetail
    extra = 0
    readonly_fields = [
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

    def has_add_permission(self, request: HttpRequest, obj: object = None) -> bool:
        return False

    def has_delete_permission(self, request: HttpRequest, obj: object = None) -> bool:
        return False


@admin.register(SalesDay)
class SalesDayAdmin(admin.ModelAdmin[SalesDay]):
    list_display = ["date", "location", "seller", "status", "cash_alert", "revenue_total", "created_at"]
    list_filter = ["status", "location", "cash_alert"]
    search_fields = ["seller__username", "seller__first_name", "seller__last_name"]
    readonly_fields = [
        "seller",
        "closed_by",
        "closed_at",
        "cash_alert",
        "revenue_total",
        "created_at",
    ]
    inlines = [DayCloseDetailInline]
    date_hierarchy = "date"


@admin.register(DayCloseDetail)
class DayCloseDetailAdmin(admin.ModelAdmin[DayCloseDetail]):
    list_display = [
        "sales_day",
        "product",
        "transferred_units",
        "sold_units",
        "revenue",
        "gross_profit",
    ]
    search_fields = ["product__name"]
    readonly_fields = [
        "sales_day",
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

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(self, request: HttpRequest, obj: object = None) -> bool:
        return False
