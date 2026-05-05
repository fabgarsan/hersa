---
name: HRS-56 Compras audit findings
description: Security findings from the tienda/compras (purchase orders) feature audit on 2026-05-04
type: project
---

Key findings for the HRS-56 Tienda compras feature:

**HIGH — Recepcionar available to vendedor (no role gate on RecepcionFormPage)**: `RecepcionFormPage` only checks `role === "none"` — it does not require `isAdmin`. Any vendedor with tienda access can navigate to `/:id/recepcionar` and submit a reception, registering `realUnitCost`. Confirmed: no `!isAdmin` guard or redirect exists.

**HIGH — `realUnitCost` / `costoUnitarioReal` submitted by vendedor**: Directly follows from the above. The `realUnitCost` monetary field flows from vendedor input through `recepcionSchema` into the mutation. Client-side "admin-only" assumption is never enforced. Server must block it; there is no evidence of a server-side role check from the frontend alone.

**MEDIUM — `orderLine` UUID not validated via `assertUuid()` in `recepcionarOrdenMutation`**: `ordenId` gets `assertUuid()`, but `orderLine` (also a UUID FK that is interpolated into the request body) is only validated by the Zod schema in the form. The mutation-layer guard is inconsistent with every other mutation in this feature.

**MEDIUM — confirmarOrden error silently swallowed**: `handleConfirmar` in `OrdenDetailPage` uses a plain `onError` with no `isNetworkError` guard and no visible error feedback in the network-error case — but the main issue is that error messages from the server are never surfaced. Generic "Error al confirmar la orden" is shown regardless of HTTP status, including 403, which may mask backend auth errors.

**LOW — `expectedUnitCost` visible in OrdenCreatePage / OrdenEditInitiatedPage for any admin**: Not a concern for vendedor since those pages redirect non-admins. Field exposure is correctly gated.

**INFO — `isCerrarOrden422` type guard is structurally minimal**: Only checks for `discrepancias` array presence; `justificacionRequerida` and `umbral` are not asserted. If the backend ever changes the 422 shape, `umbral` could be `undefined` and `(umbral * 100).toFixed(0)` in the dialog would render "NaN%". Not a security issue but worth noting for robustness.

**Why:** Primary risk surface was the recepcionar flow — role gate was incomplete. All other admin-only actions (create, edit, confirmar, cerrar) were correctly gated. UUID assertUuid coverage was nearly complete except for `orderLine`.

**How to apply:** In compras audits, the recepcionar path is the operational-risk hotspot because it writes inventory cost. Always check both the page-level Navigate guard AND the mutation-layer assertUuid calls.
