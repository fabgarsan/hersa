# UX Specification — Módulo Tienda
**Version:** 1.2
**Date:** 2026-05-04
**Prepared by:** ux-designer
**Source spec:** `documentation/requirements/tienda-especificaciones-funcionales.md` v1.1
**Source process:** `documentation/requirements/tienda-proceso-operativo-to-be.md` v1.1
**Source PM:** `documentation/requirements/pm/tienda-pm-document.md` v1.1

---

## Table of Contents

1. [Context and Role Mapping](#1-context-and-role-mapping)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Flow 1 — Product and Supplier Management (Admin)](#3-flow-1--product-and-supplier-management-admin)
4. [Flow 2 — Purchase Order Creation and Management (Admin)](#4-flow-2--purchase-order-creation-and-management-admin)
5. [Flow 3 — Merchandise Reception (Admin / Vendedor)](#5-flow-3--merchandise-reception-admin--vendedor)
6. [Flow 4 — Jornada Opening: Bulk Transfer to POS (Vendedor)](#6-flow-4--jornada-opening-bulk-transfer-to-pos-vendedor)
7. [Flow 5 — Mid-Day Replenishment (Admin / Vendedor)](#7-flow-5--mid-day-replenishment-admin--vendedor)
8. [Flow 6 — Jornada Closing: Physical Count and Cash Register (Vendedor)](#8-flow-6--jornada-closing-physical-count-and-cash-register-vendedor)
9. [Flow 7 — Admin Review of Jornada Close (Admin)](#9-flow-7--admin-review-of-jornada-close-admin)
10. [Flow 8 — Restocking List and Order Initiation (Admin)](#10-flow-8--restocking-list-and-order-initiation-admin)
11. [Flow 9 — Manual Inventory Adjustment (Admin)](#11-flow-9--manual-inventory-adjustment-admin)
12. [Flow 10 — Stock Query by Location (Admin / Vendedor)](#12-flow-10--stock-query-by-location-admin--vendedor)
13. [Global Screen States Reference](#13-global-screen-states-reference)
14. [Design Patterns](#14-design-patterns)
15. [UX Observations for Systems Analyst](#15-ux-observations-for-systems-analyst)

---

## 1. Context and Role Mapping

### Two Distinct Users

**Administrador (`tienda_admin`)**
- Device: desktop browser
- Technical profile: administratively literate; not necessarily technical
- Goal: control over inventory accuracy, purchases, costs, and daily settlement review
- Visibility: full — sees all monetary values (prices, costs, revenue, COGS, margin, cash alerts)
- Key frustration today: no consolidated restocking view; purchase orders created one-by-one per product; no cash discrepancy alert; no review screen before inventory moves are committed

**Vendedor (`tienda_vendedor`)**
- Device: mobile or tablet at the point of sale (Tienda), standing or walking
- Technical profile: variable; may not be comfortable with complex forms
- Goal: open the day quickly, sell, close the day without errors
- Visibility: quantities only — never sees monetary values in any context
- Key frustration today: opening the shift requires registering each product individually; no review screen before closing commits irreversible inventory moves

### The Invisibility Rule (BR-027)

This rule is the single most important UX constraint in the entire module. It is transversal and must be enforced visually at every screen:

> The vendedor sees ONLY quantities. No prices, no costs, no revenue, no COGS, no margins, no cash amounts appear in any screen, label, placeholder, or summary the vendedor can access.

Every screen wireframe in this document marks vendedor-visible fields explicitly. When the admin and vendedor share a screen, the wireframe defines two variants: one for each role.

---

## 2. Navigation Architecture

### Admin Navigation (Desktop Sidebar)

```
Tienda
  ├── Inventario
  │   ├── Stock actual               [/tienda/stock]
  │   └── Ajustes                    [/tienda/ajustes]
  ├── Catálogo
  │   ├── Productos                  [/tienda/productos]
  │   └── Proveedores                [/tienda/proveedores]
  ├── Compras
  │   └── Órdenes de compra          [/tienda/ordenes]
  └── Jornadas
      └── Historial de jornadas      [/tienda/jornadas]
```

### Vendedor Navigation (Mobile Bottom Tab Bar)

```
[ Apertura ]   [ Reposición ]   [ Cierre ]   [ Stock ]
```

Navigation rules:
- The vendedor has no access to Catálogo, Compras, Ajustes, or Jornadas history
- If the vendedor tries to access an admin-only route, the system redirects to the vendedor home screen with no error — the route simply does not exist in their navigation
- Both roles share the stock query screen, but the admin version includes monetary columns that the vendedor version omits

### Route Guard Logic

```
/tienda/*             → requires authentication + rol_tienda (either role)
/tienda/productos/*   → requires tienda_admin
/tienda/proveedores/* → requires tienda_admin
/tienda/ordenes/*     → requires tienda_admin
/tienda/ajustes/*     → requires tienda_admin
/tienda/stock         → both roles (different column visibility)
/tienda/jornadas/*    → both roles for current jornada actions; admin only for history list
```

---

## 3. Flow 1 — Product and Supplier Management (Admin)

### 3.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | Create and maintain the product catalog and supplier directory; associate products to suppliers |

### 3.2 User Journey

1. Admin navigates to Catálogo > Productos
2. Scans the product list to verify what exists
3. Creates a new product (or edits an existing one)
4. Navigates to Catálogo > Proveedores
5. Creates or edits a supplier
6. Returns to product detail and associates one or more suppliers to that product

### 3.3 Required Screens

| Screen | Purpose |
|--------|---------|
| PROD-LIST | Product list with search and active/inactive filter |
| PROD-FORM | Create or edit a product |
| PROD-DETAIL | Product detail with supplier association panel |
| PROV-LIST | Supplier list with search |
| PROV-FORM | Create or edit a supplier |

### 3.4 Information Hierarchy per Screen

**PROD-LIST**
1. First: product name, unit, active/inactive status
2. Second: punto_reorden and cantidad_sugerida_pedido (so admin can spot products approaching reorder)
3. Third: action buttons (edit, view detail)
Note: avg_cost and precio_venta appear as columns visible to admin only; they do not appear in any vendedor view of this screen.

**PROD-FORM**
1. First: nombre (most identifying field)
2. Second: unidad, precio_venta
3. Third: punto_reorden, cantidad_sugerida_pedido
4. Fourth: activo/inactivo toggle
5. Fifth: descripcion (optional)
Note: avg_cost field is read-only, system-calculated, shown as informational text below the form — never as an editable input.

**PROD-DETAIL**
1. First: product name and status (active badge)
2. Second: current avg_cost (prominent, read-only)
3. Third: associated suppliers list with "Asociar proveedor" action
4. Fourth: "Ver historial de ajustes" link

**PROV-LIST**
1. First: supplier name
2. Second: contacto (phone/email preview)
3. Third: count of associated products

**PROV-FORM**
1. First: nombre
2. Second: contacto (free text area — phone, email, notes)

### 3.5 Friction Points

**[FRICCIÓN MEDIA] — avg_cost confusion**
The admin may try to edit avg_cost if it appears as a normal form field. Resolution: render avg_cost as a read-only chip or badge labeled "Costo promedio (calculado automáticamente)" — never as an input. Display it only in PROD-DETAIL and PROD-LIST, not in PROD-FORM.

**[FRICCIÓN MEDIA] — supplier association is a separate step**
Admins may not realize they need to associate suppliers to products before those products appear when creating a purchase order filtered by supplier. Resolution: add a contextual hint in PROD-DETAIL's supplier panel: "Los productos sin proveedor asociado no aparecerán al crear una orden de compra."

**[FRICCIÓN MEDIA] — active/inactive toggle consequence not obvious**
The admin may not understand what deactivating a product implies for daily operations. Resolution: the toggle in PROD-FORM includes helper text: "Los productos inactivos no aparecen en el traslado de apertura ni en la reposición." This makes the consequence visible at the moment of decision. The toggle is always editable — the admin decides at any time.

### 3.6 Screen States

**PROD-LIST**
- Empty: illustration + "Todavía no hay productos. Crea el primero." + CTA button
- Loading: skeleton rows (3 placeholder rows with shimmer)
- With data: table with search bar and "Activo / Inactivo" filter chips
- Error: inline alert "No se pudieron cargar los productos. Intenta de nuevo." + retry button

**PROD-FORM**
- Empty (create): all fields blank; avg_cost shown as "0.00 (calculado por el sistema)"; activo toggle defaults to ON
- Loading (save): submit button shows spinner; all fields disabled
- Validation error: field-level error messages below each invalid field; form does not submit
- Success (create): redirect to PROD-DETAIL with success snackbar "Producto creado correctamente"
- Success (edit): redirect to PROD-DETAIL with success snackbar "Cambios guardados"

**PROD-DETAIL — supplier association**
- Empty suppliers: "Sin proveedores asociados. Asocia al menos uno para poder incluir este producto en órdenes de compra."
- With suppliers: list with remove (X) action per supplier + "Asociar proveedor" button
- Duplicate association attempt: inline error "Este proveedor ya está asociado a este producto"

### 3.7 Alternative Flows

- Admin creates a supplier first, then a product, then associates: same result — order is flexible
- Admin tries to delete a supplier that has active purchase orders: system returns 400; UX shows inline alert "No se puede eliminar este proveedor porque tiene órdenes de compra activas."
- Admin deactivates a product that has stock in CENTRAL or Tienda: system allows it; UX shows confirmation dialog "Este producto tiene X unidades en inventario. Desactivarlo lo eliminará del traslado de apertura. ¿Continuar?"

### 3.8 Text Wireframes

#### PROD-LIST (Desktop)

```
[ Tienda > Catálogo > Productos ]

[Buscar producto...]          [Todos | Activos | Inactivos]    [+ Nuevo producto]

TABLA:
Nombre          Unidad    Precio venta    Costo prom.    Pto. reorden    Sugerido    Estado    Acciones
Agua 500ml      unidad    $1,500          $800           20              50          ACTIVO    [Ver] [Editar]
Papas fritas    bolsa     $2,000          $1,100         15              40          ACTIVO    [Ver] [Editar]
...

Mostrando 1–20 de 34 productos    [< 1 2 >]
```

#### PROD-FORM (Desktop — Create)

```
[ Tienda > Catálogo > Productos > Nuevo producto ]

Información del producto
  Nombre *                [________________________________]
  Descripción             [________________________________]
  Unidad de medida *      [unidad / bolsa / caja / ...]
  Precio de venta *       [$_________]
  Punto de reorden *      [___] unidades
  Cantidad sugerida       [___] unidades

  Estado
  [  Activo  ] (toggle — ON por defecto)
  Los productos inactivos no aparecen en el traslado de apertura ni en la reposición.

  Costo promedio: 0.00 (calculado automáticamente por el sistema)

[ Cancelar ]                              [ Crear producto ]
```

#### PROD-DETAIL (Desktop)

```
[ Tienda > Catálogo > Productos > Agua 500ml ]

  Agua 500ml                                    [ACTIVO]
  Unidad: unidad  |  Precio de venta: $1,500  |  Costo promedio: $800
  Descripción: Botella de agua mineral sin gas, 500ml

  [Editar producto]

  ─── Proveedores asociados ─────────────────────────────────────
  Los productos sin proveedor asociado no aparecerán al crear una orden de compra.

  · Distribuidora Aguas SAS          [Eliminar asociación]
  · Proveedor XYZ                    [Eliminar asociación]

  [+ Asociar proveedor]

  ─── Historial de ajustes ──────────────────────────────────────
  [Ver historial de ajustes de inventario →]
```

#### PROV-LIST (Desktop)

```
[ Tienda > Catálogo > Proveedores ]

[Buscar proveedor...]                                        [+ Nuevo proveedor]

TABLA:
Nombre                      Contacto                     Productos asociados    Acciones
Distribuidora Aguas SAS     312 456 7890                 3                      [Ver] [Editar]
Snacks del Valle            snacks@valle.com             7                      [Ver] [Editar]

Mostrando 1–2 de 2 proveedores
```

#### PROV-FORM (Desktop)

```
[ Tienda > Catálogo > Proveedores > Nuevo proveedor ]

Nombre *        [________________________________]
Contacto        [________________________________]
                Puedes incluir teléfono, correo o cualquier nota de contacto.

[ Cancelar ]                              [ Crear proveedor ]
```

### 3.9 Validation Questions

1. Does the admin frequently look up a product's current avg_cost to make pricing decisions? If yes, should avg_cost be more prominently placed in the list view?
2. When an admin deactivates a product with existing stock, what is the expected behavior — should the system block deactivation or just warn?
3. How many products will the catalog typically have (10? 50? 200+)? This determines whether pagination and search are critical at launch.

---

## 4. Flow 2 — Purchase Order Creation and Management (Admin)

### 4.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | Create a multi-product purchase order for a supplier; track its reception status; close it |

### 4.2 User Journey

**Path A — Direct creation (order already negotiated with supplier):**
1. Admin navigates to Compras > Órdenes de compra
2. Clicks "Nueva orden de compra"
3. Selects supplier and date; adds product lines with quantities and expected costs
4. Confirms and saves as state "pendiente"
5. Later: sees order in list; enters detail; registers received merchandise

**Path B — Initiated from restocking list (partial draft):**
1. Admin opens the restocking list (from end-of-day report or from Compras sidebar)
2. Selects one or more products needing restock
3. Clicks "Generar orden de compra" — system creates order in state "iniciada" with product lines but no quantities or costs
4. Admin edits the draft order: selects supplier, fills in quantities and expected costs per line
5. Admin clicks "Confirmar orden" — state transitions to "pendiente"
6. Normal reception flow proceeds

### 4.3 Required Screens

| Screen | Purpose |
|--------|---------|
| ORDER-LIST | List of purchase orders with status filter |
| ORDER-CREATE | Create a complete purchase order (proveedor + lines) |
| ORDER-DETAIL | Full order detail with lines and reception history |
| ORDER-EDIT-INITIATED | Edit an "iniciada" order to complete supplier and line details |
| ORDER-CLOSE-CONFIRM | Confirmation step when closing with discrepancy alert |

### 4.4 Information Hierarchy per Screen

**ORDER-LIST**
1. First: order status (color-coded chip: iniciada=gray, pendiente=blue, parcialmente_recibida=amber, cerrada=green)
2. Second: supplier name and order date
3. Third: number of lines; quick summary of received vs. ordered

**ORDER-DETAIL**
1. First: order header (supplier, date, status chip, notes)
2. Second: line-by-line table (product, ordered qty, received qty, expected cost, line status)
3. Third: reception history (movements registered against this order)
4. Fourth: discrepancy alert if present; "Cerrar orden" action

**ORDER-CREATE**
1. First: supplier selection (mandatory — filters which products appear)
2. Second: date of order
3. Third: product lines (dynamic add/remove rows)
4. Fourth: optional notes

**ORDER-EDIT-INITIATED**
Same as ORDER-CREATE but pre-populated with product lines from the restocking selection. Fields that need completing are highlighted (empty supplier, empty quantities).

### 4.5 Friction Points

**[FRICCIÓN ALTA] — Products filtered by supplier on order creation**
The admin selects a supplier first, and only then can add product lines for products associated with that supplier. If a needed product has no supplier association, it will not appear. Resolution: if the product search returns 0 results after a supplier is selected, show inline hint: "¿No encuentras el producto? Verifica que esté asociado a este proveedor en el catálogo."

**[FRICCIÓN MEDIA] — State "iniciada" is an invisible draft state**
Admins must understand that "iniciada" orders cannot receive merchandise until confirmed to "pendiente." The status chip and the blocked "Recepcionar" button communicate this, but the admin needs to see why. Resolution: in ORDER-DETAIL for "iniciada" orders, show a yellow info banner: "Esta orden está en borrador. Completa el proveedor y todas las líneas, luego confirma para activarla."

**[FRICCIÓN MEDIA] — Discrepancy justification appearing at close time**
The admin may not realize a justification is required when they click "Cerrar orden." The system will surface this mid-action. Resolution: ORDER-DETAIL shows a discrepancy summary column for each line (ordered vs. received delta). If any line exceeds threshold, the close button label changes to "Cerrar con justificación" and a tooltip reads "Hay líneas con diferencia superior al umbral. Se solicitará justificación al confirmar."

**[FRICCIÓN MEDIA] — Orphan "iniciada" orders accumulating**
If admins generate orders from the restocking list but never complete them, "iniciada" orders will accumulate and clutter ORDER-LIST. Resolution: orders in "iniciada" state display a subtle age indicator ("Borrador · hace 3 días"). Filter chip "Iniciada" is available in ORDER-LIST.

### 4.6 Screen States

**ORDER-LIST**
- Empty (no orders ever): "Todavía no hay órdenes de compra. Crea la primera." + CTA
- Loading: 3 skeleton rows
- With data: filtered list; default view shows all non-closed orders
- Error: inline alert + retry

**ORDER-CREATE / ORDER-EDIT-INITIATED**
- Loading products after supplier selection: skeleton rows in the lines table
- No products found for supplier: empty state with hint about catalog association
- Validation error: highlight incomplete lines; field-level messages
- Submit loading: button spinner; form disabled
- Success: redirect to ORDER-DETAIL with snackbar "Orden creada" (or "Orden confirmada" for Path B)

**ORDER-DETAIL**
- Discrepancy present at close: yellow alert banner listing affected lines + mandatory justification textarea
- Close success: status chip changes to "Cerrada" (green); all line actions disabled; success snackbar

**ORDER-CLOSE-CONFIRM — discrepancy modal**
- Heading: "Diferencia significativa detectada"
- Body: table listing each discrepant line (product name, ordered, received, delta, delta %)
- Justification field: mandatory textarea (empty = submit button disabled)
- Actions: [Cancelar] [Confirmar cierre]

### 4.7 Alternative Flows

- Admin tries to close an already-closed order: system returns 400; UX shows snackbar "Esta orden ya está cerrada."
- Admin tries to receive merchandise on a "cerrada" order: "Recepcionar" button not shown; detail shows read-only reception history
- Admin tries to confirm an "iniciada" order with incomplete lines: system returns 400; UX highlights incomplete lines in red and shows: "Completa las cantidades y costos de todas las líneas antes de confirmar."
- Network error during order creation: form preserves all entered data; error alert at top; "Intentar de nuevo" button

### 4.8 Text Wireframes

#### ORDER-LIST (Desktop)

```
[ Tienda > Compras > Órdenes de compra ]

[Todas | Iniciada | Pendiente | Parcialmente recibida | Cerrada]    [+ Nueva orden]

TABLA:
#       Proveedor               Fecha pedido    Estado                    Líneas    Acciones
#0024   Distribuidora Aguas     2026-04-30      PENDIENTE                 3         [Ver]
#0023   Snacks del Valle        2026-04-28      PARCIALMENTE RECIBIDA     5         [Ver]
#0022   [sin proveedor]         —               INICIADA · hace 2 días    2         [Completar]

Mostrando 1–3 de 3 órdenes
```

#### ORDER-CREATE (Desktop)

```
[ Tienda > Compras > Órdenes de compra > Nueva orden ]

Proveedor *            [Selecciona un proveedor ▼]
Fecha del pedido *     [DD/MM/AAAA]
Notas                  [________________________________]

── Líneas del pedido ──────────────────────────────────────────────────────
[+ Agregar producto]
¿No encuentras el producto? Verifica que esté asociado a este proveedor en el catálogo.

  Producto *                  Cant. pedida *    Costo unitario esperado *    Eliminar
  [Selecciona producto ▼]     [___] unidades    [$________]                  [×]
  [Selecciona producto ▼]     [___] unidades    [$________]                  [×]

[ Cancelar ]                                          [ Crear orden ]
```

#### ORDER-DETAIL (Desktop) — state: parcialmente_recibida

```
[ Tienda > Compras > Órdenes de compra > #0023 ]

Distribuidora Aguas SAS                    PARCIALMENTE RECIBIDA
Fecha del pedido: 28/04/2026
Notas: Pedido urgente de fin de mes

── Líneas del pedido ─────────────────────────────────────────────────────
Producto        Pedido    Recibido    Pendiente    Costo esp.    Estado
Agua 500ml      100       80          20           $800          Parcialmente recibida
Agua 1L         50        50          0            $1,400        Completa

  [Recepcionar mercancía]

── Historial de recepciones ─────────────────────────────────────────────
2026-04-29 10:32  Agua 500ml · 80 unidades · CENTRAL · Costo real: $810  (por Admin López)
2026-04-29 10:35  Agua 1L · 50 unidades · CENTRAL · Costo real: $1,400   (por Admin López)

── Acciones ─────────────────────────────────────────────────────────────
                                                      [ Cerrar orden ]
```

#### ORDER-CLOSE-CONFIRM modal (Desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Diferencia significativa detectada                                  │
│                                                                      │
│  Las siguientes líneas tienen una diferencia mayor al 5%:           │
│                                                                      │
│  Producto       Pedido    Recibido    Diferencia                     │
│  Agua 500ml     100       80          20 und (20%)                   │
│                                                                      │
│  Justificación (obligatoria) *                                       │
│  [_____________________________________________]                     │
│  [_____________________________________________]                     │
│                                                                      │
│  [ Cancelar ]                    [ Confirmar cierre ]               │
│  (deshabilitado hasta que       (habilitado al ingresar texto)       │
│   se ingrese justificación)                                          │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.9 Validation Questions

1. Should the admin be able to add more lines to a "pendiente" order after it is created, or is the order locked once confirmed?
2. What should happen if the same product appears in two different "pendiente" orders for the same supplier — should the system warn?
3. Should the discrepancy threshold (currently 5%) be visible to the admin somewhere in the UI so they know what triggers the justification requirement?

---

## 5. Flow 3 — Merchandise Reception (Admin / Vendedor)

### 5.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | Register all received merchandise against an active order in a single operation: quantities, damaged units, actual costs, and destination per product line |
| tienda_vendedor | Mobile/tablet | Register received merchandise at the receiving dock, filling all product lines from the physical invoice before confirming |

### 5.2 User Journey

1. Actor selects an order in state "pendiente" or "parcialmente_recibida"
2. Views ORDER-DETAIL; sees the full line table with pending quantities per product
3. Clicks "Recepcionar mercancía"
4. RECEP-FORM opens showing the order header (supplier, date, reference) and one row per product line with pending units
5. Actor fills all rows inline: good quantity, damaged quantity, actual cost per unit, and destination — working down the list with the physical invoice in hand
6. Actor reviews the completed list and clicks "Confirmar recepción" — a single action that persists all lines atomically
7. System updates each line status and the overall order status automatically
8. Actor is returned to ORDER-DETAIL with updated line statuses; if all lines are complete, the "Cerrar orden" action becomes available

### 5.3 Required Screens

| Screen | Purpose |
|--------|---------|
| RECEP-FORM | Inline multi-row list showing all order lines; actor fills fields per row and confirms all in one action |

Note: there is no separate per-line confirmation step. The single confirmation button at the end of RECEP-FORM commits all lines atomically. This follows the Inline Multi-Row Entry pattern (see §14).

### 5.4 Information Hierarchy per Screen

**RECEP-FORM**
1. First: order header — supplier name, order date, and document reference (so the actor can correlate with the physical invoice they are holding)
2. Second: the inline product list — one row per order line, each row showing:
   a. Product name + quantity ordered (read-only reference)
   b. Already received quantity (read-only reference — from prior partial receptions)
   c. Pending quantity (read-only — contextual reminder of what remains)
   d. Field: good-condition quantity received now
   e. Field: damaged quantity (defaults to 0)
   f. Field: actual cost per unit (pre-filled with expected cost; admin can override; vendedor reads from invoice)
   g. Selector: destination (CENTRAL pre-selected; Tienda option only if a jornada is open)
3. Third: the averia helper text under each damaged field: "Las unidades dañadas quedan como avería y no se suman al inventario."
4. Fourth: a single "Confirmar recepción" button at the bottom that persists all rows atomically

Note: the vendedor enters costo_unitario_real during reception. This is operational input read from the physical supplier invoice. No total, no avg_cost result, and no calculated figure is shown to the vendedor. The field label for vendedor reads "Costo por unidad (según factura/remisión)". This decision is final. (Resolved: OBS-04)

### 5.5 Friction Points

**[FRICCIÓN ALTA] — Damaged units may be confused with "returned to supplier"**
Admins may not understand that damaged units create a SALIDA movement and are permanently excluded from available stock. Resolution: below every "Unidades dañadas" field in the row, add inline text: "Las unidades dañadas quedan como avería y no se suman al inventario." This text appears per row, not as a global note at the top, because the actor needs to see it at the moment of entering each value.

**[FRICCIÓN MEDIA] — Destination selection (CENTRAL vs Tienda) is not visible by default**
The default is CENTRAL; the Tienda option only appears when a jornada is open. Resolution: each row's destination selector shows "Almacén central" pre-selected. The Tienda option appears in the selector only if there is an open jornada. When the Tienda option is not available, the selector is read-only showing "Almacén central (predeterminado)".

**[FRICCIÓN MEDIA] — Actual cost different from expected cost**
The field is pre-filled with expected cost. The actor must actively change it if the real cost differs. Resolution: the field label makes the expectation explicit — admin label: "Costo real por unidad (esperado: $XXX)". Vendedor label: "Costo por unidad (según factura/remisión)". No warning is triggered if the actor leaves the expected value — the label sets the right expectation passively.

**[FRICCIÓN MEDIA] — Actor submits without filling some rows**
If the actor leaves quantity fields blank for a row, the system must validate before accepting. Resolution: rows left completely blank (good qty and damaged qty both empty or zero) are treated as "not receiving this line now" and are skipped in the atomic operation — they retain their pending status. Rows with any non-zero value must have all required fields filled. If a row has a quantity but no cost, a field-level error appears on that specific row before submission is accepted.

### 5.6 Screen States

**RECEP-FORM**
- Loading (on open): skeleton rows matching the number of order lines; expected costs pre-filled from order lines once loaded
- With data: scrollable list of rows; rows with 0 pending quantity shown in muted style with label "Ya recibida completamente" and no editable fields
- Validation error: field-level error on the specific row's field (e.g., "Ingresa el costo" next to the cost field of the incomplete row); page does not scroll to top — error is visible inline where the actor is working
- All rows skipped (actor clicks confirm without entering any quantity): blocking validation "Debes registrar al menos una unidad en alguna línea para confirmar."
- Submit loading: "Confirmar recepción" button shows spinner; all fields disabled; "Registrando recepción..." message
- Success: RECEP-FORM closes or navigates back to ORDER-DETAIL; ORDER-DETAIL line statuses refresh; snackbar "Recepción registrada"
- Network error during submission: snackbar error; all entered data preserved in form state; "Intentar de nuevo" button active

### 5.7 Alternative Flows

- Actor tries to receive against a closed order: "Recepcionar mercancía" button is not shown in ORDER-DETAIL; no path to RECEP-FORM
- All lines on the order are fully received: RECEP-FORM opens showing all rows in muted "Ya recibida completamente" state with no editable fields; a banner reads "Todas las líneas han sido recibidas. Puedes cerrar la orden." with a CTA to "Cerrar orden"
- Actor enters damaged = all units and good = 0 for a line (entire line was damaged): system allows it; avg_cost not recalculated for that line; AVERIA movement created; line marked as received
- Network error during reception: snackbar error; actor can retry; form data is preserved in component state (not lost on retry)

### 5.8 Text Wireframes

#### RECEP-FORM (Desktop — full page or wide drawer on top of ORDER-DETAIL)

```
[ Tienda > Compras > Órdenes de compra > #0023 > Recepcionar mercancía ]

Recepcionar mercancía
────────────────────────────────────────────────────────────────────────
Proveedor:   Distribuidora Aguas SAS
Fecha:       28/04/2026
Referencia:  [Nro. factura / remisión  ___________________________]
────────────────────────────────────────────────────────────────────────

Registra las cantidades recibidas para cada producto.
Los campos vacíos o en cero no generan movimiento en esa línea.

TABLA DE RECEPCIÓN:
┌────────────────────┬───────────┬──────────┬───────────┬─────────────────────────────────────────┬──────────────────────────────────┬───────────────────────────────────────────┐
│ Producto           │ Pedido    │ Recibido │ Pendiente │ Buen estado *                           │ Averiadas                        │ Costo real por unidad *                   │
├────────────────────┼───────────┼──────────┼───────────┼─────────────────────────────────────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ Agua 500ml         │ 100 und   │ 0 und    │ 100 und   │ [____] und                              │ [____] und  (def: 0)             │ $[________]  (esperado: $800)             │
│                    │           │          │           │                                         │ Las dañadas quedan como avería   │                                           │
│                    │           │          │           │                                         │ y no se suman al inventario.     │                                           │
├────────────────────┼───────────┼──────────┼───────────┼─────────────────────────────────────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ Agua 1L            │ 50 und    │ 0 und    │ 50 und    │ [____] und                              │ [____] und  (def: 0)             │ $[________]  (esperado: $1,400)           │
│                    │           │          │           │                                         │ Las dañadas quedan como avería   │                                           │
│                    │           │          │           │                                         │ y no se suman al inventario.     │                                           │
├────────────────────┼───────────┼──────────┼───────────┼─────────────────────────────────────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ Papas fritas       │ 30 und    │ 30 und   │ 0 und     │ ── Ya recibida completamente ──         │                                  │                                           │
└────────────────────┴───────────┴──────────┴───────────┴─────────────────────────────────────────┴──────────────────────────────────┴───────────────────────────────────────────┘

Destino para todas las líneas *
  ( ) Almacén central  (predeterminado)
  ( ) Tienda           (solo disponible si hay jornada abierta)

────────────────────────────────────────────────────────────────────────
[ Cancelar ]                                  [ Confirmar recepción ]
```

Note: the Destino selector is shown once at the bottom of the form and applies to all lines in this reception. If the actor needs different destinations per line (a rare case), they must perform two separate reception operations: one for CENTRAL lines and one for Tienda lines. This trade-off keeps the common case (all to CENTRAL) frictionless.

#### RECEP-FORM (Mobile — full-screen, vertical card list per product)

```
Recepcionar mercancía
[← Volver]
────────────────────────────────
Distribuidora Aguas SAS  ·  28/04/2026

Referencia (factura/remisión)
[________________________________]

Registra lo que recibiste para cada producto.
Los campos vacíos o en cero no generan movimiento.
────────────────────────────────

┌── Agua 500ml ──────────────────────────────┐
│ Pedido: 100  ·  Recibido: 0  ·  Pendiente: 100
│
│ Unidades en buen estado *
│ [____________]
│
│ Unidades averiadas
│ [____________]  (default: 0)
│ Las dañadas quedan como avería y no se suman al inventario.
│
│ Costo por unidad (según factura/remisión) *
│ $[__________]
└────────────────────────────────────────────┘

┌── Agua 1L ─────────────────────────────────┐
│ Pedido: 50  ·  Recibido: 0  ·  Pendiente: 50
│
│ Unidades en buen estado *
│ [____________]
│
│ Unidades averiadas
│ [____________]  (default: 0)
│ Las dañadas quedan como avería y no se suman al inventario.
│
│ Costo por unidad (según factura/remisión) *
│ $[__________]
└────────────────────────────────────────────┘

┌── Papas fritas ─────────────────────────────┐
│ Ya recibida completamente (30/30 und)
└─────────────────────────────────────────────┘

────────────────────────────────
Destino *
[ Almacén central  ▼ ]
(Tienda disponible solo si hay jornada abierta)

[ Confirmar recepción ]  (sticky footer)
```

### 5.9 Validation Questions

1. Is it common for a single reception event to send some lines to CENTRAL and other lines directly to Tienda simultaneously? If yes, the per-line destination selector should replace the single global destination selector shown above.
2. Is the document reference (invoice / remision number) a required field for traceability, or is it optional at this stage?
3. Can the vendedor ever receive merchandise against a purchase order, or is this always an admin function in practice?

---

## 6. Flow 4 — Jornada Opening: Bulk Transfer to Tienda (Vendedor)

### 6.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_vendedor | Mobile/tablet | Start the day: open a jornada and transfer all products to the Tienda in one step |
| tienda_admin | Desktop | Can also perform opening if needed |

### 6.2 User Journey

1. Vendedor arrives at Tienda; opens the app
2. Sees home screen — if no jornada open: prominent CTA "Abrir jornada"
3. Taps "Abrir jornada"; system validates no open jornada exists for this Tienda
4. Jornada created; vendedor immediately proceeds to the bulk transfer screen
5. Sees list of all active products, each with a quantity field (default 0)
6. Enters quantity for each product they are bringing that day
7. Reviews totals and confirms in one tap
8. System generates all inventory movements atomically
9. Home screen shows "Jornada abierta" state with current Tienda stock

### 6.3 Required Screens

| Screen | Purpose |
|--------|---------|
| VEND-HOME | Vendedor home — shows current jornada state |
| JORNADA-OPEN | Confirm jornada creation and Tienda selection |
| TRASLADO-APERTURA | Bulk product quantity entry form |
| TRASLADO-CONFIRM | Summary before atomic commit |

### 6.4 Information Hierarchy per Screen

**VEND-HOME**
1. First: current jornada status (ABIERTA / SIN JORNADA HOY)
2. Second: if open — quick access to Reposición and Cierre
3. Third: if no jornada — single large "Abrir jornada" button

**TRASLADO-APERTURA**
1. First: product name (the most important field — vendedor must identify each product)
2. Second: quantity input (large touch target; numeric keyboard on mobile)
3. Third: current Tienda stock (helps vendedor decide how much to bring)
Note: no monetary values appear anywhere in this screen. No prices, no costs.

**TRASLADO-CONFIRM**
1. First: number of products being transferred (e.g., "8 productos")
2. Second: per-product summary (name, quantity)
3. Third: confirm / edit action

### 6.5 Friction Points

**[FRICCIÓN ALTA] — Vendedor opens a second jornada by mistake**
If the vendedor taps "Abrir jornada" when one is already open (e.g., after a phone restart), the system returns 409. Resolution: VEND-HOME always checks jornada state on load. If a jornada is already open, the "Abrir jornada" button is replaced by "Jornada en curso" indicator. The system never shows the "Abrir jornada" option when a jornada is active.

**[FRICCIÓN ALTA] — Stock in CENTRAL insufficient for requested quantity**
The atomic operation fails if any product has insufficient stock in CENTRAL. Resolution: before the vendedor can reach TRASLADO-CONFIRM, the system performs a lightweight preflight check after quantity entry. If stock is insufficient for any product, highlight that product's row in red with inline text: "Stock disponible en central: X unidades" and prevent confirmation until the quantity is corrected.

**[FRICCIÓN MEDIA] — Long product list requires scrolling on mobile**
With 15+ products, the list becomes tedious on mobile. Resolution: show a sticky progress indicator at the bottom ("8 de 15 productos completados") and allow the vendedor to quickly skip products with 0 (empty = 0, no tap needed). Products already filled appear with a checkmark icon.

**[FRICCIÓN MEDIA] — Quantity entry errors on small keyboard**
Typing "100" when "10" was intended doubles the transfer. Resolution: TRASLADO-CONFIRM shows each product and quantity clearly before atomic commit. The vendedor has one final opportunity to edit any quantity by tapping a row.

### 6.6 Screen States

**VEND-HOME (no jornada)**
```
Estado: Sin jornada activa
[  Abrir jornada del día  ]   (full-width button, primary style)
```

**VEND-HOME (jornada open)**
```
Estado: Jornada abierta · Iniciada a las 08:32
[ Reposición ]   [ Cierre de jornada ]   [ Stock actual ]
```

**TRASLADO-APERTURA**
- Loading: skeleton list
- With data: scrollable product list; sticky confirm button at bottom
- Preflight stock error: product row highlighted; error text under quantity field
- Submit loading: spinner overlay; "Trasladando..." message (operation is atomic, may take 1-2 seconds)

**TRASLADO-CONFIRM**
- Shows count of products with quantity > 0
- Warning if 0 products selected: "Debes trasladar al menos un producto antes de confirmar."
- Success: redirect to VEND-HOME with snackbar "Traslado registrado. ¡Buena jornada!"

### 6.7 Alternative Flows

- Vendedor enters quantities for all products but taps back instead of confirming: no movements are created; jornada remains open but empty
- Vendedor opens app mid-day without having done the bulk transfer: VEND-HOME shows "Jornada abierta sin traslado de apertura" with hint "El traslado de apertura no se ha registrado. Hazlo ahora." + CTA to TRASLADO-APERTURA
- Admin opens the jornada from desktop on behalf of the vendedor: same flow, same screens

### 6.8 Text Wireframes

#### VEND-HOME (Mobile — no jornada)

```
TIENDA
────────────────────────────────

  Hoy no hay jornada abierta.

  ┌──────────────────────────────┐
  │      Abrir jornada           │
  └──────────────────────────────┘

[Apertura]  [Reposición]  [Cierre]  [Stock]
```

#### TRASLADO-APERTURA (Mobile)

```
Traslado de apertura
Marca cuánto llevas hoy a la Tienda.

────────────────────────────────
Agua 500ml            Stock central: 120
Cantidad   [______]

Agua 1L               Stock central: 45
Cantidad   [______]

Papas fritas          Stock central: 30
Cantidad   [______]

Gaseosa lata          Stock central: 60
Cantidad   [______]

Nota: Los campos vacíos o en cero no generan traslado.
────────────────────────────────

Progreso: 3 de 12 productos con cantidad

[ Ver resumen y confirmar ]   (sticky footer button)
```

#### TRASLADO-CONFIRM (Mobile)

```
Confirmar traslado de apertura
────────────────────────────────
Estás trasladando 4 productos a la Tienda:

  Agua 500ml         20 unidades   [Editar]
  Agua 1L            10 unidades   [Editar]
  Papas fritas        5 unidades   [Editar]
  Gaseosa lata       15 unidades   [Editar]

────────────────────────────────
[ Editar cantidades ]   [ Confirmar traslado ]
```

### 6.9 Validation Questions

1. Does the vendedor typically know all products by name, or should the product list show a small image or color-coded category to help identification?
2. Is the bulk transfer always done at the start of the day, or does the vendedor sometimes open the jornada without immediately transferring (e.g., brings product in batches)?
3. Should the system remember quantities from the previous day's opening as a starting suggestion?

---

## 7. Flow 5 — Mid-Day Replenishment (Admin / Vendedor)

### 7.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_vendedor | Mobile/tablet | Register a product transfer from CENTRAL to Tienda when a product runs low |
| tienda_admin | Desktop | Same, or can initiate on behalf of vendedor |

### 7.2 User Journey

1. Vendedor notices a product is running low at the Tienda during the day
2. Goes to the Reposición tab
3. Sees current Tienda stock of all products (quantities only)
4. Selects product and enters quantity to replenish
5. Confirms; system records the movement with registrado_por

### 7.3 Required Screens

| Screen | Purpose |
|--------|---------|
| REPOS-FORM | Select product, enter quantity, confirm |

### 7.4 Information Hierarchy per Screen

**REPOS-FORM**
1. First: product selection (with current Tienda stock shown as context — "Tienes 3 en la Tienda")
2. Second: quantity to transfer
3. Third: available stock in CENTRAL ("Hay 80 disponibles en el almacén central")
4. Confirmation button
Note: no monetary values shown to vendedor.

### 7.5 Friction Points

**[FRICCIÓN MEDIA] — Vendedor doesn't know how much is available in CENTRAL**
Without seeing CENTRAL stock, the vendedor might request more than available. Resolution: show CENTRAL stock as a helper text below the quantity field: "Disponible en almacén central: X unidades." If entered quantity exceeds CENTRAL stock, field-level error appears before submission.

**[FRICCIÓN MEDIA] — No active jornada exists (vendedor forgot to open)**
Reposición requires an open jornada. Resolution: if no active jornada exists, Reposición tab shows: "No hay jornada abierta. Abre primero la jornada del día." + CTA to jornada opening flow.

### 7.6 Screen States

**REPOS-FORM**
- No active jornada: blocked state with CTA
- Loading products: skeleton
- With data: product selector pre-loaded with active products + their Tienda stock
- Quantity exceeds CENTRAL stock: inline field error (before submit)
- Submit loading: spinner; form disabled
- Success: snackbar "Reposición registrada" + form resets for next replenishment
- Error (stock insufficient — server-side): error alert "Stock insuficiente en el almacén central. Disponible: X unidades."

### 7.7 Alternative Flows

- Vendedor does multiple replenishments of the same product throughout the day: each is recorded independently with timestamp and registrado_por
- Admin does a replenishment from desktop: identical form, same outcome
- Replenishment requested when CENTRAL has 0 stock: blocked at client validation before form submit

### 7.8 Text Wireframes

#### REPOS-FORM (Mobile)

```
Reposición
────────────────────────────────

Jornada activa  ·  Iniciada 08:32

Producto *
[ Selecciona un producto ▼ ]
Agua 500ml        → Stock en Tienda: 3 unidades

Cantidad a trasladar *
[______]
Disponible en almacén central: 80 unidades

────────────────────────────────
[ Registrar reposición ]
```

#### REPOS-FORM (Desktop — Admin)

```
[ Tienda > Reposición ]

Jornada activa: Tienda  ·  Iniciada el 04/05/2026 a las 08:32

Producto *                   [ Selecciona un producto ▼ ]
Stock actual en Tienda: 3 unidades

Cantidad a trasladar *       [___] unidades
Disponible en almacén central: 80 unidades

[ Cancelar ]                          [ Registrar reposición ]
```

### 7.9 Validation Questions

1. Does the vendedor typically replenish one product at a time, or are there cases where multiple products run out simultaneously? (If bulk replenishment is common, a multi-product form like the opening would reduce friction.)
2. Should the vendedor see the full product list with Tienda stock at a glance before selecting, or is a product-picker dropdown sufficient?

---

## 8. Flow 6 — Jornada Closing: Physical Count and Cash Register (Vendedor)

### 8.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_vendedor | Mobile/tablet | Close the day: count physical inventory, enter cash delivered and outflows, review quantity summary, confirm |
| tienda_admin | Desktop | Can close on behalf of vendedor; sees full monetary summary and cash alert |

### 8.2 User Journey

1. End of day: vendedor physically counts products remaining at the Tienda
2. Opens Cierre tab
3. Enters physical count for each product present
4. Enters dinero_entrega (cash being delivered to admin) — free-entry field with no expected amount shown
5. Optionally enters dinero_salida with description (any cash outflows during the day)
6. Taps "Ver resumen" — system shows a review screen with calculated sold units, proposed return to CENTRAL
7. Vendedor reviews and can correct any count before final confirmation
8. Taps "Confirmar cierre" — system persists all movements atomically; jornada becomes closed
9. System generates end-of-day report automatically; admin reviews independently via Flow 7

**Critical: Steps 3–7 must be a single contiguous flow to prevent partial completion. The vendedor should not be able to abandon between count entry and confirmation without losing their entered data.**

### 8.3 Required Screens

| Screen | Purpose |
|--------|---------|
| CIERRE-CONTEO | Physical count entry for all products |
| CIERRE-DINERO | Cash delivery (dinero_entrega) and outflow (dinero_salida) free-entry fields |
| CIERRE-RESUMEN | Pre-close review — vendedor sees quantities only; admin sees quantities + monetary totals |
| CIERRE-CONFIRM | Explicit final confirmation step |

Note: CIERRE-CONTEO and CIERRE-DINERO can be combined into a single scrollable screen on mobile to reduce steps, provided the layout is clear. See UX Observations §15 for recommendation.

### 8.4 Information Hierarchy per Screen

**CIERRE-CONTEO**
1. First: product name (vendedor must count each one physically)
2. Second: quantity field (large numeric input)
3. Third: "Total trasladado hoy" per product (so vendedor can sanity-check — "I started with 20, I should have less")
Note: no prices or monetary values shown to vendedor.

**CIERRE-DINERO**
1. First: dinero_entrega — free numeric input labeled "¿Cuánto dinero entregas?" (no expected amount shown, no calculated total visible)
2. Second: "¿Hubo algún gasto en efectivo hoy?" toggle (dinero_salida fields appear when ON)
3. Third: dinero_salida amount + description (only shown if toggle is on)

Decision (final, OBS-04): the vendedor enters dinero_entrega and dinero_salida as free-entry data only. The screen does NOT show the vendedor any expected revenue, calculated totals, or difference amounts. No cuadre alert, no revenue figure, no COGS. Those are shown exclusively to the admin in Flow 7.

**CIERRE-RESUMEN (Vendedor view)**
1. First: clear "Revisa antes de confirmar" heading
2. Second: table — per product: trasladado, conteo ingresado, vendidas calculadas, retorno a central
3. Third: "¿Hay algún error? Corrígelo antes de confirmar."
4. Fourth: confirm button
Note: vendedor DOES NOT see revenue, COGS, utilidad_bruta, or any cuadre comparison in this screen. The dinero_entrega and dinero_salida values entered are echoed back as a simple confirmation ("Dinero a entregar: $18,000") — no comparison is made.

**CIERRE-RESUMEN (Admin view)**
Same product table as vendedor + an additional monetary totals section:
- Revenue estimado total
- COGS estimado total
- Utilidad bruta estimada
- Dinero reportado por el vendedor (dinero_entrega)
- Salidas de efectivo (dinero_salida)
- Cash alert comparison shown only AFTER close in Flow 7, not on this pre-close summary

### 8.5 Friction Points

**[FRICCIÓN ALTA] — Vendedor abandons the flow between count and confirmation**
If the phone locks or the vendedor navigates away, count data is lost. Resolution: persist draft conteo data in localStorage or session storage throughout the flow. If the vendedor returns to the Cierre tab with unsaved conteo data, show: "Tienes un cierre en progreso. Continúa desde donde lo dejaste." + CTA to resume.

**[FRICCIÓN ALTA] — Vendedor mistakes the conteo screen for the final commit**
The vendedor may think that entering counts IS the close, not understanding that there is a review step. Resolution: the conteo screen button says "Ver resumen" (not "Cerrar jornada"). The confirm screen has the jornada-closing button labeled "Confirmar cierre definitivo" with a brief explanation: "Al confirmar, el inventario sobrante vuelve al almacén central. Esta acción no se puede deshacer."

**[FRICCIÓN MEDIA] — Vendedor doesn't count a product (leaves it blank)**
Blank = 0 in the system, meaning the system calculates all units of that product as sold. This could be a data error. Resolution: if a product has a non-zero Tienda quantity (from transfers) but the vendedor leaves its count field blank, show a validation warning before reaching the summary: "Dejaste sin contar: [Agua 500ml]. El sistema lo considerará como 0 unidades. ¿Es correcto?" — two options: "Sí, continuar" and "Volver a contar".

**[FRICCIÓN MEDIA] — Cash outflow field requires description but vendedor doesn't understand why**
Resolution: label the description field with placeholder text: "¿Para qué fue el gasto? Ej: Bolsas para empaque" to make it obvious.

### 8.6 Screen States

**CIERRE-CONTEO**
- Loading: skeleton product list
- In progress: each row shows filled indicator as vendedor enters counts
- Blank product warning: before proceeding to summary, list of uncounted products with options
- Progress: sticky footer "N de M productos contados"

**CIERRE-RESUMEN**
- Loading (calculating): brief spinner overlay while API calculates summary
- Calculated: table populates with sold units and return quantities
- Negative sold units warning: if conteo > trasladado (vendedor counted MORE than what was transferred), highlight that row in amber with: "Este conteo supera lo trasladado (X und). Revisa el número." System does not block confirmation — the admin may need to investigate.

**CIERRE-CONFIRM**
- Submit loading: spinner; button disabled; "Cerrando jornada..." message
- Success: screen transitions to "Jornada cerrada" state; snackbar "Jornada cerrada correctamente"; VEND-HOME resets to "Sin jornada activa"
- Error (already closed): "Esta jornada ya está cerrada." (should not happen in normal flow)
- Error (network): form data preserved; "No pudimos cerrar la jornada. Intenta de nuevo." + retry button

### 8.7 Alternative Flows

- Admin closes on behalf of vendedor from desktop: same logical steps; admin sees monetary summary section in CIERRE-RESUMEN; cash alert appears after close in Flow 7
- Vendedor closes without doing any replenishments during the day: flow is identical; system calculates sold units from apertura traslado only
- Vendedor opens the close flow but has no products to count (never did the opening transfer): system shows CIERRE-CONTEO with empty list and message "No se trasladaron productos a la Tienda en esta jornada."

### 8.8 Text Wireframes

#### CIERRE-CONTEO (Mobile)

```
Cierre de jornada — Paso 1 de 3
Cuenta el inventario que quedó en la Tienda.

────────────────────────────────
Agua 500ml
Trasladado hoy: 20 unidades
¿Cuántas quedan?  [______]

Agua 1L
Trasladado hoy: 10 unidades
¿Cuántas quedan?  [______]

Papas fritas
Trasladado hoy: 5 unidades
¿Cuántas quedan?  [______]

Gaseosa lata
Trasladado hoy: 15 unidades
¿Cuántas quedan?  [______]

────────────────────────────────
Progreso: 3 de 4 productos contados

[ Ver resumen ]   (sticky footer — enabled when all products counted)
```

#### CIERRE-DINERO (Mobile — embedded after count, same screen or step 2)

```
Cierre de jornada — Paso 2 de 3
Registra el dinero del día.

────────────────────────────────
¿Cuánto dinero entregas? *
$[____________]

¿Hubo algún gasto en efectivo hoy?
[ ] Sí

(si activa "Sí":)
Monto del gasto     $[_______]
Descripción *       [_______________________]
                    Ej: Bolsas para empaque

────────────────────────────────
[ Ver resumen ]
```

#### CIERRE-RESUMEN (Mobile — Vendedor view)

```
Cierre de jornada — Paso 3 de 3
Revisa antes de confirmar.
Al confirmar, el inventario sobrante vuelve al almacén central.

────────────────────────────────
Producto         Trasladado  Conteo  Vendidas  Retorno central
Agua 500ml       20          6       14        6
Agua 1L          10          2       8         2
Papas fritas     5           0       5         0
Gaseosa lata     15          4       11        4

────────────────────────────────
Dinero a entregar: $18,000

¿Hay un error? Toca cualquier fila para corregir el conteo.

[ ← Corregir ]     [ Confirmar cierre definitivo ]
                   Esta acción no se puede deshacer.
```

#### CIERRE-RESUMEN (Desktop — Admin view) — additional monetary section

```
... (same product table as vendedor) ...

──── Resumen de caja (visible solo para administrador) ───────────────
Revenue estimado:           $48,500
COGS estimado:              $27,300
Utilidad bruta estimada:    $21,200

Dinero reportado por el vendedor:   $18,000
Salidas de efectivo del día:        $2,000  (Bolsas para empaque)

────────────────────────────────────────────────────────────────────
[ ← Corregir ]     [ Confirmar cierre definitivo ]
```

### 8.9 Validation Questions

1. Does the admin always review the jornada close immediately after the vendedor confirms, or can it happen the next morning?
2. How many products will typically be in a jornada close? (5? 10? 25?) This determines whether a single scrollable page or a multi-step wizard is the right pattern.

---

## 9. Flow 7 — Admin Review of Jornada Close (Admin)

### 9.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | Review closed jornada; assess cash discrepancy alert; validate end-of-day report |

### 9.2 User Journey

1. Admin navigates to Jornadas > Historial (or receives a notification outside the app)
2. Sees closed jornada with cash alert badge (faltante = red, sobrante = amber, ok = no badge)
3. Opens jornada detail
4. Reviews per-product sold units, revenue, COGS, margin
5. Reviews cash section: dinero entregado vs. revenue; alert type and amount of difference
6. Views restocking section: products below reorder point

### 9.3 Required Screens

| Screen | Purpose |
|--------|---------|
| JORNADA-LIST | List of jornadas with cash alert badge |
| JORNADA-DETAIL-ADMIN | Full closed jornada detail with monetary data |
| REPORTE-FIN-DIA | End-of-day report section (embedded in JORNADA-DETAIL-ADMIN or separate tab) |

### 9.4 Information Hierarchy per Screen

**JORNADA-LIST (Admin)**
1. First: date, Tienda name, vendedor name
2. Second: status (abierta/cerrada) + cash alert badge if cerrada
3. Third: total revenue (admin-only column)
4. Fourth: link to detail

**JORNADA-DETAIL-ADMIN**
1. First: cash alert banner at top (if faltante or sobrante, immediately visible)
2. Second: per-product table with sold units, revenue, COGS, utilidad_bruta
3. Third: cash reconciliation section
4. Fourth: restocking list section

### 9.5 Friction Points

**[FRICCIÓN ALTA] — Admin does not notice cash discrepancy without opening each jornada**
Resolution: cash alert is shown as a badge/chip on the jornada list row (red for faltante, amber for sobrante). Admin can scan the list and immediately see which jornadas need attention.

**[FRICCIÓN MEDIA] — Admin confuses revenue with cash delivered**
The distinction between "lo que debería haber" (revenue) and "lo que entregó el vendedor" (dinero_entrega) must be visually unambiguous. Resolution: use two clearly separated values with labels:
- "Ingresos esperados: $48,500"
- "Dinero entregado: $18,000"
- "Diferencia: –$30,500 (FALTANTE)" in red

### 9.6 Screen States

**JORNADA-LIST**
- Empty: "Todavía no hay jornadas registradas."
- With open jornada: row shows "ABIERTA" chip; no cash alert yet
- With closed jornada (ok): no badge
- With closed jornada (faltante): red "FALTANTE" badge on row
- With closed jornada (sobrante): amber "SOBRANTE" badge on row

**JORNADA-DETAIL-ADMIN**
- Loading: skeleton for table and cash section
- Cash alert: prominent banner at top; color matches alert type
- Restocking section empty: "Todos los productos están sobre el punto de reorden."

### 9.7 Alternative Flows

- Admin opens detail of an open (not yet closed) jornada: shows transfers made so far; no closing data; no cash section; "Jornada en curso" banner
- Admin wants to correct a cash discrepancy: no correction mechanism in v1 — the spec does not define one. UX shows the alert as informational only (no action button). See UX Observations §15.

### 9.8 Text Wireframes

#### JORNADA-LIST (Desktop — Admin)

```
[ Tienda > Jornadas ]

TABLA:
Fecha          Tienda    Vendedor       Estado     Revenue          Alerta
04/05/2026     Tienda    García, M.     CERRADA    $48,500    [FALTANTE]
03/05/2026     Tienda    García, M.     CERRADA    $52,000
02/05/2026     Tienda    García, M.     CERRADA    $39,000    [SOBRANTE]
```

#### JORNADA-DETAIL-ADMIN (Desktop)

```
[ Tienda > Jornadas > 04/05/2026 ]

Tienda  ·  García, M.  ·  Cerrada a las 17:45 por García, M.

┌──────────────────────────────────────────────────────────────────────┐
│  ALERTA DE CAJA — FALTANTE                                          │
│  El dinero entregado es menor al esperado.                           │
│  Ingresos esperados: $48,500                                         │
│  Dinero entregado:   $18,000                                         │
│  Salidas registradas: $2,000  (Bolsas para empaque)                 │
│  Diferencia:         –$28,500                                        │
└──────────────────────────────────────────────────────────────────────┘

── Resultados del día por producto ────────────────────────────────────
Producto          Vendidas    Revenue     COGS        Utilidad bruta
Agua 500ml        14          $21,000     $11,200     $9,800
Agua 1L           8           $14,000     $8,000      $6,000
Papas fritas      5           $10,000     $5,500      $4,500
Gaseosa lata      11          $3,500      $2,600      $900

TOTAL                         $48,500     $27,300     $21,200

── Lista de reabastecimiento ──────────────────────────────────────────
Los siguientes productos están por debajo del punto de reorden:

Producto          Stock central    Pto. reorden    Sugerido pedir    En órdenes activas
Agua 500ml        8                20              50                30
Papas fritas      3                15              40                0

  [Generar orden de compra con estos productos]

── Conteo físico registrado ───────────────────────────────────────────
Producto       Trasladado    Conteo ingresado    Vendidas    Retorno a central
Agua 500ml     20            6                   14          6
...
```

### 9.9 Validation Questions

1. Should the admin be able to add a note or flag a jornada for follow-up when there is a cash discrepancy? (Currently the spec has no resolution mechanism for cash discrepancies.)
2. Should the restocking list in the jornada detail link directly to the order creation flow, or is the "Generar orden de compra" button sufficient?
3. Does the admin review jornadas daily, or only when there is an alert? This affects whether the jornada list needs a notification/badge on the main navigation.

---

## 10. Flow 8 — Restocking List and Order Initiation (Admin)

### 10.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | View products needing restock; select them and generate a draft purchase order |

### 10.2 User Journey

1. Admin sees restocking list (either inside jornada close report or via the Compras sidebar link)
2. Reviews products below their reorder point with current stock and suggested order quantity
3. Also sees how many units are already in active orders (to avoid duplicate ordering)
4. Selects one or more products
5. Clicks "Generar orden de compra" — system creates an "iniciada" order with those product lines
6. Admin is redirected to the order editing screen (ORDER-EDIT-INITIATED) to complete supplier, quantities, and costs
7. Admin confirms the order → state transitions to "pendiente"

### 10.3 Required Screens

| Screen | Purpose |
|--------|---------|
| RESTOCK-LIST | Standalone restocking view (also embedded in jornada report) |
| ORDER-EDIT-INITIATED | (Same as Flow 2 — ORDER-EDIT-INITIATED) |

### 10.4 Information Hierarchy per Screen

**RESTOCK-LIST**
1. First: product name (most actionable identifier)
2. Second: stock actual (how critical is the situation)
3. Third: punto_reorden (what's the threshold)
4. Fourth: unidades_en_ordenes_activas (shows if an order is already in progress — prevents duplicate ordering)
5. Fifth: cantidad_neta_a_pedir (adjusted suggestion after accounting for active orders)
6. Sixth: selection checkbox for order generation

### 10.5 Friction Points

**[FRICCIÓN MEDIA] — Admin generates a duplicate order for a product already on order**
BR-026 mitigates this by showing unidades_en_ordenes_activas. Resolution: if unidades_en_ordenes_activas >= cantidad_sugerida_pedido, that product row is shown with a gray "ya cubierto" badge and the checkbox is unchecked by default. The admin can still select it if needed.

**[FRICCIÓN MEDIA] — Admin doesn't understand "cantidad neta a pedir" vs. "cantidad sugerida"**
Resolution: tooltip on the column header: "La cantidad neta descuenta las unidades que ya están en órdenes activas. Puedes ajustar la cantidad al completar la orden."

### 10.6 Screen States

**RESTOCK-LIST**
- Empty (all products above reorder): "Todos los productos tienen stock suficiente. No hay productos por debajo del punto de reorden."
- With products: table with checkboxes; select-all option; "Generar orden" button activates when at least one is selected
- After generation: snackbar "Orden en borrador creada. Completa los detalles para activarla." + redirect to ORDER-EDIT-INITIATED

### 10.7 Alternative Flows

- Admin selects products from multiple suppliers: the system creates ONE "iniciada" order. The admin will need to realize they must split by supplier when completing the order. UX consideration: show a warning after generation if selected products belong to multiple suppliers: "Los productos seleccionados corresponden a más de un proveedor. Asegúrate de asignar el proveedor correcto al completar la orden."

### 10.8 Text Wireframes

#### RESTOCK-LIST (Desktop — standalone page and embedded in jornada report)

```
Lista de reabastecimiento
Productos por debajo del punto de reorden al cierre del 04/05/2026

[ ] Seleccionar todo                    [Generar orden de compra (N seleccionados)]

TABLA:
      Producto          Stock actual    Pto. reorden    Ya en órdenes    Neta a pedir    Sugerido
[x]   Agua 500ml        8               20              30               20              50
[x]   Papas fritas      3               15              0                40              40
[ ]   Gaseosa lata      12              20              20               (ya cubierto)   20

Nota: "Neta a pedir" descuenta las unidades ya en órdenes activas.
```

### 10.9 Validation Questions

1. Should the standalone restocking list (outside the jornada report) show real-time stock, or only the stock as of the last jornada close?
2. When the admin generates an order with products from multiple suppliers, should the system split it into N separate "iniciada" orders (one per supplier) automatically, or leave it to the admin to manage?

---

## 11. Flow 9 — Manual Inventory Adjustment (Admin)

### 11.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | Correct a stock discrepancy that does not correspond to a normal operation; document with mandatory note |

### 11.2 User Journey

1. Admin detects a stock discrepancy (e.g., after a physical audit, or to correct a historical error)
2. Navigates to Inventario > Ajustes
3. Creates an adjustment: selects product, location, direction (ENTRADA/SALIDA), quantity, cost, and writes a mandatory note
4. Confirms; system persists the movement and recalculates avg_cost if ENTRADA

### 11.3 Required Screens

| Screen | Purpose |
|--------|---------|
| AJUSTE-LIST | History of adjustments per product |
| AJUSTE-FORM | Create a new adjustment |

### 11.4 Information Hierarchy per Screen

**AJUSTE-FORM**
1. First: product selection
2. Second: direction (ENTRADA adds units; SALIDA removes units) — shown as two large radio buttons, not a dropdown
3. Third: location (CENTRAL or Tienda — Tienda only available if there is an active jornada)
4. Fourth: quantity and cost per unit
5. Fifth: note (mandatory, prominent — not at the bottom where it might be skipped)

**AJUSTE-LIST**
1. First: date and product
2. Second: direction and quantity
3. Third: note (truncated; expandable)
4. Fourth: who registered it

### 11.5 Friction Points

**[FRICCIÓN ALTA] — Admin submits adjustment without writing the note**
The note is mandatory (BR-015). Resolution: the "Registrar ajuste" button is DISABLED until the note field has content. The note field is positioned prominently in the form — not at the bottom — with label "Motivo del ajuste (obligatorio)".

**[FRICCIÓN MEDIA] — Admin confuses ENTRADA vs. SALIDA**
Resolution: instead of a dropdown, use two large radio buttons with descriptive labels:
- "ENTRADA — Agregar unidades al inventario"
- "SALIDA — Retirar unidades del inventario"
Include a helper note about avg_cost behavior: "Los ajustes de entrada recalculan el costo promedio. Los ajustes de salida no lo modifican."

**[FRICCIÓN MEDIA] — Admin adjusts Tienda stock during a closed jornada**
When there is no open jornada, adjustments to Tienda stock are technically possible but operationally unusual. Resolution: if admin selects Tienda as location and there is no open jornada, show an amber warning: "No hay jornada abierta en la Tienda. Ajustar el stock fuera de una jornada puede generar inconsistencias con el cierre del día." (does not block submission).

### 11.6 Screen States

**AJUSTE-FORM**
- Default: direction not selected; button disabled
- Direction selected: quantity and cost fields appear
- Note empty: button remains disabled
- Note filled: button activates
- Submit loading: spinner; "Registrando ajuste..."
- Success (ENTRADA): snackbar "Ajuste registrado. Nuevo costo promedio: $XXX"
- Success (SALIDA): snackbar "Ajuste registrado. El costo promedio no se modificó."
- Error (insufficient stock for SALIDA): inline error "Stock insuficiente. Hay X unidades en [ubicación]."

**AJUSTE-LIST**
- Empty (no adjustments for product): "Sin ajustes registrados para este producto."
- With data: list ordered by date descending

### 11.7 Alternative Flows

- Vendedor tries to access Inventario > Ajustes: route is admin-only; system redirects with 403 handled gracefully (navigation item simply does not appear in vendedor menu)

### 11.8 Text Wireframes

#### AJUSTE-FORM (Desktop)

```
[ Tienda > Inventario > Ajustes > Nuevo ajuste ]

Producto *
[ Selecciona un producto ▼ ]
Stock actual: CENTRAL 45 und  /  Tienda 3 und

Tipo de ajuste *
  ( ) ENTRADA — Agregar unidades al inventario
  ( ) SALIDA  — Retirar unidades del inventario

  Los ajustes de entrada recalculan el costo promedio.
  Los ajustes de salida no lo modifican.

Ubicación *
  ( ) Almacén central  ( ) Tienda

Cantidad *          [___] unidades
Costo por unidad *  [$_______]

Motivo del ajuste (obligatorio) *
[______________________________________________]
[______________________________________________]
Explica por qué se hace este ajuste. Quedará en el historial.

[ Cancelar ]              [ Registrar ajuste ]   (disabled until note filled)
```

#### AJUSTE-LIST (Desktop)

```
[ Tienda > Inventario > Ajustes ]

Filtrar por producto: [ Selecciona un producto ▼ ]

TABLA:
Fecha               Producto       Tipo     Ubicación   Cantidad    Costo unit.    Registrado por    Nota
04/05/2026 14:23    Agua 500ml    ENTRADA   CENTRAL     20          $820           Admin López       Corrección post-inventario físico
02/05/2026 09:15    Papas fritas  SALIDA    Tienda      5           $1,100         Admin López       Producto vencido retirado
```

### 11.9 Validation Questions

1. Should adjustments require a second confirmation step (e.g., "¿Estás seguro?") given that they affect avg_cost irreversibly on ENTRADA?
2. Is there a need to distinguish between types of adjustment reasons (e.g., "robo", "vencimiento", "error de conteo") with a categorical selector, or is the free-text note sufficient?

---

## 12. Flow 10 — Stock Query by Location (Admin / Vendedor)

### 12.1 Users Involved

| User | Device | Goal |
|------|--------|------|
| tienda_admin | Desktop | View current stock per product per location; see total system stock with location breakdown |
| tienda_vendedor | Mobile/tablet | Check current Tienda stock during the day |

### 12.2 User Journey

**Admin:**
1. Navigates to Inventario > Stock actual
2. Sees all products with stock in CENTRAL and Tienda columns
3. Can filter by product name
4. Can view total stock (CENTRAL + Tienda) per product

**Vendedor:**
1. Taps Stock tab in bottom navigation
2. Sees all active products with their current Tienda quantity
3. Searches by name if needed

### 12.3 Required Screens

| Screen | Purpose |
|--------|---------|
| STOCK-ADMIN | Stock table: product, CENTRAL qty, Tienda qty, total |
| STOCK-VENDEDOR | Simplified stock view: product, Tienda qty and CENTRAL qty |

### 12.4 Information Hierarchy per Screen

**STOCK-ADMIN**
1. First: product name
2. Second: CENTRAL stock quantity (the main operational reserve)
3. Third: Tienda stock quantity (what's currently at the point of sale)
4. Fourth: total (sum of both)
Note: avg_cost visible as optional column for admin; no monetary values for vendedor.

**STOCK-VENDEDOR**
1. First: product name
2. Second: Tienda stock quantity (most relevant during the day)
3. Third: CENTRAL stock quantity (helpful for replenishment decisions)
Note: no monetary values, no avg_cost.

### 12.5 Friction Points

**[FRICCIÓN MEDIA] — Vendedor sees CENTRAL stock when they cannot replenish themselves**
Although the vendedor can execute replenishments, knowing CENTRAL stock is operationally useful (helps them decide how much to request). The spec allows vendedor to view CENTRAL stock via the stock query endpoint. Resolution: for the vendedor, show both Tienda and CENTRAL quantities but label them clearly: "En la Tienda: 5 und" and "En el almacén central: 80 und."

**[FRICCIÓN MEDIA] — Admin and vendedor see the same route with different data**
Resolution: the route `/tienda/stock` renders STOCK-ADMIN for tienda_admin and STOCK-VENDEDOR for tienda_vendedor. Role-differentiated component rendering; same route, different column visibility.

### 12.6 Screen States

**STOCK-ADMIN**
- Loading: skeleton table
- With data: product list, searchable
- Product with zero stock in all locations: shown in muted style with "0" values (not hidden)
- No products with stock: empty state with hint to create orders or adjustments

**STOCK-VENDEDOR**
- Loading: skeleton
- No jornada open: shows Tienda stock as 0 (or actual if stock was left without a jornada) with contextual note "El stock de la Tienda se actualiza durante la jornada."

### 12.7 Alternative Flows

- Admin queries stock total for a product: navigates to product detail or uses stock total endpoint; result shows desglose (CENTRAL: X, Tienda: Y, Total: Z)

### 12.8 Text Wireframes

#### STOCK-ADMIN (Desktop)

```
[ Tienda > Inventario > Stock actual ]

[Buscar producto...]

TABLA:
Producto          CENTRAL    Tienda    Total    Costo prom.    Punto reorden
Agua 500ml        8          5         13       $810           20  ⚠
Agua 1L           45         2         47       $1,400         15
Papas fritas      3          0         3        $1,100         15  ⚠
Gaseosa lata      60         4         64       $320           20

⚠ = stock en CENTRAL por debajo del punto de reorden
```

#### STOCK-VENDEDOR (Mobile)

```
Stock actual
────────────────────────────────
[Buscar producto...]

Agua 500ml
  En la Tienda:              5 unidades
  En el almacén central:    80 unidades

Agua 1L
  En la Tienda:              2 unidades
  En el almacén central:    45 unidades

Papas fritas
  En la Tienda:              0 unidades
  En el almacén central:     3 unidades
```

### 12.9 Validation Questions

1. Should the vendedor be able to initiate a replenishment directly from the stock view (e.g., a "Reponer" button next to each low-stock product)?
2. Does the admin need real-time stock or is it acceptable for the stock view to cache for a few seconds given potentially heavy query load?

---

## 13. Global Screen States Reference

This section defines consistent system-wide states that apply across all screens. React developer must implement these as shared components.

### Loading States

All data-fetching screens must show skeleton loading (not spinners for full-page loads). Skeletons must match the expected layout: table rows for lists, form fields for forms. Button-level actions use a spinner inside the button, not a full-page overlay.

### Error States

| Error type | Display pattern |
|------------|-----------------|
| Network error (GET) | Inline alert with retry button; do not navigate away |
| Network error (POST/PATCH) | Toast/snackbar error; form data preserved; retry possible |
| 403 Forbidden | Redirect to role-appropriate home; no error page shown |
| 404 Not Found | Inline message "Este elemento no existe o fue eliminado." |
| 400 Validation | Field-level error messages; form scrolls to first error |
| 409 Conflict (duplicate jornada) | Inline blocking message with explanation |
| 500 Server error | Error alert with "Intenta de nuevo. Si el problema persiste, contacta al administrador." |

### Empty States

Every list screen must have an empty state with:
- A single-line explanation of why the list is empty (not a generic "No results")
- A CTA to the most logical next action (e.g., "Crear primer producto")

### Success Feedback

All POST/PATCH/DELETE actions must provide immediate feedback:
- Form submissions: snackbar (3-second auto-dismiss) + redirect if applicable
- Destructive actions: snackbar with undo option when technically feasible
- Long-running operations (>1 second): inline loading state in the triggering button

### Role-Visibility Rule (consistent implementation)

Every screen that exists for both roles must treat the role-differentiation as a rendering concern, not a routing concern. Same route, same component, different props/serializer output. The component checks `user.rol_tienda` and conditionally renders monetary columns or fields. Never use separate routes for role-differentiated views of the same data.

---

## 14. Design Patterns

This section documents reusable interaction patterns established in this spec. React developer must implement these as shared component behaviors, not one-off solutions per screen.

---

### Pattern: Inline Multi-Row Entry

**ID:** PATTERN-IMR-01

**Summary:** When an operation involves the same set of fields applied to multiple items simultaneously, present all items as a vertical list where each row contains all the editable fields inline. The actor fills all rows before committing with a single confirmation action at the bottom.

**Rationale:** The sequential alternative — presenting one item at a time and requiring a confirmation per item before moving to the next — introduces N confirmation steps for N items. This creates unnecessary friction, breaks the actor's working rhythm (they typically have a physical document in hand and want to transcribe all values in one pass), and increases the risk of partial completion if the actor is interrupted mid-flow. The single-confirmation pattern is more resilient to interruption because the actor can see the full picture before committing.

**Rules:**
1. All rows are visible simultaneously — no pagination within the list.
2. Rows that are not applicable (e.g., already fully processed) are shown in a muted style with an explanatory label, not hidden.
3. Empty rows (actor left all fields blank) are skipped in the atomic operation — they do not generate movements or errors.
4. Rows with partial input (some fields filled, required fields left blank) produce field-level validation errors on submission, not a blocking modal — the error is shown inline on the specific field in that row.
5. A single confirmation button at the bottom of the list commits all non-empty rows atomically. There is no per-row confirm step.
6. On mobile, rows are rendered as vertical cards (stacked) rather than a horizontal table. Each card shows the item name prominently and the editable fields below it.
7. A progress indicator (e.g., "3 de 12 productos con cantidad") may be shown when the list is long enough to require scrolling.

**Flows that use this pattern:**

| Flow | Screen | Context |
|------|--------|---------|
| Flow 3 — Merchandise Reception | RECEP-FORM | Actor fills received quantities, damaged units, actual cost, and destination for all order lines from a physical invoice; confirms all in one action |
| Flow 4 — Jornada Opening | TRASLADO-APERTURA | Vendedor fills transfer quantities for all active products; confirms all in one action |
| Flow 6 — Jornada Closing | CIERRE-CONTEO | Vendedor fills physical count for all products at the Tienda; proceeds to summary before final confirmation |

**Implementation note for react-developer:** The inline row fields must be controlled components sharing state within a single form context. Do not implement each row as an independent form. The single submit handler at the bottom collects and validates all row data before dispatching the API call. If the list may exceed 20 rows, consider virtualization for render performance — but do not paginate rows (pagination would break the single-confirmation model).

---

## 15. UX Observations for Systems Analyst

The following observations identify UX issues derived from the functional specification that may require a decision or clarification before implementation.

---

**OBS-01 — No resolution mechanism for cash discrepancy (P-03 open question)**

The spec defines `alerta_caja` (faltante/sobrante) as informational only. There is no admin action to resolve or annotate the discrepancy. In practice, the admin will need to follow up with the vendedor outside the system. Recommendation: even in v1, a simple "Nota de resolución" free-text field on the jornada detail would close the feedback loop and prevent the alert from remaining permanently unresolved. This is a low-effort addition.

Related PM open question: P-03 asks whether the vendedor or admin should always close the jornada. If the answer is "admin always closes," then the alerta_caja becomes immediately visible to the actor closing the jornada, and the follow-up is synchronous. If the vendedor can close, the admin reviews asynchronously.

---

**OBS-02 — Product active/inactive criterion (RESOLVED)**

Decision: the administrator can mark any product as active or inactive at any time using the toggle in PROD-FORM. There is no automatic criterion — it is always an explicit admin decision. Inactive products do not appear in the vendedor's opening transfer, replenishment, or any other vendedor flow. They remain visible and editable for the admin. The toggle is always enabled in PROD-FORM and defaults to ON for new products. No further clarification is required before implementing the product form.

---

**OBS-03 — POS name (RESOLVED)**

Decision: the point of sale is called "Tienda" throughout the entire interface. All wireframes, labels, headings, and descriptions in this spec use "Tienda" as the display name. References to "Tienda Principal", "POS_1", or "Punto de Venta" as placeholders have been replaced. The name is fixed — no business input is required before coding labels.

---

**OBS-04 — Vendedor visibility of costo_unitario_real during reception (RESOLVED)**

Decision: the vendedor enters costo_unitario_real during merchandise reception. This is treated as operational data-entry input — the vendedor reads the value from the physical supplier invoice or remision that accompanies the delivery and types it into the form. The field appears only in RECEP-FORM. No total, no avg_cost result, no calculated figure derived from this value is shown to the vendedor at any point. The field label for the vendedor reads "Costo por unidad (según factura/remisión)" to make the data source explicit and prevent confusion with a profitability metric. BR-027 is not violated: the vendedor enters a number from a document — they are not shown system-calculated revenue, margin, or cost analysis. This decision is final and does not require further systems-analyst input.

---

**OBS-05 — Multi-supplier product selection warning during "iniciada" order generation**

When the admin selects products from the restocking list for order generation, the selected products may belong to different suppliers. The system creates a single "iniciada" order with no supplier assigned. The admin must then assign a supplier, but a single order can only have one supplier. If they selected products from three different suppliers, they must manually split the order.

The spec does not define automatic order splitting. UX adds a warning message post-generation (see Flow 8). However, a longer-term improvement would be to pre-group selection by supplier and generate N orders automatically. This is a v2 suggestion that should be documented in the backlog.

---

**OBS-06 — Closing step count for the vendedor (PM Risk R-05)**

The PM document flags Risk R-05: the close flow involves multiple steps that may feel complex to the vendedor. This spec proposes a 3-step flow (conteo + dinero + resumen + confirm). For a vendedor with 10–15 products, this is achievable in under 5 minutes if the UX is clean. However, if the business decides the admin always closes (resolving P-03), this risk is eliminated for the vendedor and the close flow becomes desktop-only.

Recommendation: resolve P-03 before building the close flow UI to avoid building two versions.

---

**OBS-07 — Restocking list in real-time vs. at jornada close**

The spec defines the restocking list as a section of the end-of-day report (tied to jornada close). However, the admin may need to check restocking status at any point during the day, not only after a close. The standalone `/stock/reabastecimiento/` endpoint exists in the API spec and can power a real-time restocking view.

This spec includes the restocking list as both an embedded section of the jornada close report AND as a standalone page under Compras. The systems analyst should confirm both uses are intended and that the real-time endpoint is correctly scoped (it uses current `StockUbicacion`, not a snapshot from the jornada close).

---

*End of UX Specification — Módulo Tienda v1.2*
*Produced by ux-designer · 2026-05-04*
*Updated: v1.2 — Flow 3 RECEP-FORM redesigned to Inline Multi-Row Entry pattern; Design Patterns section added (§14); OBS-02, OBS-03, OBS-04 resolved*
