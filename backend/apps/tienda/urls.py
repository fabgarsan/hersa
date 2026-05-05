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
    # EP-02 — Purchase orders (Step 5)
    # EP-03 — Receive orders (Step 6)
    # EP-04 — Sales days (Step 7)
    # EP-05 — Inventory adjustments / EP-06 — Close summary (Step 8)
]
