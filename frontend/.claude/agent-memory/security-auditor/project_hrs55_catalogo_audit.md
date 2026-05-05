---
name: HRS-55 Catalogo audit findings
description: Security findings from the tienda/catalogo feature audit on 2026-05-04 — role enforcement gaps, monetary field exposure, unsanitized URL params
type: project
---

Key findings for the HRS-55 Tienda catalogo feature:

**HIGH — avgCost exposed to vendedor via ProductoDetailPage API response**: `ProductoDetailPage` guards rendering of `salePrice`/`avgCost` badges with `isAdmin`, but the full `Product` object (including `avgCost`) is still fetched and present in the React Query cache for any authenticated user who reaches that page. Server must filter the field; the client guard is not sufficient.

**HIGH — Unsanitized UUID path params in URL construction**: `getProductoQuery.ts`, `getProveedorQuery.ts`, `updateProductoMutation.ts`, `updateProveedorMutation.ts`, `associateProveedorMutation.ts`, `removeProveedorMutation.ts` all interpolate `id` / `productoId` / `supplierId` directly into template literals (`\`${TIENDA_API.PRODUCTOS}${id}/\``). The values come from `useParams()` or from the React Query cache/component state. No UUID format validation exists before the HTTP call.

**MEDIUM — ProveedorPanel fetches all suppliers (pageSize=200) regardless of role**: `ProveedorPanel.tsx` calls `useGetProveedoresQuery({ pageSize: 200 })` unconditionally. The add/remove UI is gated by `isAdmin`, but the full supplier list is fetched and cached for any user who views the detail page, including vendedores.

**MEDIUM — salePrice schema allows arbitrarily large monetary values**: `productoSchema` only checks `> 0` with no upper bound. A value like `9999999999.99` would pass validation and be sent to the API.

**LOW — `contact` field on Supplier has no format validation**: Free-form text up to 1000 characters, not validated for email format even when used as an email field.

**Why:** These were the load-bearing findings — everything else was clean (no dangerouslySetInnerHTML, no secrets in VITE_ vars, no localStorage writes in this feature, no client-side IDOR filtering).

**How to apply:** In future audits of this codebase, the primary risk surface is the client-side role guard pattern (isAdmin gating renders but not data fetching). Always trace what the API returns vs. what is rendered.
