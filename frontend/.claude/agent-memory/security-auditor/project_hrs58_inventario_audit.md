---
name: HRS-58 Inventario audit findings
description: Security findings from the tienda/inventario feature audit on 2026-05-04 — role enforcement gaps, UUID validation coverage, cost field access
type: project
---

Key findings for the HRS-58 Tienda inventario (stock + ajustes) feature:

**HIGH — AjusteFormPage and AjusteListPage: admin gate is post-hook (data fetched before redirect)**: Both pages call `useGetProductosQuery` (pageSize=200) and `useGetAjustesQuery` unconditionally before the `if (!isAdmin)` Navigate guard. React Query fires the request on mount; the guard renders after. A vendedor momentarily fetches the full product list and the paginated ajustes (inventory movements with unitCost). The `AjusteListPage` query has no `enabled: isAdmin` guard.

**HIGH — StockPage exposes admin-only total stock breakdown to vendedor via branch condition, not API scope**: `useGetStockTotalQuery` is called with `enabled: isAdmin && isValidId`; `useGetStockQuery` with `enabled: !isAdmin && isValidId`. The enabled flag is correct. However, the admin total stock endpoint (`/stock/total/`) returns a `StockTotal` that includes full location-level quantity breakdown — the backend must enforce this, not just the client `enabled` flag. The client-side guard is correct pattern-wise but should be noted as relying on server enforcement.

**MEDIUM — `location` UUID in AjusteFormPage is a free-text input validated only by Zod schema, not assertUuid()**: The `ajusteSchema` applies the UUID regex to `location` before the mutation fires, which is correct. However unlike `product` (which is selected from a server-controlled Autocomplete), `location` is typed raw by the user. The schema-level regex is the only guard; there is no `assertUuid()` call at the mutation layer (consistent with how other features handle form-validated UUIDs, but inconsistent with the mutation-layer pattern from compras). Low operational risk since Zod blocks invalid values before the mutation fires.

**LOW — ReabastecimientoPage: productIds in FromReplenishmentInput not validated with assertUuid()**: The `selectedIds` array is built from `item.product.id` values returned by the server's reabastecimiento endpoint. Since the values originate from an API response (not user input), the risk is low — a compromised API would already have control. However, the mutation-layer assertUuid pattern used elsewhere is absent here.

**INFO — No dangerouslySetInnerHTML, no console/localStorage sensitive data logging, no new VITE_ secrets, no JSON.parse without typing found in this feature.**

**INFO — api.ts additions (AJUSTES, ORDENES_DESDE_REABASTECIMIENTO) are static string constants; no interpolation at the constants level.**

**Why:** The primary risk surface mirrors the catalogo pattern: React Query hooks called before the isAdmin guard fires. Hooks should be called with `enabled: isAdmin` to suppress the network call entirely for non-admin users, not just after rendering.

**How to apply:** In future inventario audits, check that every `useGet*Query` in admin-only pages passes `enabled: isAdmin` directly into the query hook. The Navigate guard is insufficient on its own because React hooks fire before rendering.
