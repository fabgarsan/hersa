from __future__ import annotations

from typing import Any

from django.urls import URLPattern, path

from apps.tienda import views

app_name = "tienda"

urlpatterns: list[URLPattern | Any] = [
    # EP-01 — Catalog
    path("productos/", views.ProductListView.as_view(), name="product-list"),
    path("productos/<uuid:pk>/", views.ProductDetailView.as_view(), name="product-detail"),
    path("productos/<uuid:pk>/proveedores/", views.ProductSupplierView.as_view(), name="product-supplier"),
    path(
        "productos/<uuid:pk>/proveedores/<uuid:supplier_pk>/",
        views.ProductSupplierDetailView.as_view(),
        name="product-supplier-detail",
    ),
    path("proveedores/", views.SupplierListView.as_view(), name="supplier-list"),
    path("proveedores/<uuid:pk>/", views.SupplierDetailView.as_view(), name="supplier-detail"),
    # EP-07 — Stock
    path("stock/", views.StockListView.as_view(), name="stock-list"),
    path("stock/total/", views.StockTotalView.as_view(), name="stock-total"),
    path("stock/reabastecimiento/", views.StockReplenishmentView.as_view(), name="stock-replenishment"),
    # EP-02 — Purchase orders
    path("ordenes-compra/", views.PurchaseOrderListView.as_view(), name="purchase-order-list"),
    path(
        "ordenes-compra/desde-reabastecimiento/",
        views.PurchaseOrderFromReplenishmentView.as_view(),
        name="purchase-order-from-replenishment",
    ),
    path(
        "ordenes-compra/<uuid:pk>/",
        views.PurchaseOrderDetailView.as_view(),
        name="purchase-order-detail",
    ),
    path(
        "ordenes-compra/<uuid:pk>/confirmar/",
        views.PurchaseOrderConfirmView.as_view(),
        name="purchase-order-confirm",
    ),
    path(
        "ordenes-compra/<uuid:pk>/recepcionar/",
        views.PurchaseOrderReceiveView.as_view(),
        name="purchase-order-receive",
    ),
    path(
        "ordenes-compra/<uuid:pk>/cerrar/",
        views.PurchaseOrderCloseView.as_view(),
        name="purchase-order-close",
    ),
    # EP-03 / EP-04 — Jornada (Sales Day)
    path("jornadas/", views.SalesDayListView.as_view(), name="sales-day-list"),
    path("jornadas/abierta/", views.SalesDayOpenView.as_view(), name="sales-day-open"),
    path("jornadas/<uuid:pk>/", views.SalesDayDetailView.as_view(), name="sales-day-detail"),
    path(
        "jornadas/<uuid:pk>/traslado-apertura/",
        views.SalesDayBulkTransferView.as_view(),
        name="sales-day-bulk-transfer",
    ),
    path(
        "jornadas/<uuid:pk>/reposicion/",
        views.SalesDayReplenishmentView.as_view(),
        name="sales-day-replenishment",
    ),
    # EP-05 — Inventory adjustments / EP-06 — Close summary (Step 8)
]
