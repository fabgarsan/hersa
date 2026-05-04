# TDD: Módulo Tienda

**Status:** Draft
**Date:** 2026-05-04
**Version:** 1.0
**Source documents:**
- Functional spec: `documentation/requirements/tienda-especificaciones-funcionales.md` v1.3
- UX spec: `documentation/requirements/ux/tienda-ux-spec.md` v1.2
- UI spec: `documentation/requirements/ui/tienda-ui-spec.md` v1.0

## Table of contents

1. Technical summary
2. Affected components
3. Database design
4. API design
5. Frontend design
6. Security
7. Implementation plan
8. Technical decisions
9. Risks
10. Estimation

---

## 1. Technical summary

The Tienda module adds a self-contained inventory + point-of-sale subsystem to the existing Hersa monorepo. It introduces a new Django app `apps/tienda` (sibling to `apps/users`, `apps/modules`, `apps/core`) that owns the catálogo (Producto, Proveedor), the purchase order pipeline (OrdenDeCompra, LineaOrden), the inventory ledger (MovimientoInventario, StockUbicacion) and the daily session lifecycle (JornadaVenta, DetalleCierreJornada). All endpoints are mounted under the existing `/api/v1/` prefix using the project's CBV pattern (APIView), JWT auth via SimpleJWT, the shared `StandardResultsSetPagination`, and DRF's response envelope already in use.

Two new operational roles (`tienda_admin`, `tienda_vendedor`) are modelled with Django's native `auth.Group`. Both groups are created by a seed data migration in `apps/tienda/` and are assigned the matching permissions on `apps.modules.AppModule` (`access_tienda_admin`, `access_tienda_vendedor`, plus the parent `access_tienda` gate). Permission classes (`IsTiendaAdmin`, `IsTiendaVendedor`) check group membership directly. The frontend reuses `ModuleGuard` + `usePermissions` + the access flag `modules.access_tienda` already wired in `App.tsx` and adds nested routes underneath `/tienda/*`. Role differentiation in the UI is implemented as render-conditional JSX driven by a new `useTiendaRole()` hook (BR-027) — never CSS visibility — and the same rule is enforced server-side by serializer-level field stripping selected by group membership.

The module's two non-trivial transactional operations (atomic bulk transfer at jornada opening; atomic close with retorno + DetalleCierreJornada generation) and every individual `MovimientoInventario` write run inside `transaction.atomic()` blocks combined with `select_for_update()` on the `StockUbicacion` rows being mutated. `StockUbicacion` is the authoritative balance store (BR-014, BR-021); `MovimientoInventario` is the immutable audit log. A PostgreSQL `partial unique index` on `JornadaVenta(ubicacion)` filtered by `estado='abierta'` enforces BR-008 at the database level. The avg_cost recalculation lives in `apps/tienda/helpers.py` and runs only on `ENTRADA` movements (BR-001/BR-002). React Query handles all server state on the frontend; `react-hook-form` + `useFieldArray` + `react-window` implement PATTERN-IMR-01 for the three inline multi-row screens (RECEP-FORM, TRASLADO-APERTURA, CIERRE-CONTEO) with localStorage draft persistence for the close flow.

---

## 2. Affected components

| Component | Type | Action | Change description |
|-----------|------|--------|--------------------|
| `backend/apps/tienda/` | Django app | Create | New app: models, serializers, views, urls, helpers, utils, signals, admin, tests, factories, permissions, throttles |
| `backend/apps/tienda/models.py` | Module | Create | 9 models: Producto, Proveedor, ProductoProveedor, Ubicacion, OrdenDeCompra, LineaOrden, MovimientoInventario, StockUbicacion, JornadaVenta, DetalleCierreJornada |
| `backend/apps/tienda/serializers.py` | Module | Create | Per-resource read serializers (admin + vendedor variants) and write serializers for each endpoint family |
| `backend/apps/tienda/views.py` | Module | Create | ~25 APIView classes covering EP-01 → EP-08 endpoints |
| `backend/apps/tienda/urls.py` | Module | Create | URL patterns under `app_name = "tienda"`, mounted at `/api/v1/tienda/` |
| `backend/apps/tienda/helpers.py` | Module | Create | Domain logic: `recalc_avg_cost`, `apply_movimiento_atomically`, `compute_resumen_cierre`, `execute_cierre_jornada`, `compute_lista_reabastecimiento`, `compute_alerta_caja` |
| `backend/apps/tienda/utils.py` | Module | Create | Generic helpers: `weighted_average`, `decimal_safe_div` |
| `backend/apps/tienda/permissions.py` | Module | Create | `IsTiendaAdmin`, `IsTiendaVendedor`, `IsTiendaAdminOrVendedor` |
| `backend/apps/tienda/signals.py` | Module | Create | post_save signal on `MovimientoInventario` is **not** used — atomicity is enforced via explicit transactional helpers (see §8.1). File created empty for consistency. |
| `backend/apps/tienda/throttles.py` | Module | Create | `TiendaWriteThrottle` for write-heavy endpoints (recepcionar, cerrar jornada) |
| `backend/apps/tienda/admin.py` | Module | Create | Django Admin registration for catalog + audit models (Spanish verbose names) |
| `backend/apps/tienda/migrations/0001_initial.py` | Migration | Create | Initial schema with all 10 tables + partial unique index + check constraints |
| `backend/apps/tienda/migrations/0002_seed_ubicaciones_and_groups.py` | Migration | Create | Data migration: seed `Ubicacion` rows + create `tienda_admin` / `tienda_vendedor` `auth.Group` rows and assign module permissions to them |
| `backend/apps/modules/models.py` | Module | Modify | Add two permissions: `access_tienda_admin`, `access_tienda_vendedor` (in addition to existing `access_tienda` which becomes the parent gate) |
| `backend/apps/modules/migrations/000X_…` | Migration | Create | Sync the new permissions on `AppModule._meta.permissions` |
| `backend/config/settings/base.py` | Module | Modify | Append `"apps.tienda"` to `INSTALLED_APPS`; add `TIENDA_UMBRAL_DISCREPANCIA_ORDEN = config("TIENDA_UMBRAL_DISCREPANCIA_ORDEN", default="0.05", cast=Decimal)` (BR-017) |
| `backend/hersa/urls.py` | Module | Modify | Add `path("api/v1/tienda/", include("apps.tienda.urls", namespace="tienda"))` |
| `backend/.env.example` | File | Modify | Add `TIENDA_UMBRAL_DISCREPANCIA_ORDEN=0.05` |
| `backend/apps/tienda/tests/` | Folder | Create | `test_models.py`, `test_helpers.py` (avg_cost, atomicity), `test_views_*.py` per epic, `factories.py` |
| `frontend/src/modules/tienda/` | Folder | Refactor | Replace placeholder `TiendaPage.tsx` with a router subtree; create `features/`, `shared/`, `constants/`, `index.ts` per UI spec §6.6 |
| `frontend/src/modules/tienda/constants/routes.ts` | Module | Create | Tienda-internal route constants (`/tienda/productos`, `/tienda/ordenes`, etc.) |
| `frontend/src/modules/tienda/constants/api.ts` | Module | Create | API path constants matching backend URL contract |
| `frontend/src/modules/tienda/shared/hooks/useTiendaRole.ts` | Hook | Create | Returns `{ isAdmin, isVendedor, role }` from `usePermissions` |
| `frontend/src/modules/tienda/shared/components/InlineRowForm/` | Component | Create | PATTERN-IMR-01 implementation (table + virtualization; mobile cards) |
| `frontend/src/modules/tienda/shared/components/RoleDifferentiatedScreen/` | Component | Create | Wrapper that conditionally renders admin vs vendedor variants |
| `frontend/src/modules/tienda/shared/components/RadioGroupLarge/` | Component | Create | Card-style radio per UI spec §6.4 |
| `frontend/src/modules/tienda/features/catalogo/` | Feature | Create | PROD-LIST, PROD-FORM, PROD-DETAIL, PROV-LIST, PROV-FORM screens + queries/mutations |
| `frontend/src/modules/tienda/features/compras/` | Feature | Create | ORDER-LIST, ORDER-CREATE, ORDER-DETAIL, ORDER-EDIT-INITIATED, ORDER-CLOSE-CONFIRM, RECEP-FORM |
| `frontend/src/modules/tienda/features/jornada/` | Feature | Create | VEND-HOME, JORNADA-OPEN, TRASLADO-APERTURA, TRASLADO-CONFIRM, REPOS-FORM, CIERRE-CONTEO, CIERRE-DINERO, CIERRE-RESUMEN, CIERRE-CONFIRM |
| `frontend/src/modules/tienda/features/reportes/` | Feature | Create | JORNADA-LIST, JORNADA-DETAIL-ADMIN, REPORTE-FIN-DIA, RESTOCK-LIST |
| `frontend/src/modules/tienda/features/ajustes/` | Feature | Create | AJUSTE-FORM, AJUSTE-LIST |
| `frontend/src/modules/tienda/features/stock/` | Feature | Create | STOCK-ADMIN, STOCK-VENDEDOR (same route, role-differentiated rendering) |
| `frontend/src/modules/tienda/pages/TiendaPage.tsx` | Page | Refactor | Replace `<ComingSoonState />` with nested `<Routes>` for the module subtree |
| `frontend/src/App.tsx` | Module | Modify | Change `<Route path={ROUTES.TIENDA}>` to `<Route path="/tienda/*">` to allow nested routing |
| `frontend/src/shared/constants/routes.ts` | Module | Modify | No change to the entry constant; nested routes live in module-local `constants/routes.ts` |
| `frontend/src/shared/components/Layout.tsx` | Component | Inspect / extend | Verify Layout supports both desktop sidebar (admin) and mobile bottom-tab-bar (vendedor) navigation; extend if missing |

---

## 3. Database design

All models live in `backend/apps/tienda/models.py`. Naming follows the functional spec (Spanish domain entities) per Hersa convention. PKs are `UUID4`, soft-delete is **not** applied to inventory records (audit trail is immutable). All `Meta` classes include Spanish `verbose_name` / `verbose_name_plural`.

### 3.1 Models

#### `Ubicacion`

```python
class Ubicacion(models.Model):
    TIPO_CENTRAL = "central"
    TIPO_POS = "pos"
    TIPO_CHOICES = [(TIPO_CENTRAL, "Almacén central"), (TIPO_POS, "Tienda")]

    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre: models.CharField = models.CharField(max_length=100, unique=True)
    tipo: models.CharField = models.CharField(max_length=10, choices=TIPO_CHOICES)

    class Meta:
        verbose_name = "Ubicación"
        verbose_name_plural = "Ubicaciones"

    def __str__(self) -> str:
        return f"{self.nombre} ({self.get_tipo_display()})"
```

#### `Producto`

```python
class Producto(models.Model):
    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre: models.CharField = models.CharField(max_length=200)
    descripcion: models.TextField = models.TextField(blank=True, default="")
    unidad: models.CharField = models.CharField(max_length=50)
    precio_venta: models.DecimalField = models.DecimalField(max_digits=10, decimal_places=2)
    avg_cost: models.DecimalField = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"), editable=False
    )
    punto_reorden: models.PositiveIntegerField = models.PositiveIntegerField()
    cantidad_sugerida_pedido: models.PositiveIntegerField = models.PositiveIntegerField()
    activo: models.BooleanField = models.BooleanField(default=True, db_index=True)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)
    proveedores: models.ManyToManyField = models.ManyToManyField(
        "Proveedor", through="ProductoProveedor", related_name="productos"
    )

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        constraints = [
            models.CheckConstraint(check=Q(precio_venta__gte=0), name="producto_precio_venta_gte_0"),
            models.CheckConstraint(check=Q(avg_cost__gte=0), name="producto_avg_cost_gte_0"),
        ]

    def __str__(self) -> str:
        return self.nombre
```

`avg_cost` is `editable=False` so the Django Admin UI matches the spec (read-only) and any mutation MUST go through `helpers.recalc_avg_cost()`. Serializers must drop the field from writable input independently (BR-001).

#### `Proveedor`

```python
class Proveedor(models.Model):
    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre: models.CharField = models.CharField(max_length=200)
    contacto: models.TextField = models.TextField(blank=True, default="")
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"

    def __str__(self) -> str:
        return self.nombre
```

#### `ProductoProveedor` (M2M through table)

```python
class ProductoProveedor(models.Model):
    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    producto: models.ForeignKey = models.ForeignKey("Producto", on_delete=models.CASCADE)
    proveedor: models.ForeignKey = models.ForeignKey("Proveedor", on_delete=models.PROTECT)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Asociación producto–proveedor"
        verbose_name_plural = "Asociaciones producto–proveedor"
        constraints = [
            models.UniqueConstraint(
                fields=["producto", "proveedor"], name="productoproveedor_unique"
            )
        ]
```

`on_delete=PROTECT` on `proveedor` lets the spec rule "no se puede eliminar un proveedor con órdenes activas" surface as `IntegrityError` mapped to HTTP 400 in the view layer.

#### `OrdenDeCompra`

```python
class OrdenDeCompra(models.Model):
    ESTADO_INICIADA = "iniciada"
    ESTADO_PENDIENTE = "pendiente"
    ESTADO_PARCIAL = "parcialmente_recibida"
    ESTADO_CERRADA = "cerrada"
    ESTADO_CHOICES = [
        (ESTADO_INICIADA, "Iniciada"),
        (ESTADO_PENDIENTE, "Pendiente"),
        (ESTADO_PARCIAL, "Parcialmente recibida"),
        (ESTADO_CERRADA, "Cerrada"),
    ]

    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proveedor: models.ForeignKey = models.ForeignKey(
        "Proveedor", on_delete=models.PROTECT, null=True, blank=True, related_name="ordenes"
    )  # nullable to support estado='iniciada' with no supplier yet
    fecha_pedido: models.DateField = models.DateField(null=True, blank=True, db_index=True)
    estado: models.CharField = models.CharField(
        max_length=30, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE, db_index=True
    )
    notas: models.TextField = models.TextField(blank=True, default="")
    justificacion_cierre: models.TextField = models.TextField(blank=True, default="")
    creado_por: models.ForeignKey = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="ordenes_creadas"
    )
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Orden de compra"
        verbose_name_plural = "Órdenes de compra"
        ordering = ["-created_at"]
```

`proveedor` is nullable to support the `iniciada` draft state coming from the restocking list (US-032). The `confirmar` transition validates `proveedor IS NOT NULL` plus all line completeness before promoting the row to `pendiente`.

#### `LineaOrden`

```python
class LineaOrden(models.Model):
    ESTADO_PENDIENTE = "pendiente"
    ESTADO_PARCIAL = "parcialmente_recibida"
    ESTADO_COMPLETA = "completa"
    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, "Pendiente"),
        (ESTADO_PARCIAL, "Parcialmente recibida"),
        (ESTADO_COMPLETA, "Completa"),
    ]

    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    orden_compra: models.ForeignKey = models.ForeignKey(
        OrdenDeCompra, on_delete=models.CASCADE, related_name="lineas"
    )
    producto: models.ForeignKey = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="lineas_orden"
    )
    cantidad_pedida: models.PositiveIntegerField = models.PositiveIntegerField(null=True, blank=True)
    cantidad_recibida_acumulada: models.PositiveIntegerField = models.PositiveIntegerField(default=0)
    costo_unitario_esperado: models.DecimalField = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    estado: models.CharField = models.CharField(
        max_length=30, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE
    )

    class Meta:
        verbose_name = "Línea de orden"
        verbose_name_plural = "Líneas de orden"
        constraints = [
            models.UniqueConstraint(
                fields=["orden_compra", "producto"], name="lineaorden_unique_per_orden"
            ),
        ]
```

`cantidad_pedida` and `costo_unitario_esperado` are nullable because lines created from the restocking list start blank (`iniciada` state per BR-025). Validation that they are populated runs in the `confirmar` transition serializer, not as DB constraints.

#### `MovimientoInventario`

```python
class MovimientoInventario(models.Model):
    TIPO_ENTRADA = "ENTRADA"
    TIPO_SALIDA = "SALIDA"
    TIPO_CHOICES = [(TIPO_ENTRADA, "Entrada"), (TIPO_SALIDA, "Salida")]

    CONCEPTO_COMPRA = "COMPRA"
    CONCEPTO_TRASLADO = "TRASLADO"
    CONCEPTO_VENTA = "VENTA"
    CONCEPTO_AVERIA = "AVERIA"
    CONCEPTO_AJUSTE = "AJUSTE"
    CONCEPTO_CHOICES = [
        (CONCEPTO_COMPRA, "Compra"),
        (CONCEPTO_TRASLADO, "Traslado"),
        (CONCEPTO_VENTA, "Venta"),
        (CONCEPTO_AVERIA, "Avería"),
        (CONCEPTO_AJUSTE, "Ajuste"),
    ]

    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    producto: models.ForeignKey = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="movimientos"
    )
    ubicacion: models.ForeignKey = models.ForeignKey(
        Ubicacion, on_delete=models.PROTECT, related_name="movimientos"
    )
    tipo: models.CharField = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cantidad: models.PositiveIntegerField = models.PositiveIntegerField()
    costo_unitario: models.DecimalField = models.DecimalField(max_digits=10, decimal_places=2)
    concepto: models.CharField = models.CharField(max_length=20, choices=CONCEPTO_CHOICES)
    nota: models.TextField = models.TextField(blank=True, default="")
    orden_compra: models.ForeignKey = models.ForeignKey(
        OrdenDeCompra, on_delete=models.PROTECT, null=True, blank=True, related_name="movimientos"
    )
    linea_orden: models.ForeignKey = models.ForeignKey(
        LineaOrden, on_delete=models.PROTECT, null=True, blank=True, related_name="movimientos"
    )
    jornada_venta: models.ForeignKey = models.ForeignKey(
        "JornadaVenta", on_delete=models.PROTECT, null=True, blank=True, related_name="movimientos"
    )
    movimiento_par: models.ForeignKey = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="par_inverso"
    )
    registrado_por: models.ForeignKey = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="movimientos_registrados"
    )
    fecha: models.DateTimeField = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Movimiento de inventario"
        verbose_name_plural = "Movimientos de inventario"
        ordering = ["-fecha"]
        constraints = [
            models.CheckConstraint(check=Q(cantidad__gt=0), name="movimiento_cantidad_gt_0"),
            models.CheckConstraint(check=Q(costo_unitario__gte=0), name="movimiento_costo_unitario_gte_0"),
        ]
        indexes = [
            models.Index(fields=["producto", "ubicacion"], name="mov_prod_ubic_idx"),
            models.Index(fields=["jornada_venta"], name="mov_jornada_idx"),
            models.Index(fields=["concepto", "tipo"], name="mov_concepto_tipo_idx"),
        ]
```

The `nota IS NOT NULL` requirement when `concepto = AJUSTE` (BR-015) is enforced at serializer level — DB CheckConstraint with conditional logic is avoided to keep the model portable. The pair-link between `movimiento_par` rows is set in a single `transaction.atomic()` block by `helpers.apply_traslado_atomic()`.

#### `StockUbicacion`

```python
class StockUbicacion(models.Model):
    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    producto: models.ForeignKey = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="stocks"
    )
    ubicacion: models.ForeignKey = models.ForeignKey(
        Ubicacion, on_delete=models.PROTECT, related_name="stocks"
    )
    cantidad_actual: models.DecimalField = models.DecimalField(
        max_digits=12, decimal_places=4, default=Decimal("0")
    )
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stock por ubicación"
        verbose_name_plural = "Stocks por ubicación"
        constraints = [
            models.UniqueConstraint(
                fields=["producto", "ubicacion"], name="stockubicacion_unique"
            ),
            models.CheckConstraint(
                check=Q(cantidad_actual__gte=0), name="stockubicacion_cantidad_gte_0"
            ),
        ]
```

This is the authoritative balance store (BR-014, BR-021). All read endpoints query this table. All write paths use `select_for_update()` on the matching row inside the same transaction as the `MovimientoInventario` insert.

#### `JornadaVenta`

```python
class JornadaVenta(models.Model):
    ESTADO_ABIERTA = "abierta"
    ESTADO_CERRADA = "cerrada"
    ESTADO_CHOICES = [(ESTADO_ABIERTA, "Abierta"), (ESTADO_CERRADA, "Cerrada")]

    ALERTA_OK = "ok"
    ALERTA_FALTANTE = "faltante"
    ALERTA_SOBRANTE = "sobrante"
    ALERTA_CHOICES = [
        (ALERTA_OK, "OK"),
        (ALERTA_FALTANTE, "Faltante"),
        (ALERTA_SOBRANTE, "Sobrante"),
    ]

    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fecha: models.DateField = models.DateField(db_index=True)
    ubicacion: models.ForeignKey = models.ForeignKey(
        Ubicacion, on_delete=models.PROTECT, related_name="jornadas",
        limit_choices_to={"tipo": Ubicacion.TIPO_POS},
    )
    vendedor: models.ForeignKey = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="jornadas_iniciadas"
    )
    estado: models.CharField = models.CharField(
        max_length=10, choices=ESTADO_CHOICES, default=ESTADO_ABIERTA
    )
    cerrado_por: models.ForeignKey = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, blank=True, related_name="jornadas_cerradas"
    )
    cerrada_at: models.DateTimeField = models.DateTimeField(null=True, blank=True)
    dinero_entrega: models.DecimalField = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    dinero_salida_monto: models.DecimalField = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    dinero_salida_descripcion: models.TextField = models.TextField(blank=True, default="")
    alerta_caja: models.CharField = models.CharField(
        max_length=10, choices=ALERTA_CHOICES, null=True, blank=True
    )
    revenue_total: models.DecimalField = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )  # snapshot at close, sum of DetalleCierreJornada.revenue
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Jornada de venta"
        verbose_name_plural = "Jornadas de venta"
        ordering = ["-fecha", "-created_at"]
        constraints = [
            # BR-008: only one open jornada per location (PostgreSQL partial unique index)
            models.UniqueConstraint(
                fields=["ubicacion"],
                condition=Q(estado="abierta"),
                name="jornadaventa_unique_abierta_por_ubicacion",
            ),
        ]
```

The `UniqueConstraint(condition=…)` translates into a PostgreSQL `CREATE UNIQUE INDEX … WHERE estado = 'abierta'` — exactly what BR-008 requires. `limit_choices_to` is a Django Admin convenience; the application-level validator (`validators.validate_ubicacion_es_pos`) duplicates this check at request time for API users.

#### `DetalleCierreJornada`

```python
class DetalleCierreJornada(models.Model):
    id: models.UUIDField = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    jornada_venta: models.ForeignKey = models.ForeignKey(
        JornadaVenta, on_delete=models.CASCADE, related_name="detalles_cierre"
    )
    producto: models.ForeignKey = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="detalles_cierre"
    )
    unidades_trasladadas: models.PositiveIntegerField = models.PositiveIntegerField()
    conteo_final: models.PositiveIntegerField = models.PositiveIntegerField()
    unidades_vendidas: models.IntegerField = models.IntegerField()  # may be negative if conteo > trasladado (UX warns admin)
    revenue: models.DecimalField = models.DecimalField(max_digits=12, decimal_places=2)
    cogs: models.DecimalField = models.DecimalField(max_digits=12, decimal_places=2)
    utilidad_bruta: models.DecimalField = models.DecimalField(max_digits=12, decimal_places=2)
    snapshot_costo_promedio_traslado: models.DecimalField = models.DecimalField(
        max_digits=10, decimal_places=2
    )
    stock_central_al_cierre: models.DecimalField = models.DecimalField(
        max_digits=12, decimal_places=4
    )

    class Meta:
        verbose_name = "Detalle de cierre de jornada"
        verbose_name_plural = "Detalles de cierre de jornada"
        constraints = [
            models.UniqueConstraint(
                fields=["jornada_venta", "producto"],
                name="detallecierre_unique_per_jornada_producto",
            ),
        ]
```

`unidades_vendidas` is allowed negative because the UX explicitly tolerates `conteo_final > unidades_trasladadas` and the admin investigates afterwards (no system block per UX spec §8.6). Persisted at close-time inside the same transaction as the retorno movements (BR-023).

### 3.2 Modifications to existing models

#### `apps/users/models.py — UserProfile`

**No changes.** Role assignment uses Django's native `auth.Group` (see §8.5). No new field is added to `UserProfile`.

#### `apps/modules/models.py — AppModule.permissions`

Append two new permission codenames so `usePermissions` on the frontend can route to admin-only screens:

```python
permissions = [
    ("access_tienda", "Puede acceder al módulo Tienda"),
    ("access_tienda_admin", "Puede acceder con rol administrador de Tienda"),
    ("access_tienda_vendedor", "Puede acceder con rol vendedor de Tienda"),
    ("access_programador", "Puede acceder al módulo Programador"),
    ("access_admin", "Puede acceder al módulo Admin"),
]
```

The two new permissions are assigned to the matching seed groups (`tienda_admin` and `tienda_vendedor`) inside the same data migration that creates the groups, so `usePermissions` on the frontend resolves correctly without any per-user permission grant.

#### Seed groups (`auth.Group`)

Two Django groups are created via a data migration in `apps/tienda/`:

```python
from django.contrib.auth.models import Group, Permission

def create_tienda_groups(apps, schema_editor):
    admin_group, _ = Group.objects.get_or_create(name="tienda_admin")
    vendedor_group, _ = Group.objects.get_or_create(name="tienda_vendedor")
    # Assign module-level access permissions
    admin_perm = Permission.objects.get(codename="access_tienda_admin")
    vendedor_perm = Permission.objects.get(codename="access_tienda_vendedor")
    parent_perm = Permission.objects.get(codename="access_tienda")
    admin_group.permissions.add(parent_perm, admin_perm)
    vendedor_group.permissions.add(parent_perm, vendedor_perm)
```

Idempotent via `get_or_create` so the migration is safe to re-run. Group membership is managed via the standard Django Admin user editor (built-in `groups` M2M widget).

### 3.3 Required migrations

- [ ] `apps/modules/000X_appmodule_tienda_role_permissions.py` — sync new permissions on `AppModule`.
- [ ] `apps/tienda/0001_initial.py` — create all 10 tables with their unique, check, and index constraints, including the partial unique index on `JornadaVenta(ubicacion) WHERE estado='abierta'`.
- [ ] `apps/tienda/0002_seed_ubicaciones_and_groups.py` — data migration that (a) inserts the two seed `Ubicacion` rows: `("CENTRAL", tipo="central")` and `("Tienda", tipo="pos")`; and (b) creates the two `auth.Group` rows `tienda_admin` and `tienda_vendedor` and assigns the matching `AppModule` permissions to them. Idempotent via `get_or_create`. Depends on the `apps/modules` migration above (declared via `dependencies = [...]`).

---

## 4. API design

Base prefix: `/api/v1/tienda/`. All endpoints require JWT authentication. Permission columns indicate role gating. Pagination is the project's `StandardResultsSetPagination` (page_size=20, max=100). Request/response bodies are JSON; the frontend axios interceptor handles `camelCase ↔ snake_case` conversion automatically.

### 4.1 EP-01 — Catálogo

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tienda/productos/` | admin or vendedor | List products. Vendedor receives only `activo=True` and the field set excludes `precio_venta`, `avg_cost`. Admin sees all + accepts `?activo=true/false`. Search via `?q=`. |
| POST | `/api/v1/tienda/productos/` | admin | Create product. Ignores `avg_cost` if sent (BR-001). |
| GET | `/api/v1/tienda/productos/{id}/` | admin or vendedor | Detail. Vendedor receives 404 if `activo=False`; field set stripped of monetary fields. |
| PATCH | `/api/v1/tienda/productos/{id}/` | admin | Edit any field except `avg_cost`. |
| GET | `/api/v1/tienda/proveedores/` | admin or vendedor | List suppliers. |
| POST | `/api/v1/tienda/proveedores/` | admin | Create supplier. |
| PATCH | `/api/v1/tienda/proveedores/{id}/` | admin | Edit supplier. |
| GET | `/api/v1/tienda/proveedores/{id}/` | admin | Detail with associated product count. |
| POST | `/api/v1/tienda/productos/{id}/proveedores/` | admin | Associate supplier (`{ "proveedor_id": "<uuid>" }`). 400 on duplicate. |
| DELETE | `/api/v1/tienda/productos/{id}/proveedores/{proveedor_id}/` | admin | Remove association. |

### 4.2 EP-02 — Órdenes de compra

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tienda/ordenes-compra/` | admin or vendedor | List orders. Filters: `?estado=`, `?proveedor_id=`. |
| POST | `/api/v1/tienda/ordenes-compra/` | admin | Create complete order with `lineas[]`; estado initial `pendiente`. |
| POST | `/api/v1/tienda/ordenes-compra/desde-reabastecimiento/` | admin | Create order in `iniciada` from `[{producto_id}]`. |
| GET | `/api/v1/tienda/ordenes-compra/{id}/` | admin or vendedor | Detail with `lineas[]` and `movimientos[]`. Monetary fields hidden for vendedor. |
| PATCH | `/api/v1/tienda/ordenes-compra/{id}/` | admin | Edit proveedor, notas, líneas. Only when `estado=iniciada`. |
| POST | `/api/v1/tienda/ordenes-compra/{id}/confirmar/` | admin | Transition `iniciada → pendiente`. Validates completeness (BR-025). |
| POST | `/api/v1/tienda/ordenes-compra/{id}/recepcionar/` | admin or vendedor | Register reception of one line. Atomic. Recalculates `avg_cost`. |
| POST | `/api/v1/tienda/ordenes-compra/{id}/cerrar/` | admin | Close order. Returns 422 with discrepancy detail if threshold exceeded and no `justificacion`. |

#### `POST /ordenes-compra/{id}/recepcionar/` request shape

```json
{
  "linea_orden_id": "<uuid>",
  "cantidad_recibida_buen_estado": 80,
  "cantidad_averiada": 0,
  "costo_unitario_real": 810.00,
  "destinos": [
    { "ubicacion_id": "<uuid>", "cantidad": 80 }
  ]
}
```

Sum of `destinos[].cantidad` must equal `cantidad_recibida_buen_estado` (validated in serializer). Generates 1..N `MovimientoInventario` ENTRADA per destino, plus 1 SALIDA(AVERIA) if `cantidad_averiada > 0` (US-008). Returns the new `avg_cost` and the line + order updated estados.

#### `POST /ordenes-compra/{id}/cerrar/` request/response

Request: `{ "justificacion": "..." | null }`. Response (200): `{ "estado": "cerrada", "discrepancias": [...] }`. Response (422 when threshold exceeded and no justificación): `{ "discrepancias": [{linea_id, producto_id, cantidad_pedida, cantidad_recibida, delta, delta_pct}], "umbral": 0.05, "justificacion_requerida": true }`. The frontend interprets 422 to open the ORDER-CLOSE-CONFIRM modal.

### 4.3 EP-03 / EP-04 — Jornada y reposición

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tienda/jornadas/` | admin or vendedor | List. Vendedor sees only their own jornadas; admin sees all with cash columns. |
| GET | `/api/v1/tienda/jornadas/abierta/` | admin or vendedor | Returns the currently open jornada for the caller's POS or 204 No Content. Used by VEND-HOME on every load. |
| POST | `/api/v1/tienda/jornadas/` | admin or vendedor | Create. Validates BR-008 (returns 409 on conflict) and BR-009 (returns 400 if ubicacion is `central`). |
| POST | `/api/v1/tienda/jornadas/{id}/traslado-apertura/` | admin or vendedor | Atomic bulk transfer. Body: `{ "productos": [{producto_id, cantidad}] }`. Returns 400 + offending products if any has insufficient CENTRAL stock (BR-016). |
| POST | `/api/v1/tienda/jornadas/{id}/reposicion/` | admin or vendedor | Single replenishment. Body: `{ producto_id, cantidad }`. |
| GET | `/api/v1/tienda/jornadas/{id}/` | admin or vendedor | Detail. Cash + revenue fields stripped for vendedor (BR-024, BR-027). |

### 4.4 EP-05 / EP-06 — Cierre y reporte

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tienda/jornadas/{id}/resumen-cierre/` | admin or vendedor | **Read-only computation.** Persists nothing. Body includes conteos + dinero fields. Returns per-product calculation; vendedor response strips `revenue_estimado`, `cogs_estimado`, `utilidad_bruta`. |
| POST | `/api/v1/tienda/jornadas/{id}/cerrar/` | admin or vendedor | **Atomic commit.** Persists DetalleCierreJornada rows + retorno movements + `cerrado_por` + `alerta_caja`. |
| GET | `/api/v1/tienda/jornadas/{id}/reporte/` | admin or vendedor | End-of-day report from `DetalleCierreJornada`. Monetary fields stripped for vendedor. Includes `lista_reabastecimiento`. |

The `/cerrar/` endpoint is idempotent against concurrent calls because the JornadaVenta row is locked with `select_for_update()`; a second concurrent call sees `estado='cerrada'` after the first commit and returns 400 ("La jornada ya está cerrada"). The two endpoints share the same request schema so the frontend can reuse the form payload between the resumen and the final cerrar call.

### 4.5 EP-07 — Stock

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tienda/stock/` | admin or vendedor | Stock for one product or all. Query: `?producto_id=&ubicacion_id=`. Vendedor variant strips `costo_unitario`. |
| GET | `/api/v1/tienda/stock/total/` | admin | Total system stock per product with breakdown. |
| GET | `/api/v1/tienda/stock/reabastecimiento/` | admin | Real-time restocking list (used by RESTOCK-LIST and Flow 8). |

### 4.6 EP-08 — Ajustes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tienda/ajustes/` | admin | Create AJUSTE movement (ENTRADA or SALIDA). Body: `{ producto_id, ubicacion_id, tipo, cantidad, costo_unitario, nota }`. `nota` mandatory non-empty (BR-015). |
| GET | `/api/v1/tienda/ajustes/` | admin | History. Filter: `?producto_id=`. |

### 4.7 Error contract

All endpoints follow the project's existing error envelope (see `.claude/shared/conventions/api-contract.md` and `error-handling.md`):

| HTTP | Use case |
|------|----------|
| 400 | Validation error, business rule violation with no separate semantic |
| 403 | Role gate rejected request |
| 404 | Resource not found OR vendedor accessing inactive product detail |
| 409 | Duplicate jornada open for same Tienda (BR-008) |
| 422 | OrdenDeCompra cierre with discrepancy lines and missing justificacion (separate from 400 because the frontend renders a confirmation modal, not field errors) |

---

## 5. Frontend design

The Tienda module is built as a self-contained subtree under `frontend/src/modules/tienda/`. The existing `<Route path={ROUTES.TIENDA}>` in `App.tsx` is upgraded to `<Route path="/tienda/*">` so the module page can mount its own `<Routes>`. All UI text is Spanish; type names, hook names, and identifiers stay English per project rule.

### 5.1 Component inventory

| Component | Type | Route or location | Description |
|-----------|------|-------------------|-------------|
| `TiendaPage` | Page (page-level routes) | `/tienda/*` | Mounts module-internal `<Routes>` and the role-aware layout (sidebar for admin, bottom-tab-bar for vendedor) |
| `TiendaSidebar` | Component | shared/components | Desktop nav for admin (Inventario, Catálogo, Compras, Jornadas) per UX spec §2 |
| `TiendaBottomTabBar` | Component | shared/components | Mobile nav for vendedor (Apertura, Reposición, Cierre, Stock) |
| `RoleDifferentiatedScreen` | Component | shared/components | Wrapper: `<RoleDifferentiatedScreen admin={<AdminVariant/>} vendedor={<VendedorVariant/>}/>` |
| `InlineRowForm` | Component | shared/components | PATTERN-IMR-01: react-hook-form `FormProvider` + `useFieldArray`; virtualized via `react-window` when rows > 20 |
| `RadioGroupLarge` | Component | shared/components | Card-styled radio (`AJUSTE-FORM`, `RECEP-FORM` destination) |
| `MonetaryInput` | Component | shared/components | TextField with `$` adornment; rendered only when `useTiendaRole().isAdmin` |
| `ReadOnlyBadge` | Component | shared/components | avg_cost display in Producto detail/form |
| `StatusChipTienda` | Component | shared/components | Local wrapper around MUI Chip with the status→color map of UI spec §2.2 |
| `ProductoListPage` | Page | `/tienda/productos` | PROD-LIST (admin only) |
| `ProductoFormPage` | Page | `/tienda/productos/nuevo`, `/tienda/productos/:id/editar` | PROD-FORM (admin only) |
| `ProductoDetailPage` | Page | `/tienda/productos/:id` | PROD-DETAIL with supplier panel (admin only) |
| `ProveedorListPage` | Page | `/tienda/proveedores` | PROV-LIST |
| `ProveedorFormPage` | Page | `/tienda/proveedores/nuevo`, `/tienda/proveedores/:id/editar` | PROV-FORM |
| `OrdenListPage` | Page | `/tienda/ordenes` | ORDER-LIST with status filter chips |
| `OrdenCreatePage` | Page | `/tienda/ordenes/nueva` | ORDER-CREATE |
| `OrdenEditInitiatedPage` | Page | `/tienda/ordenes/:id/editar` | ORDER-EDIT-INITIATED (only when `estado=iniciada`) |
| `OrdenDetailPage` | Page | `/tienda/ordenes/:id` | ORDER-DETAIL with reception history + close action |
| `RecepcionFormPage` | Page | `/tienda/ordenes/:id/recepcionar` | RECEP-FORM (PATTERN-IMR-01) |
| `OrdenCloseDialog` | Component | inside `OrdenDetailPage` | ORDER-CLOSE-CONFIRM dialog |
| `VendedorHomePage` | Page | `/tienda/vendedor` | VEND-HOME (vendedor only) |
| `JornadaOpenPage` | Page | `/tienda/jornadas/nueva` | Confirms creation of new jornada |
| `TrasladoAperturaPage` | Page | `/tienda/jornadas/:id/apertura` | TRASLADO-APERTURA (PATTERN-IMR-01) |
| `TrasladoConfirmPage` | Page | `/tienda/jornadas/:id/apertura/confirmar` | TRASLADO-CONFIRM |
| `ReposicionPage` | Page | `/tienda/reposicion` | REPOS-FORM |
| `CierreContoPage` | Page | `/tienda/jornadas/:id/cierre/conteo` | CIERRE-CONTEO (PATTERN-IMR-01) |
| `CierreDineroPage` | Page | `/tienda/jornadas/:id/cierre/dinero` | CIERRE-DINERO |
| `CierreResumenPage` | Page | `/tienda/jornadas/:id/cierre/resumen` | CIERRE-RESUMEN |
| `JornadaListPage` | Page | `/tienda/jornadas` | JORNADA-LIST (admin only — vendedor list filtered to own jornadas) |
| `JornadaDetailPage` | Page | `/tienda/jornadas/:id` | JORNADA-DETAIL-ADMIN with cash alert banner |
| `RestockListPage` | Page | `/tienda/reabastecimiento` | RESTOCK-LIST standalone |
| `AjusteFormPage` | Page | `/tienda/ajustes/nuevo` | AJUSTE-FORM (admin only) |
| `AjusteListPage` | Page | `/tienda/ajustes` | AJUSTE-LIST (admin only) |
| `StockPage` | Page | `/tienda/stock` | Same route, role-differentiated rendering: STOCK-ADMIN or STOCK-VENDEDOR |

### 5.2 State flow

- **Server state — React Query.** All API calls use one query/mutation file per endpoint per the project convention (`features/<feature>/api/get<Name>Query.ts`, `<method><Name>Mutation.ts`). Stale time: 30s default; jornada `abierta` lookup uses `staleTime: 0` (always refetch on VEND-HOME mount per UI spec §6.5). Query keys are namespaced: `["tienda", "productos", { activo }]`, `["tienda", "ordenes", { estado }]`, `["tienda", "jornadas", "abierta"]`, etc.
- **Form state — react-hook-form.** All forms use `useForm` + `Controller` per project convention. Validation schemas via `zod` (already present in the codebase ecosystem) co-located in each feature's `schemas.ts`.
- **Inline multi-row state — local within a single `FormProvider`.** PATTERN-IMR-01 is implemented with one `useFieldArray('lines')`. No row is its own form. Submit collects `getValues('lines')`, drops empty rows, dispatches the single API call.
- **Auth/role state — `usePermissions` + new `useTiendaRole`.** No Redux. The hook returns `{ isAdmin, isVendedor }` derived from `permissions.includes('modules.access_tienda_admin' | 'access_tienda_vendedor')`.
- **Draft persistence — localStorage.** CIERRE-CONTEO + CIERRE-DINERO drafts are persisted under key `tienda:cierre_draft:${jornadaId}` while the user navigates between steps. Cleared on successful close OR explicit cancellation. No other form persists drafts.
- **Redux — not used.** No new Redux slice is added; nothing in this module needs cross-route global state outside React Query's cache and the existing `AuthContext`.

### 5.3 Role-conditional rendering

Per UI spec §4.4 and BR-027, monetary fields and tables are conditionally rendered, **never** CSS-hidden:

```tsx
const { isAdmin } = useTiendaRole();
// ...
{isAdmin && <TableCell align="right">{formatCurrency(row.precio_venta)}</TableCell>}
{isAdmin && <MonetaryInput name="precio_venta" />}
```

The same rule is enforced server-side via differentiated serializers (admin variant includes monetary fields, vendedor variant omits them). The frontend therefore never receives the data it should not render.

### 5.4 PATTERN-IMR-01 implementation notes

- Single `<FormProvider>` per screen.
- Desktop layout: `<Table>` + `<TableBody>` of editable rows; mobile layout: stacked `<Paper>` cards.
- Virtualization (`react-window` `FixedSizeList`) kicks in only when `lines.length > 20`. Row state stays in `useFieldArray`; rows pass `Controller` via context. Mobile path skips virtualization (bounded product count).
- Disabled rows (already-fully-received) render fields with `disabled` prop, not a separate component.
- Progress indicator: derived from `lines.filter(predicate).length` over total non-disabled lines. Position sticky above StickyFooterAction.

---

## 6. Security

### 6.1 Permissions per endpoint

| Endpoint group | `IsTiendaAdmin` | `IsTiendaVendedor` | Notes |
|----------------|-----------------|--------------------|-------|
| GET catalogo (productos, proveedores) | ✓ | ✓ | Vendedor sees stripped fields and only `activo=True` (BR-020, BR-027, BR-028) |
| Write catalogo | ✓ | ✗ | 403 for vendedor |
| GET ordenes | ✓ | ✓ | Vendedor sees orders with monetary fields stripped |
| Write ordenes (create/edit/confirmar/cerrar) | ✓ | ✗ | 403 for vendedor |
| Recepcionar mercancía | ✓ | ✓ | Both roles can post; vendedor input has different label per UI spec but same payload |
| Crear jornada / traslado-apertura / reposicion | ✓ | ✓ | Both roles can execute |
| resumen-cierre / cerrar | ✓ | ✓ | Both roles can execute; response shape differs by role |
| GET jornada detail / reporte | ✓ | ✓ | Vendedor's own jornadas only; monetary fields stripped |
| GET stock | ✓ | ✓ | Vendedor receives stripped serializer |
| GET stock/total · stock/reabastecimiento | ✓ | ✗ | 403 for vendedor |
| Ajustes (POST/GET) | ✓ | ✗ | 403 for vendedor (BR-015) |

Permission classes live in `apps/tienda/permissions.py` and check Django Group membership directly:

```python
from rest_framework.permissions import BasePermission

GROUP_TIENDA_ADMIN = "tienda_admin"
GROUP_TIENDA_VENDEDOR = "tienda_vendedor"


class IsTiendaAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name=GROUP_TIENDA_ADMIN).exists()
        )


class IsTiendaVendedor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name=GROUP_TIENDA_VENDEDOR).exists()
        )


class IsTiendaAdminOrVendedor(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.groups.filter(
            name__in=[GROUP_TIENDA_ADMIN, GROUP_TIENDA_VENDEDOR]
        ).exists()
```

The view layer composes these with `permission_classes = [IsAuthenticated, IsTiendaAdmin]` etc. Object-level checks (vendedor accessing only their own jornadas) live in the view's `get_queryset()` filter (`vendedor=request.user`) rather than `has_object_permission`. The `request.user.groups` queryset is cached by Django for the duration of the request, so multiple permission classes/serializers in the same request resolve to a single underlying query.

### 6.2 Critical input validations

| Validation | Where | Behavior |
|------------|-------|----------|
| `cantidad > 0` on every MovimientoInventario | Serializer + DB CheckConstraint | 400 if zero or negative |
| `costo_unitario_real` mandatory when `(cantidad_recibida_buen_estado + cantidad_averiada) > 0` | RecepcionarSerializer.validate | 400 with field message |
| `nota` non-empty when `concepto=AJUSTE` | AjusteSerializer.validate | 400 (BR-015) |
| `dinero_salida_descripcion` mandatory when `dinero_salida_monto > 0` | CerrarJornadaSerializer.validate | 400 |
| Sum of `destinos[].cantidad == cantidad_recibida_buen_estado` | RecepcionarSerializer.validate | 400 |
| `ubicacion.tipo == "pos"` when creating JornadaVenta | CrearJornadaSerializer.validate_ubicacion | 400 (BR-009) |
| No other `JornadaVenta` open for same ubicacion | DB partial unique index + serializer pre-check | 409 (BR-008) |
| Producto `activo=True` for vendedor flows | RecepcionarSerializer / TrasladoAperturaSerializer / ReposicionSerializer | 400 (BR-020, BR-028) |
| `StockUbicacion.cantidad_actual >= cantidad_solicitada` for SALIDA | helpers.apply_movimiento_atomically inside `select_for_update` | 400 (BR-022) |
| `costo_unitario_esperado IS NOT NULL` and `cantidad_pedida > 0` on every line when confirmar | ConfirmarOrdenSerializer | 400 (BR-025) |
| `justificacion` non-empty when delta > umbral on cierre orden | CerrarOrdenView | 422 (BR-007, BR-017) |

### 6.3 Sensitive data handling

- **Monetary fields are role-gated at serializer level**, not just at view level. Two serializers per resource (`ProductoAdminSerializer` vs `ProductoVendedorSerializer`) selected by `view.get_serializer_class()` based on the caller's Django Group membership (`request.user.groups.filter(name='tienda_admin').exists()`). This is the binding enforcement of BR-027 — a permission misconfiguration cannot leak `precio_venta` or `avg_cost` to vendedor responses.
- **No PII outside auth.** The module deals with inventory, money, and supplier contact strings only — supplier `contacto` is a free-text field treated like any other CharField (no extra encryption).
- **Audit trail.** Every `MovimientoInventario` row records `registrado_por` (FK to User). Every `OrdenDeCompra` records `creado_por`. Every `JornadaVenta` close records `cerrado_por`. None of these fields are mutable post-write — `update()` views explicitly drop them from `serializer.fields`.
- **Cash discrepancy.** The `alerta_caja` value is read-only output computed by the system at close (BR-024). Vendedor never sees `revenue_total`, `dinero_entrega`, `dinero_salida_*`, nor `alerta_caja` — guaranteed by the dedicated `JornadaVendedorSerializer`.
- **Throttling.** `TiendaWriteThrottle` applied to `recepcionar`, `cerrar` (both orden and jornada), `ajustes` POST — rate-limit `60/minute` per user, separate from the global `user` scope. Configured in `apps/tienda/throttles.py` and registered in `REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]` of `base.py`.

---

## 7. Implementation plan

Strict execution order. Each step assumes the previous has merged and tests pass.

1. **`django-developer` → app skeleton + models + migrations + admin + permissions (EP-01 + EP-07 base)**
   Create `apps/tienda/` skeleton: `models.py`, `serializers.py`, `views.py`, `urls.py`, `helpers.py`, `utils.py`, `permissions.py`, `signals.py` (empty), `throttles.py`, `admin.py`, `tests/`. Declare all 10 models; generate `0001_initial` migration with constraints (partial unique index on JornadaVenta, check constraints on cantidad/costo, unique constraints on ProductoProveedor and StockUbicacion); add Spanish verbose_names and `__str__`; register Django Admin. Write `apps/modules/000X_appmodule_tienda_role_permissions` to sync the three module permissions (`access_tienda`, `access_tienda_admin`, `access_tienda_vendedor`) on `AppModule`. Create the data migration `apps/tienda/0002_seed_ubicaciones_and_groups.py` that (a) inserts the two `Ubicacion` seed rows via `get_or_create`, and (b) creates the two `auth.Group` rows `tienda_admin` and `tienda_vendedor` and assigns the matching `AppModule` permissions to each group. Declare `dependencies` on the `apps/modules` migration so the permissions exist before the groups are wired. Implement `apps/tienda/permissions.py` with `IsTiendaAdmin`, `IsTiendaVendedor`, and `IsTiendaAdminOrVendedor`, all reading from `request.user.groups`. Update `INSTALLED_APPS` and `hersa/urls.py`. **No changes to `apps/users/models.py`.**

2. **`django-developer` → helpers (atomic writes, avg_cost, retorno)**
   Implement `apps/tienda/helpers.py`:
   - `apply_movimiento_atomically(producto, ubicacion, tipo, cantidad, costo_unitario, concepto, **fk_kwargs)` — single source of truth that opens `transaction.atomic()`, locks the matching `StockUbicacion` row with `select_for_update()`, validates non-negative result, persists `MovimientoInventario`, updates `StockUbicacion`, recalculates `avg_cost` if `(tipo=ENTRADA AND concepto in (COMPRA, AJUSTE))`.
   - `apply_traslado_atomic(producto, origen, destino, cantidad, jornada=None)` — pair generator that fixes `costo_unitario` via `avg_cost` snapshot (BR-003) and links both rows by `movimiento_par`.
   - `recalc_avg_cost(producto, qty_nueva, costo_unitario_real)` — pure helper using BR-001 formula on system-wide stock total.
   - `compute_resumen_cierre(jornada, conteos)` — read-only computation; returns per-product dict.
   - `execute_cierre_jornada(jornada, conteos, dinero_entrega, dinero_salida_*, cerrado_por)` — atomic transaction: persist DetalleCierreJornada rows, generate retorno pairs (BR-012), set `cerrado_por`, `cerrada_at`, `revenue_total`, `alerta_caja`, change `estado`.
   - `compute_lista_reabastecimiento()` — reads StockUbicacion CENTRAL ≤ punto_reorden, joins LineaOrden where orden.estado in (iniciada, pendiente, parcialmente_recibida) for `unidades_en_ordenes_activas` and `unidades_en_recepcion`.
   - `compute_alerta_caja(revenue_total, dinero_entrega, dinero_salida_monto)` — pure function returning one of `OK / FALTANTE / SOBRANTE`.
   No view code in this step.

3. **`django-developer` → serializers**
   Two serializer variants per role-sensitive resource (`ProductoAdminSerializer`, `ProductoVendedorSerializer`, `JornadaAdminSerializer`, `JornadaVendedorSerializer`, `DetalleCierreAdminSerializer`, `DetalleCierreVendedorSerializer`, `ResumenCierreAdminSerializer`, `ResumenCierreVendedorSerializer`, `StockAdminSerializer`, `StockVendedorSerializer`, `OrdenDetalleAdminSerializer`, `OrdenDetalleVendedorSerializer`). Single shared write serializers (`CrearOrdenSerializer`, `RecepcionarSerializer`, `ConfirmarOrdenSerializer`, `CerrarOrdenSerializer`, `TrasladoAperturaSerializer`, `ReposicionSerializer`, `CrearJornadaSerializer`, `CerrarJornadaSerializer`, `AjusteSerializer`). Each `validate_*` method enforces the rules listed in §6.2.

4. **`django-developer` → views (EP-01 + EP-07)**
   Implement read endpoints for catalogo, proveedores, stock, stock/total, stock/reabastecimiento. CBV-style APIView per the project convention. `get_serializer_class()` returns admin or vendedor variant by role. `get_queryset()` adds the `activo=True` filter for vendedor (BR-020).

5. **`django-developer` → views (EP-02)**
   Implement orden endpoints: list, create, desde-reabastecimiento, detail, edit, confirmar, recepcionar, cerrar. The `recepcionar` view orchestrates `helpers.apply_movimiento_atomically` for one ENTRADA per destination plus optional AVERIA SALIDA. The `cerrar` view returns 422 with discrepancy detail + `umbral` when justificacion is missing.

6. **`django-developer` → views (EP-03 + EP-04)**
   Implement jornada endpoints: list, abierta lookup, create, traslado-apertura (calls `helpers.apply_traslado_atomic` in a single `transaction.atomic` block iterating products; rolls back if any insufficient stock per BR-016), reposicion, detail.

7. **`django-developer` → views (EP-05 + EP-06)**
   Implement resumen-cierre (read-only), cerrar (atomic — calls `helpers.execute_cierre_jornada`), reporte (reads from `DetalleCierreJornada`).

8. **`django-developer` → views (EP-08) + URL wiring**
   Implement ajustes POST/GET. Wire all URL patterns in `apps/tienda/urls.py` with `app_name = "tienda"`. Verify the schema generation under `/api/schema/` matches the API design table.

9. **`test-writer` → backend tests (per epic)**
   For each epic, generate tests in `apps/tienda/tests/`:
   - `test_models.py` — unique constraints, partial unique index on JornadaVenta, check constraints.
   - `test_helpers_avg_cost.py` — `recalc_avg_cost` table-driven cases (BR-001/BR-002).
   - `test_helpers_traslado.py` — pair atomicity, snapshot capture (BR-003, BR-005).
   - `test_helpers_cierre.py` — full close flow with retorno + DetalleCierreJornada + alerta_caja branches.
   - `test_views_catalogo.py` — role-stripped serializer output for vendedor; admin filter `?activo=`.
   - `test_views_ordenes.py` — full state machine including `iniciada → pendiente → parcialmente_recibida → cerrada` and the 422 discrepancy path.
   - `test_views_jornada.py` — 409 on duplicate open jornada; 400 on central ubicacion; bulk transfer rollback when any product short.
   - `test_views_cierre.py` — vendedor response shape excludes monetary; admin response includes alerta_caja.
   - `test_views_stock.py` — vendedor cannot reach `/stock/total/` or `/stock/reabastecimiento/`.
   - `test_views_ajustes.py` — vendedor 403; nota mandatory; avg_cost recalc on ENTRADA, untouched on SALIDA.
   Use `factory_boy` factories in `apps/tienda/tests/factories.py`. All tests use `pytest` and `parameterized` per project convention.

10. **`security-auditor` → backend security review**
    Review: BR-027 enforcement at serializer level for every endpoint (no leakage path exists); permission classes are explicit on every APIView and resolve via `request.user.groups`; no `IsAuthenticated`-only on monetary endpoints; throttles are configured for write endpoints; all retorno + cierre paths are inside a single `transaction.atomic()`; partial unique index is created in migration; the seed data migration (Ubicaciones + Groups + permission assignments) is idempotent and re-runnable. Confirm no secrets are hardcoded — `TIENDA_UMBRAL_DISCREPANCIA_ORDEN` flows through `decouple.config`.

11. **`react-developer` → frontend foundation**
    Refactor `frontend/src/modules/tienda/`: nested router, role-aware layout (sidebar vs bottom-tab-bar), `useTiendaRole`, `RoleDifferentiatedScreen`, `MonetaryInput`, `ReadOnlyBadge`, `StatusChipTienda`, `RadioGroupLarge`, `InlineRowForm` (with `react-window` integration). Update `App.tsx` route to `/tienda/*`. Add `prefers-reduced-motion` global CSS to `index.css` if not already present. Add the MUI theme overrides listed in UI spec §6.2 to `frontend/src/shared/styles/theme.ts`.

12. **`react-developer` → frontend feature: catalogo**
    Implement PROD-LIST, PROD-FORM, PROD-DETAIL, PROV-LIST, PROV-FORM with React Query queries/mutations per project naming convention (`getProductosQuery.ts`, `createProductoMutation.ts`, etc.). All forms use RHF + `Controller`. Each component file has its co-located `.module.scss`.

13. **`react-developer` → frontend feature: compras**
    Implement ORDER-LIST, ORDER-CREATE, ORDER-DETAIL, ORDER-EDIT-INITIATED, ORDER-CLOSE-CONFIRM dialog, RECEP-FORM (PATTERN-IMR-01).

14. **`react-developer` → frontend feature: jornada**
    Implement VEND-HOME, JORNADA-OPEN, TRASLADO-APERTURA (PATTERN-IMR-01), TRASLADO-CONFIRM, REPOS-FORM, CIERRE-CONTEO (PATTERN-IMR-01), CIERRE-DINERO, CIERRE-RESUMEN. Wire localStorage draft persistence with key `tienda:cierre_draft:${jornadaId}`.

15. **`react-developer` → frontend features: reportes, ajustes, stock**
    Implement JORNADA-LIST, JORNADA-DETAIL-ADMIN, RESTOCK-LIST, AJUSTE-FORM, AJUSTE-LIST, STOCK-ADMIN/STOCK-VENDEDOR (one route, role-conditional).

16. **`test-writer` → frontend tests**
    React Testing Library + `renderWithProviders`. Cover: role-conditional rendering (monetary fields absent from vendedor render tree); IMR-01 single-confirm submission; localStorage persistence on cierre; the discrepancy modal flow; `useTiendaRole` hook contract.

17. **`security-auditor` → end-to-end review**
    Manual penetration test: as a vendedor user, attempt every admin-only endpoint and confirm 403; confirm no monetary fields appear in any GET response with vendedor JWT; confirm the partial unique index actually blocks a second open jornada in concurrent transactions; confirm the cierre transaction is atomic by simulating a mid-flight failure (DB exception thrown after first DetalleCierreJornada insert).

---

## 8. Technical decisions

The user-supplied "Decisiones de arquitectura ya tomadas" are accepted as-is and not re-debated; this section documents only the additional decisions taken in this TDD.

### 8.1 No post_save signal for StockUbicacion update

**Chosen:** Update `StockUbicacion` via the explicit transactional helper `apply_movimiento_atomically()`. **Rejected:** A `post_save` signal on `MovimientoInventario` that increments/decrements `StockUbicacion`. **Why:** The signal pattern obscures atomicity (the signal handler runs in the same transaction but is invisible at the call site), makes `select_for_update()` impossible to coordinate cleanly (the signal cannot lock before the parent has decided to insert), and is harder to test in isolation. The helper is one explicit unit-tested function; every write path in the module funnels through it. No reasonable alternative exists once we commit to row-level locking. *Not flagged for ADR — the trade-off is operational, not architectural.*

### 8.2 422 (not 400) for OrdenDeCompra cierre with discrepancy and missing justificacion

**Chosen:** Return HTTP 422 with `{ discrepancias, umbral, justificacion_requerida: true }`. **Rejected:** Return 400 with a generic field-level error. **Why:** The frontend renders an entirely different surface (a confirmation modal) when discrepancy is detected vs a normal validation error. Using a distinct status code lets the React Query mutation `onError` handler branch on `error.response.status === 422` without parsing the error body shape. 422 is also semantically correct: the request is well-formed but refuses to be processed without additional input. *Not flagged for ADR — local API decision.*

### 8.3 Two serializers per role-sensitive resource (not one with conditional fields)

**Chosen:** `ProductoAdminSerializer` and `ProductoVendedorSerializer` (similar pairs for Jornada, DetalleCierre, Stock, OrdenDetalle, ResumenCierre). **Rejected:** A single serializer that drops fields in `to_representation()` based on `context["request"].user.profile.rol_tienda`. **Why:** BR-027 is the most security-critical rule in the module. A single conditional serializer is one bug away from leaking a field — the field is *defined*, just (sometimes) hidden. The two-serializer pattern makes the vendedor field set declarative (it physically does not exist in the class), which is far more auditable. The cost is duplication of ~5 fields per resource. *Not flagged for ADR — well-known pattern with clear security justification.*

### 8.4 `revenue_total` denormalized onto `JornadaVenta` at close time

**Chosen:** Persist `JornadaVenta.revenue_total = SUM(DetalleCierreJornada.revenue)` at close time. **Rejected:** Recompute it on every read. **Why:** `alerta_caja` depends on `revenue_total`, and the value participates in admin-facing UI on every JORNADA-LIST and JORNADA-DETAIL render. Recomputing per request triggers a join + aggregate against `DetalleCierreJornada`. Persisting the snapshot is consistent with the user-supplied decision to store close results in `DetalleCierreJornada` ("reportes históricos sin recalcular"). *Not flagged for ADR — extends a decision already taken.*

### 8.5 Role assignment uses Django Groups (native auth)

**Chosen:** Use Django's native `auth.Group` model to represent the two operational roles. Two groups are created via a seed data migration in `apps/tienda/`: `tienda_admin` and `tienda_vendedor`. Permission classes (`IsTiendaAdmin`, `IsTiendaVendedor`) check membership via `request.user.groups.filter(name='tienda_admin').exists()`. The two `access_tienda_admin` / `access_tienda_vendedor` Django permissions on `AppModule` are assigned to the respective groups so the existing frontend `usePermissions` flow keeps working unchanged. **Rejected:** Add a dedicated `rol_tienda` CharField to `apps/users/UserProfile` with the two role choices. **Why:**

- Django Groups is the framework-native primitive for role-based access; reusing it avoids introducing a parallel role registry.
- No new column on `UserProfile` is required, so no schema migration on an existing table.
- A user can belong to multiple groups simultaneously (admin + vendedor in dev, multi-role staff in production) without changing the data model. A single CharField forces one role per user.
- Native integration with Django Admin: assigning a user to a group is a built-in inline widget, no custom form work.
- Future operational roles (e.g. `tienda_supervisor`) require only inserting a new group row, not a data migration to extend the choices field and backfill existing users.
- The performance gap versus a CharField is negligible: `request.user.groups.all()` is cached on the user instance for the duration of the request and resolves to a single indexed query at most once per request.

> Ver: `ADR-001-use-django-groups-for-tienda-roles.md`

### 8.6 No automatic order splitting by supplier

**Chosen:** A multi-supplier selection in RESTOCK-LIST creates a single `iniciada` order with no proveedor; the admin manually splits later. **Rejected:** Auto-create N orders, one per supplier, on generation. **Why:** Spec §10.7 explicitly says auto-splitting is out of v1 scope (OBS-05). The UI shows a post-generation warning. *Not flagged for ADR — explicit deferral to v2 documented in PM doc.*

### 8.7 No optimistic UI updates for inventory mutations

**Chosen:** All inventory write mutations (recepcionar, traslado-apertura, reposicion, cerrar) wait for server confirmation; no optimistic cache updates. **Rejected:** React Query optimistic updates on the `["tienda","stock"]` cache. **Why:** UI spec §6.5: inventory operations are too consequential. A failed atomic operation that already updated the optimistic cache would create an inconsistent UI. The existing offline-mutation dialog covers the network-error UX. *Not flagged for ADR — local UX decision.*

---

## 9. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Race condition opens two jornadas simultaneously for same Tienda | Low | High | Partial unique index at DB level (BR-008) + serializer pre-check + `select_for_update()` on Ubicacion row inside transaction |
| `select_for_update()` deadlocks during high-volume bulk transfer | Low | Medium | Lock StockUbicacion rows in deterministic order (sorted by `producto_id`) inside `apply_traslado_atomic` |
| Vendedor leaks monetary data via a forgotten endpoint | Medium | High | Two-serializer pattern (§8.3); `security-auditor` end-to-end pen-test as Step 17 of the implementation plan |
| Admin attempting to deactivate a product mid-jornada with that product transferred breaks operations | Medium | Medium | UI confirmation dialog (UX spec §3.7); BR-020 only excludes inactive from *future* lookups; existing movements remain valid |
| `react-window` virtualization breaks `react-hook-form` row state when scrolling rapidly | Medium | Medium | Use `Controller` with external `control` passed via context; never unmount RHF state on scroll. Prototype `InlineRowForm` first with 50+ rows before plumbing it into the three real screens |
| Decimal precision drift in `avg_cost` after many recalcs | Low | Medium | All arithmetic in Python `Decimal`; rounding only at serialization (`quantize(Decimal("0.01"))`); unit tests with explicit edge cases |
| `cierre` transaction grows large enough (many products) to time out | Low | Medium | Iterate products inside one `transaction.atomic`; keep operations inside the loop minimal (DB writes only); add monitoring on transaction duration |
| Cash discrepancy alert misinterpreted because vendedor reports drift from revenue (no expected total shown) | High | Low | UX-resolved: alerta is informational only; admin follow-up is out-of-system (OBS-01) |
| LocalStorage cierre draft survives across users on shared device | Medium | Low | Key includes `jornadaId` (UUID4); on logout, clear all `tienda:*` keys |
| Existing `access_tienda` permission semantics shift | Low | Low | Keep `access_tienda` as the parent gate (already wired in frontend `App.tsx`); add the two new `access_tienda_admin` / `access_tienda_vendedor` permissions on top, granted in addition to the parent |

---

## 10. Estimation

Story points scale: 1 = trivial (≤2h), 2 = small (half day), 3 = medium (1 day), 5 = a day or two, 8 = 2–3 days, 13 = a sprint goal.

| Area | Story points | Notes |
|------|-------------|-------|
| Backend models + migrations + admin | 5 | 10 models, partial unique index, seed data migration (Ubicaciones + Groups), AppModule permission changes, `permissions.py` |
| Backend helpers (avg_cost, traslado, cierre, reabastecimiento) | 8 | Atomic correctness, decimal arithmetic, unit-test heavy |
| Backend serializers (admin/vendedor variants) | 5 | 6 paired serializers + 9 write serializers |
| Backend views EP-01, EP-07 | 3 | CRUD + read endpoints |
| Backend views EP-02 | 8 | State machine, recepcionar, cerrar with 422 path |
| Backend views EP-03, EP-04 | 5 | Atomic bulk transfer, jornada lifecycle |
| Backend views EP-05, EP-06 | 8 | Resumen + cerrar transaction + reporte |
| Backend views EP-08 + URL wiring | 3 | Ajustes + final URL contract |
| Backend tests | 13 | Per epic, parameterized, factory_boy |
| Frontend foundation (router, role hook, IMR-01, theme overrides) | 8 | InlineRowForm with virtualization is the critical-path item |
| Frontend feature: catalogo | 5 | 5 screens, 5 RQ files, role-conditional rendering |
| Frontend feature: compras | 13 | RECEP-FORM (IMR-01), close dialog with 422 branch, full state machine UI |
| Frontend feature: jornada | 13 | 3 IMR-01 screens, localStorage drafts, mobile-first vendedor flow |
| Frontend features: reportes, ajustes, stock | 8 | Reports table, restock list, adjustment form, role-conditional stock |
| Frontend tests | 8 | Role rendering, IMR-01 submission, localStorage persistence |
| Security audit + penetration test | 3 | Final gate before merge |
| **Total** | **118** | ~5–6 sprints of focused work for one full-stack pair |

---

*End of TDD-001 — Módulo Tienda.*


