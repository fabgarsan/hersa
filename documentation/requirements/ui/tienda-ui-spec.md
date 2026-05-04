# UI Specification — Módulo Tienda
**Version:** 1.0
**Date:** 2026-05-04
**Prepared by:** ui-designer (Jose)
**Source UX spec:** `documentation/requirements/ux/tienda-ux-spec.md` v1.2
**Source functional spec:** `documentation/requirements/tienda-especificaciones-funcionales.md` v1.3
**Source PM:** `documentation/requirements/pm/tienda-pm-document.md` v1.1
**Brand references:** `documentation/brand/brand-manual.md` v1.0 · `documentation/brand/digital-guidelines.md` v1.0 · `documentation/brand/tone-of-voice.md` v1.0
**Implementation target:** React 19 + TypeScript + MUI v6 + react-hook-form + React Query

---

## Visual Context Declaration

The Tienda module is a **B2B institutional surface** throughout — both roles (`tienda_admin` and `tienda_vendedor`) are internal operational users. There is no B2C student-facing content in this module.

- Playfair Display: **not used anywhere in this module**
- Typography: **Inter exclusively** at all levels
- Color dominance: Marino Hersa `#0B1F3A` as structural anchor; Gris Claro `#F5F5F5` as application background
- Photography: no photographic backgrounds in this module
- Overlay rule: not applicable (no photo backgrounds)
- Tone: B2B — functional, precise, action-oriented copy throughout (see `tone-of-voice.md §3`)

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Component Inventory](#2-component-inventory)
3. [Per-Screen Specification](#3-per-screen-specification)
4. [Design System Core](#4-design-system-core)
5. [Accessibility Guide](#5-accessibility-guide)
6. [React Implementation Notes](#6-react-implementation-notes)

---

## 1. Design Tokens

All tokens derive directly from `brand-manual.md §1–2` and `digital-guidelines.md §2–4`. No new color values are introduced outside the established brand system. Every key maps to a valid MUI theme configuration key.

### 1.1 Color Tokens

| Token key (MUI theme path) | Hex value | Role in Tienda |
|---|---|---|
| `palette.primary.main` | `#0B1F3A` | AppBar, sidebar, table headers, primary buttons |
| `palette.primary.dark` | `#122640` | Sidebar background, drawer surface |
| `palette.primary.light` | `#1E3A5F` | Hover state on primary elements, focused borders |
| `palette.secondary.main` | `#C9A227` | Active nav icons, selected state accents, CTA emphasis |
| `palette.secondary.light` | `#E8D49A` | Hover on gold elements, low-emphasis chips |
| `palette.secondary.dark` | `#A07B10` | Pressed/active state on gold elements |
| `palette.background.default` | `#F5F5F5` | Application-level page background |
| `palette.background.paper` | `#FFFFFF` | Cards, modals, table surfaces, form panels |
| `palette.text.primary` | `#1A1A1A` | All primary body text on light backgrounds |
| `palette.text.secondary` | `#5F5E5A` | Labels, metadata, secondary descriptions |
| `palette.success.main` | `#3B6D11` | Delivered, active, confirmed states |
| `palette.success.light` | `#EAF3DE` | Success chip backgrounds |
| `palette.warning.main` | `#854F0B` | Pending, in-progress, sobrante cash alert |
| `palette.warning.light` | `#FAEEDA` | Warning chip backgrounds, amber banners |
| `palette.error.main` | `#A32D2D` | Error states, faltante cash alert (red) |
| `palette.error.light` | `#FCEBEB` | Error chip backgrounds, inline error areas |
| `palette.info.main` | `#185FA5` | Informational neutral alerts |
| `palette.info.light` | `#E6F1FB` | Info banner backgrounds |

**Special token — cash alert states (Tienda-specific semantic):**

| Alert type | Color token | Background token | Label |
|---|---|---|---|
| `faltante` (dinero < revenue) | `palette.error.main` | `palette.error.light` | Chip: "FALTANTE" · Banner: red |
| `sobrante` (dinero > revenue) | `palette.warning.main` | `palette.warning.light` | Chip: "SOBRANTE" · Banner: amber |
| `ok` (dinero = revenue) | `palette.success.main` | `palette.success.light` | No badge shown |

### 1.2 WCAG AA Contrast Ratios

All text/background pairs used in this module. Ratios sourced from `digital-guidelines.md §2`.

| Text color | Background | Ratio | WCAG AA |
|---|---|---|---|
| `#FFFFFF` on `#0B1F3A` | AppBar, sidebar, table headers | 14.7:1 | Pass |
| `#C9A227` on `#0B1F3A` | Gold icons on dark, nav accent | 5.8:1 | Pass |
| `#0B1F3A` on `#FFFFFF` | Primary text on cards/modals | 14.7:1 | Pass |
| `#0B1F3A` on `#F5F5F5` | Primary text on page background | 12.6:1 | Pass |
| `#5F5E5A` on `#FFFFFF` | Secondary text on white | 5.9:1 | Pass |
| `#FFFFFF` on `#A32D2D` | Error button text | 4.8:1 | Pass |
| `#1A1A1A` on `#FAEEDA` | Warning banner body text | 9.1:1 | Pass |
| `#1A1A1A` on `#FCEBEB` | Error banner body text | 8.6:1 | Pass |
| `#1A1A1A` on `#EAF3DE` | Success banner body text | 10.2:1 | Pass |
| `#1A1A1A` on `#E6F1FB` | Info banner body text | 9.8:1 | Pass |
| `#3B6D11` on `#EAF3DE` | Success chip (text on background) | 4.7:1 | Pass |
| `#854F0B` on `#FAEEDA` | Warning chip (text on background) | 4.5:1 | Pass |
| `#A32D2D` on `#FCEBEB` | Error chip (text on background) | 4.6:1 | Pass |

### 1.3 Typography Tokens

Playfair Display is absent from this module. Inter is used exclusively.

| Token key (MUI theme path) | Font | Weight | Size | Line-height | Use in Tienda |
|---|---|---|---|---|---|
| `typography.fontFamily` | Inter | — | — | — | Global font family |
| `typography.h1` | Inter | 600 | 32px | 1.3 | Page-level headings (desktop admin) |
| `typography.h2` | Inter | 600 | 24px | 1.4 | Section headings, panel titles |
| `typography.h3` | Inter | 500 | 20px | 1.4 | Card titles, subsection labels |
| `typography.h4` | Inter | 500 | 16px | 1.5 | Widget titles, group labels |
| `typography.body1` | Inter | 400 | 16px | 1.6 | Primary body text |
| `typography.body2` | Inter | 400 | 14px | 1.6 | Secondary text, form descriptions |
| `typography.caption` | Inter | 400 | 12px | 1.5 | Timestamps, metadata, helper text |
| `typography.button` | Inter | 500 | 14px | — | Button labels — `textTransform: none` |

**Mobile typography adjustments (xs breakpoint, < 600px):**

| Level | Desktop size | Mobile size |
|---|---|---|
| h1 | 32px | 24px |
| h2 | 24px | 20px |
| h3 | 20px | 18px |

### 1.4 Spacing Tokens

Based on 8px grid from `digital-guidelines.md §4`.

| Token | Value | MUI theme key | Use |
|---|---|---|---|
| xs | 4px | `spacing(0.5)` | Icon-to-text gap, badge padding |
| sm | 8px | `spacing(1)` | Chip internal padding, row gaps |
| md | 16px | `spacing(2)` | Card internal padding, form field spacing |
| lg | 24px | `spacing(3)` | Section separation, panel margins |
| xl | 32px | `spacing(4)` | Page section separation |
| xxl | 48px | `spacing(6)` | Page margins (desktop), major block gaps |

### 1.5 Border Radius Tokens

| Token | Value | MUI theme key | Use |
|---|---|---|---|
| `shape.borderRadius` | 8px | `shape.borderRadius` | Cards, modals, panels |
| Chip radius | 16px | MUI Chip default | Status chips |
| Button radius | 4px | MUI Button default | All button variants |
| Input radius | 4px | MUI TextField default | Form inputs |

### 1.6 Shadow Tokens

Per `digital-guidelines.md §5` — no pronounced shadows; elevation communicates depth only at modal level.

| Use | Value | MUI elevation |
|---|---|---|
| Cards (resting) | `none` + `border: 1px solid rgba(0,0,0,0.08)` | `elevation={0}` |
| Cards (hover) | `border: 1px solid #1E3A5F` | `elevation={0}` + border override |
| Modals/Dialogs | `0 8px 32px rgba(0,0,0,0.16)` | `elevation={8}` |
| Inline banners | `none` | `elevation={0}` |

### 1.7 Transition Tokens

From `digital-guidelines.md §8`. `prefers-reduced-motion` must be respected globally.

| Type | Duration | Easing | Use |
|---|---|---|---|
| Micro-interaction | 150ms | ease-out | Hover/focus on buttons, fields, icons |
| State transition | 250ms | ease-in-out | Drawers, modals, collapse/expand |
| Page navigation | 300ms | ease-in-out | Route changes |

**Section 1 complete.**

---

## 2. Component Inventory

All components use MUI v6 as the base. Every component lists all five states: default, hover, active, disabled, error.

### 2.1 Navigation Components

#### NavSidebar (Admin — Desktop)
- MUI base: `Drawer` (variant="permanent") + `List` + `ListItemButton`
- Background: `palette.primary.dark` (`#122640`)
- Text/icons: `#FFFFFF` default, `palette.secondary.main` when active
- Width: 240px (lg+), collapsible to 64px icon-only on md
- States:
  - **Default:** icon + label, white text
  - **Hover:** background `rgba(255,255,255,0.08)`, transition 150ms ease-out
  - **Active (selected):** left border 3px solid `#C9A227`, background `rgba(201,162,39,0.12)`, text `#C9A227`
  - **Disabled:** not applicable — nav items are role-gated, absent for unauthorized roles
  - **Error:** not applicable

#### BottomTabBar (Vendedor — Mobile)
- MUI base: `BottomNavigation` + `BottomNavigationAction`
- Background: `#FFFFFF`, border-top: `1px solid rgba(0,0,0,0.08)`
- Icon color default: `palette.text.secondary` (`#5F5E5A`)
- Label + icon color active: `palette.primary.main` (`#0B1F3A`)
- Tabs: Apertura · Reposición · Cierre · Stock
- States:
  - **Default:** gray icon, gray label, 12px caption
  - **Hover:** icon transitions to `#0B1F3A`, 150ms ease-out
  - **Active:** `#0B1F3A` icon + label, no indicator dot
  - **Disabled:** opacity 0.38, no interaction
  - **Error:** not applicable

#### AppBar
- MUI base: `AppBar` (position="fixed") + `Toolbar`
- Background: `palette.primary.main` (`#0B1F3A`)
- Logo: `LogoHersa.png` reduced variant (icon only) on xs, horizontal on md+
- Height: 64px desktop, 56px mobile
- All text/icons on AppBar: `#FFFFFF`

### 2.2 Data Display Components

#### DataTable (Admin — Desktop)
- MUI base: `Table` + `TableHead` + `TableBody` + `TableRow` + `TableCell` + `TablePagination`
- Header row: background `palette.primary.main`, text `#FFFFFF`, Inter 500 14px
- Body rows: alternating white / `#F5F5F5`
- Row hover: background `rgba(11,31,58,0.04)`, transition 150ms ease-out
- Cell padding: 12px vertical, 16px horizontal
- Numbers aligned right
- States:
  - **Default:** as described
  - **Hover (row):** subtle tint as above
  - **Active (selected row):** background `rgba(201,162,39,0.08)`, left border indicator `#C9A227` 2px
  - **Disabled:** not applicable at row level — disabled cells use opacity 0.5
  - **Error:** not applicable at table level — errors shown in inline banner above table

#### StatusChip
- MUI base: `Chip` (size="small")
- Uses `color` prop with semantic palette only — no custom colors
- Variants per order/jornada status:

| Status | color prop | Background | Text |
|---|---|---|---|
| `iniciada` | custom | `#F5F5F5` | `#5F5E5A` |
| `pendiente` | `info` | `#E6F1FB` | `#185FA5` |
| `parcialmente_recibida` | `warning` | `#FAEEDA` | `#854F0B` |
| `cerrada` | `success` | `#EAF3DE` | `#3B6D11` |
| `abierta` (jornada) | `success` | `#EAF3DE` | `#3B6D11` |
| `activo` (producto) | `success` | `#EAF3DE` | `#3B6D11` |
| `inactivo` (producto) | custom | `#F5F5F5` | `#5F5E5A` |
| `FALTANTE` (caja) | `error` | `#FCEBEB` | `#A32D2D` |
| `SOBRANTE` (caja) | `warning` | `#FAEEDA` | `#854F0B` |
| `ya cubierto` | custom | `#F5F5F5` | `#5F5E5A` |

- States:
  - **Default:** as above
  - **Hover:** not interactive by default; if clickable (filter chip), `box-shadow: 0 1px 3px rgba(0,0,0,0.12)`
  - **Active:** filled background more opaque, applied on filter chip selection
  - **Disabled:** opacity 0.5
  - **Error:** not applicable

#### InlineAlertBanner
- MUI base: `Alert` (variant="filled" or "standard")
- Used for: cash discrepancy, draft order warning, no-jornada blocking, stock warnings
- Severity mapping:
  - `error`: faltante cash, stock zero, validation failure
  - `warning`: sobrante cash, draft order reminder, Tienda stock without jornada
  - `info`: empty supplier hint, initiated-order explanation, contextual hints
  - `success`: not used as banner (snackbar only for success)
- Border radius: 8px
- States:
  - **Default:** as rendered by MUI Alert with Hersa palette overrides
  - **Hover:** not interactive
  - **Active:** not applicable
  - **Disabled:** not applicable
  - **Error:** the component itself is the error state

#### ReadOnlyBadge (avg_cost display)
- Custom: `Box` with `Typography` caption + `Chip` variant="outlined"
- Color: `palette.text.secondary`
- Pattern: "Costo promedio (calculado automáticamente)" label above, value in outlined chip
- Not a form input — never renders as TextField

#### EmptyState
- Custom: `Box` (centered) + `Typography` body1 + `Button` (contained primary)
- Illustration: none in v1 (text-only per PM scope)
- Min-height: 200px
- States: single state — static display

### 2.3 Form Components

#### FormTextField
- MUI base: `TextField` (variant="outlined", fullWidth)
- Label: always visible above field (never placeholder-only)
- Helper text: used for contextual hints below field
- Error text: descriptive, below field, never just red border
- States:
  - **Default:** border `rgba(0,0,0,0.23)`, label `palette.text.secondary`
  - **Hover:** border darkens to `rgba(0,0,0,0.45)`, 150ms ease-out
  - **Active (focused):** border `palette.primary.main`, label `palette.primary.main`
  - **Disabled:** background `rgba(0,0,0,0.04)`, opacity 0.7, no interaction
  - **Error:** border `palette.error.main`, label `palette.error.main`, helper text in error color with description

#### FormSelect
- MUI base: `Select` (within `FormControl`) + `MenuItem`
- Same states as FormTextField
- Loading state: skeleton overlay on MenuItem list
- Empty results: `MenuItem` disabled with hint text

#### NumericInput
- MUI base: `TextField` (type="number", inputProps: { min: 0 })
- Mobile: `inputMode="numeric"` triggers numeric keyboard
- Touch target: minimum 44px height on mobile
- States: identical to FormTextField

#### MonetaryInput
- MUI base: `TextField` with `InputAdornment` (startAdornment="$")
- Admin-only — never rendered for `tienda_vendedor` role
- Visibility rule: component is conditionally rendered, not hidden with CSS
- States: identical to FormTextField

#### RadioGroupLarge
- MUI base: `RadioGroup` + custom `FormControlLabel` with styled `Radio`
- Used for: ENTRADA/SALIDA direction in AJUSTE-FORM
- Each option rendered as a full-width card-like container: `Paper` elevation={0} + border + `Radio` + `Typography`
- Selected: border changes to `palette.primary.main` 2px
- States:
  - **Default:** border `rgba(0,0,0,0.12)`, white background
  - **Hover:** border `palette.primary.light`, background `rgba(11,31,58,0.04)`
  - **Active (selected):** border `palette.primary.main`, background `rgba(11,31,58,0.06)`
  - **Disabled:** opacity 0.5
  - **Error:** border `palette.error.main`

#### Toggle (activo/inactivo product)
- MUI base: `Switch` (color="primary") + `FormControlLabel`
- Helper text below switch explains consequence
- States:
  - **Default (OFF):** track gray, thumb white
  - **Hover:** track slightly darker
  - **Active (ON):** track `palette.primary.main`
  - **Disabled:** opacity 0.38
  - **Error:** not applicable

#### InlineRowForm (PATTERN-IMR-01 implementation)
- Custom compound component — see Section 6.4 for implementation notes
- Desktop: `Table` with editable cells using embedded `TextField` components
- Mobile: vertical stacked `Card` per row
- States per row:
  - **Default:** editable fields active
  - **Hover:** row background `rgba(11,31,58,0.02)`
  - **Active (focused cell):** border on focused input highlights to `palette.primary.main`
  - **Disabled (already processed row):** all fields `disabled`, row opacity 0.6, "Ya recibida completamente" label
  - **Error:** field-level error shown inline within the row; row does not scroll to top

### 2.4 Action Components

#### PrimaryButton
- MUI base: `Button` (variant="contained", color="primary")
- Background: `palette.primary.main`, text: `#FFFFFF`
- Hover: background `palette.primary.light` (`#1E3A5F`)
- Loading state: `CircularProgress` size={16} inside button, button disabled
- States:
  - **Default:** `#0B1F3A` background, white text
  - **Hover:** `#1E3A5F` background, 150ms ease-out
  - **Active (pressed):** `#122640` background
  - **Disabled:** opacity 0.38, no shadow
  - **Error:** not applicable (button itself does not have error state)

#### SecondaryButton
- MUI base: `Button` (variant="outlined", color="primary")
- Border: `palette.primary.main`, text: `palette.primary.main`
- States:
  - **Default:** outlined border, primary text
  - **Hover:** background `rgba(11,31,58,0.04)`
  - **Active:** background `rgba(11,31,58,0.08)`
  - **Disabled:** opacity 0.38
  - **Error:** not applicable

#### DestructiveButton
- MUI base: `Button` (variant="outlined", color="error")
- Used for: delete supplier association, cancel with consequences
- States:
  - **Default:** border `palette.error.main`, text `palette.error.main`
  - **Hover:** background `rgba(163,45,45,0.04)`
  - **Active:** background `rgba(163,45,45,0.08)`
  - **Disabled:** opacity 0.38
  - **Error:** not applicable

#### StickyFooterAction (Mobile)
- Custom: `Box` (position="fixed", bottom=0) + `Button` (fullWidth, contained primary)
- Background: `#FFFFFF` with border-top `1px solid rgba(0,0,0,0.08)`
- Padding: 12px 16px
- Clears BottomTabBar height (56px) via `bottom: 56px` when both present
- States: same as PrimaryButton

#### ConfirmationDialog
- MUI base: `Dialog` + `DialogTitle` + `DialogContent` + `DialogActions`
- Max-width: `sm` (600px)
- Title: Inter 600 20px, `palette.text.primary`
- Actions: `SecondaryButton` left, `PrimaryButton` right (or `DestructiveButton` for destructive confirms)
- States:
  - **Default:** open modal
  - **Hover:** buttons follow their own hover states
  - **Active:** submit button shows loading spinner
  - **Disabled:** submit button disabled until required field (e.g., justification) is filled
  - **Error:** field-level error within dialog

### 2.5 Feedback Components

#### SkeletonLoader
- MUI base: `Skeleton` (variant="rectangular" or "text")
- Used for: table rows (3 placeholder rows), form fields, card content
- Animation: `animation="wave"`, color `rgba(0,0,0,0.06)`
- Height matches expected content height

#### SuccessSnackbar / ErrorSnackbar
- MUI base: `Snackbar` + `Alert`
- Position: `bottom-center` on mobile (xs), `bottom-right` on desktop (md+)
- Duration: 4000ms auto-dismiss
- Success: `severity="success"`, Inter 400 14px
- Error: `severity="error"`, with retry action when applicable
- States:
  - **Default:** slide-in animation 250ms ease-in-out
  - **Hover:** not interactive (auto-dismiss)
  - **Active:** "Intentar de nuevo" action button if present
  - **Disabled:** not applicable
  - **Error:** error variant is the error state

#### ProgressIndicator (PATTERN-IMR-01)
- Custom: sticky `Box` at bottom of scrollable list
- Content: "N de M productos completados" — Inter 400 14px, `palette.text.secondary`
- Sticky via `position: sticky; bottom: 72px` (above StickyFooterAction)

**Section 2 complete.**

---

## 3. Per-Screen Specification

### Visual Declaration per Screen Group

All screens in this module:
- Surface type: B2B institutional
- Playfair Display: never used
- Color dominant: `#0B1F3A` structural, `#F5F5F5` background
- No photographic content

---

### 3.1 PROD-LIST — Product List (Admin · Desktop-first)

**Layout**
- Breakpoints: md+ (sidebar visible, full table); xs-sm (sidebar collapsed, table scrolls horizontally)
- Grid: 12-col MUI Grid; content area fills remaining width after 240px sidebar
- Page padding: 32px (xl) on lg+, 24px (lg) on md, 16px (md) on mobile

**Visual Hierarchy**
- Page title: "Productos" — Inter 600 32px, `palette.text.primary`
- Breadcrumb: "Tienda > Catálogo > Productos" — Inter 400 12px, `palette.text.secondary`
- Search bar: full-width on mobile, 360px on desktop, above table left-aligned
- Filter chips: "Todos | Activos | Inactivos" — right of search on desktop, below search on mobile
- CTA: "+ Nuevo producto" — `PrimaryButton`, top-right on desktop

**Table columns (Admin view)**

| Column | Width | Alignment | Typography |
|---|---|---|---|
| Nombre | 25% | Left | Inter 500 14px, `#1A1A1A` |
| Unidad | 10% | Left | Inter 400 14px |
| Precio venta | 12% | Right | Inter 400 14px (admin only — absent for vendedor) |
| Costo prom. | 12% | Right | Inter 400 14px (admin only — absent for vendedor) |
| Pto. reorden | 10% | Right | Inter 400 14px |
| Sugerido | 10% | Right | Inter 400 14px |
| Estado | 11% | Center | `StatusChip` |
| Acciones | 10% | Center | `Button` text variant |

- Inactive products: row opacity 0.65, `StatusChip` "INACTIVO" in gray — visible to admin, absent for vendedor
- Warning indicator: if CENTRAL stock below punto_reorden, show `⚠` icon `WarningAmber` color `palette.warning.main` next to the pto. reorden value (visible on STOCK-ADMIN; on PROD-LIST only the numeric value is shown)
- Pagination: MUI `TablePagination`, 20 rows/page default

**Micro-interactions**
- Row hover: background `rgba(11,31,58,0.04)`, 150ms ease-out
- Filter chip selection: border `palette.primary.main`, background `rgba(11,31,58,0.08)`, 150ms ease-out
- Search input focus: border `palette.primary.main`, 150ms ease-out

**Screen states**
- Loading: 3 skeleton rows, 48px height each, matching column widths
- Empty: centered `EmptyState` — "Todavía no hay productos. Crea el primero." + `PrimaryButton` "Nuevo producto"
- With data: table as described
- Error: `InlineAlertBanner` severity="error" above table — "No se pudieron cargar los productos. Intenta de nuevo." + retry `Button` text variant

**Iconography:** MUI Material Icons — `Search`, `Add`, `Edit`, `Visibility`, `FilterList`

---

### 3.2 PROD-FORM — Create / Edit Product (Admin · Desktop-first)

**Layout**
- Single-column form, max-width 720px, centered in content area
- Page padding: xl (32px) on lg+, md (16px) on mobile

**Visual Hierarchy**
- Page title: "Nuevo producto" / "Editar producto" — Inter 600 32px
- Breadcrumb: Tienda > Catálogo > Productos > [action]
- Form section heading: "Información del producto" — Inter 600 24px with `Divider` below
- Field order (information hierarchy from UX spec §3.4):
  1. `nombre` — `FormTextField`, fullWidth, required
  2. `descripcion` — `FormTextField`, multiline rows={2}, optional
  3. `unidad` — `FormSelect` (options: unidad, bolsa, caja, paquete, litro), required
  4. `precio_venta` — `MonetaryInput`, required, admin-only
  5. `punto_reorden` — `NumericInput`, required, suffix "unidades"
  6. `cantidad_sugerida_pedido` — `NumericInput`, optional, suffix "unidades"

- Estado section (separated by Divider):
  - `activo` — `Toggle`, label "Activo", helper text: "Los productos inactivos no aparecen en el traslado de apertura ni en la reposición."
  - Default: ON for new products

- avg_cost section (below Estado, above actions):
  - `ReadOnlyBadge` — label: "Costo promedio (calculado automáticamente por el sistema)", value: "0.00" on create, actual value on edit
  - Background: `palette.info.light` pill, Inter 400 14px, `palette.text.secondary`
  - Never rendered as editable input

- Form actions: `SecondaryButton` "Cancelar" left, `PrimaryButton` "Crear producto" / "Guardar cambios" right — 16px gap

**Micro-interactions**
- Field focus: border `palette.primary.main`, label lifts and colorizes, 150ms
- Validation: field-level error text appears on blur (not on keystroke)
- Submit loading: PrimaryButton shows `CircularProgress` size={16}, all fields `disabled`

**Confirmation dialog — deactivate with stock**
- Triggered when: toggle switches to inactive AND product has stock in CENTRAL or Tienda
- Title: "Producto con inventario existente"
- Body: "Este producto tiene X unidades en inventario. Desactivarlo lo eliminará del traslado de apertura. ¿Continuar?"
- Actions: `SecondaryButton` "Cancelar", `PrimaryButton` "Desactivar de todas formas"

**Iconography:** `ToggleOn`, `ToggleOff`, `Info`

---

### 3.3 PROD-DETAIL — Product Detail + Supplier Association (Admin · Desktop-first)

**Layout**
- Two-column on lg+ (product info left 60%, supplier panel right 40%)
- Single-column stacked on md and below

**Visual Hierarchy**
- Product name: Inter 600 32px, `palette.text.primary`
- `StatusChip` "ACTIVO" / "INACTIVO" — inline right of name on desktop, below name on mobile
- Meta row: "Unidad: unidad · Precio de venta: $1,500 · Costo promedio: $800" — Inter 400 14px, `palette.text.secondary` · admin-only fields
- Description: Inter 400 16px, `palette.text.primary`
- `SecondaryButton` "Editar producto" — top-right of product section

**Supplier panel**
- Section heading: "Proveedores asociados" — Inter 600 24px with Divider
- Hint text (when 0 suppliers): `InlineAlertBanner` severity="info" — "Los productos sin proveedor asociado no aparecerán al crear una orden de compra."
- Supplier list: `List` with `ListItem` — supplier name Inter 500 14px, `DestructiveButton` text variant "Eliminar asociación" right-aligned
- "Asociar proveedor" action: `SecondaryButton` at bottom of list
- Duplicate error: `InlineAlertBanner` severity="error" inline below list — "Este proveedor ya está asociado a este producto"

**Adjustment history link**
- `Button` variant="text", color="primary" — "Ver historial de ajustes de inventario →"
- Border-top Divider above

**Iconography:** `Edit`, `PersonAddAlt1`, `PersonRemove`, `History`, `CheckCircle`, `Cancel`

---

### 3.4 PROV-LIST — Supplier List (Admin · Desktop-first)

**Layout**
- Same page structure as PROD-LIST
- Simpler table: 3 data columns + actions

**Table columns**

| Column | Width | Alignment |
|---|---|---|
| Nombre | 35% | Left |
| Contacto | 40% | Left |
| Productos asociados | 15% | Right |
| Acciones | 10% | Center |

- No pagination needed unless >20 suppliers — MUI TablePagination if required

**Screen states:** same pattern as PROD-LIST

**Iconography:** `Search`, `Add`, `Edit`, `Visibility`

---

### 3.5 PROV-FORM — Create / Edit Supplier (Admin · Desktop-first)

**Layout**
- Single-column, max-width 480px (simpler form)
- Field order: `nombre` (required), `contacto` (multiline, rows={3}, optional)
- Helper text on contacto: "Puedes incluir teléfono, correo o cualquier nota de contacto."
- Actions: same pattern as PROD-FORM

---

### 3.6 ORDER-LIST — Purchase Order List (Admin · Desktop-first)

**Layout**
- Same structure as PROD-LIST
- Filter chips (status-based, not active/inactive): "Todas | Iniciada | Pendiente | Parcialmente recibida | Cerrada"

**Table columns**

| Column | Width | Alignment | Note |
|---|---|---|---|
| # | 8% | Left | Order number |
| Proveedor | 22% | Left | Supplier name or "(sin proveedor)" for initiated |
| Fecha pedido | 12% | Left | DD/MM/AAAA |
| Estado | 18% | Center | `StatusChip` |
| Líneas | 8% | Right | Count |
| Acciones | 10% | Center | `Button` text |

- Initiated orders: "Borrador · hace N días" — Inter 400 12px `palette.text.secondary` below status chip
- Default filter view: all non-closed orders visible

**Iconography:** `Add`, `FilterList`, `Visibility`, `Edit`

---

### 3.7 ORDER-CREATE — Create Purchase Order (Admin · Desktop-first)

**Layout**
- Single-column, max-width 800px (wider to accommodate order lines table)

**Visual Hierarchy**
- Section 1: "Orden de compra" header fields
  - `proveedor` — `FormSelect`, required, full-width, triggers product filter
  - `fecha_pedido` — `FormTextField` type="date", required, Colombian format DD/MM/AAAA
  - `notas` — `FormTextField` multiline rows={2}, optional

- Section 2: "Líneas del pedido" — Divider + heading Inter 600 24px
  - "+ Agregar producto" — `SecondaryButton` at top-right of section
  - Hint text below header: "¿No encuentras el producto? Verifica que esté asociado a este proveedor en el catálogo." — Inter 400 12px, `palette.info.main`

**Order lines table**

| Column | Width | Component |
|---|---|---|
| Producto | 35% | `FormSelect` filtered by supplier |
| Cant. pedida | 20% | `NumericInput`, suffix "unidades" |
| Costo unitario esperado | 30% | `MonetaryInput` |
| Eliminar | 15% | `IconButton` (`DeleteOutline` icon) |

- "No products found" empty state: `InlineAlertBanner` severity="info" within the table area
- Min 1 line required (validation blocks submit)

**Micro-interactions**
- Supplier selection triggers product list reload: show `SkeletonLoader` in Producto select column
- Add line: new row slides in 250ms ease-in-out

**Iconography:** `DeleteOutline`, `Add`, `ShoppingCart`

---

### 3.8 ORDER-DETAIL — Purchase Order Detail (Admin · Desktop-first)

**Layout**
- Single-column, max content width 960px

**Visual Hierarchy**
- Order header: supplier name Inter 600 24px + `StatusChip` inline right
- Metadata: "Fecha: DD/MM/AAAA · Notas: [text]" — Inter 400 14px, `palette.text.secondary`

- "Iniciada" state banner: `InlineAlertBanner` severity="warning" — "Esta orden está en borrador. Completa el proveedor y todas las líneas, luego confirma para activarla." — shown only when status = `iniciada`

**Lines table (order lines)**

| Column | Alignment | Note |
|---|---|---|
| Producto | Left | Inter 500 14px |
| Pedido | Right | qty |
| Recibido | Right | qty, cumulative |
| Pendiente | Right | qty |
| Costo esp. | Right | admin-only |
| Estado | Center | `StatusChip` per line |

- "Recepcionar mercancía" — `PrimaryButton`, shown only for `pendiente` and `parcialmente_recibida` states
- Discrepancy close button: label changes to "Cerrar con justificación" when lines have delta > 5%; tooltip "Hay líneas con diferencia superior al umbral. Se solicitará justificación al confirmar."

**Reception history**
- Section heading: "Historial de recepciones" — Inter 600 20px with Divider
- List: `List` items — "DD/MM/AAAA HH:mm · [product] · N unidades · [location] · Costo real: $X (por [user])"
- Inter 400 14px, `palette.text.secondary`

**ORDER-CLOSE-CONFIRM modal**
- `ConfirmationDialog`, max-width="md" (800px) for table space
- Title: "Diferencia significativa detectada" — Inter 600 20px
- Body table: product name, pedido, recibido, diferencia (qty + %)
- Justification `FormTextField` multiline rows={3}, required, label "Justificación (obligatoria)"
- Submit button disabled until textarea has content; activates on first character

**Iconography:** `Inventory`, `ReceiptLong`, `CheckCircle`, `Warning`, `Close`

---

### 3.9 RECEP-FORM — Merchandise Reception (Admin · Desktop-first; Vendedor · Mobile-first)

**PATTERN-IMR-01 applies to this screen.**

**Desktop layout (Admin)**
- Full-page or wide drawer (width: 100vw − 240px sidebar) on top of ORDER-DETAIL
- Header: "Recepcionar mercancía" Inter 600 32px; breadcrumb; supplier + date + reference field

**Reference field**
- `FormTextField` fullWidth, label "Nro. factura / remisión", optional per UX spec

**Reception table (desktop)**
- 7-column table using `InlineRowForm` pattern
- Column widths: Producto 18%, Pedido 9%, Recibido 9%, Pendiente 9%, Buen estado 14%, Averiadas 14%, Costo real 18%, Destino (global, not per row — see below) — rendered below table

| Column | Component | Note |
|---|---|---|
| Producto | Static text, Inter 500 14px | Read-only |
| Pedido | Static text | Read-only, gray |
| Recibido | Static text | Read-only, gray |
| Pendiente | Static text | Read-only, emphasize in `palette.text.primary` |
| Buen estado | `NumericInput` | Required if row has any input |
| Averiadas | `NumericInput` | Default 0; helper text below |
| Costo real | `MonetaryInput` (admin) / `FormTextField` labeled "Costo por unidad (según factura/remisión)" (vendedor) | Pre-filled with expected cost for admin |

- Helper text for averiadas (inline per row, below field): "Las unidades dañadas quedan como avería y no se suman al inventario." — Inter 400 12px, `palette.text.secondary`
- Rows with 0 pending: all fields `disabled`, row opacity 0.6, label "Ya recibida completamente" centered across editable columns
- Virtualization: react-window `FixedSizeList` if order has more than 20 lines

**Destination selector (global, below table)**
- `RadioGroup` horizontal: "Almacén central (predeterminado)" · "Tienda (solo si hay jornada abierta)"
- Tienda option `disabled` when no open jornada, read-only text "Almacén central (predeterminado)"

**Mobile layout (Vendedor)**
- Full-screen, scrollable
- Each product = one vertical `Card` (Paper elevation=0, border `rgba(0,0,0,0.08)`)
- Card header: product name Inter 600 16px, "Pedido: N · Recibido: N · Pendiente: N" Inter 400 12px `palette.text.secondary`
- Card body: `NumericInput` "Unidades en buen estado", `NumericInput` "Unidades averiadas", `FormTextField` "Costo por unidad (según factura/remisión)"
- Averiadas helper text below its input
- StickyFooterAction: "Confirmar recepción" — clears BottomTabBar (bottom: 56px)
- Destination: `FormSelect` below all cards, above sticky footer

**Screen states (both layouts)**
- Loading: skeleton rows/cards
- Validation error: field-level red text within the row/card; no scroll to top
- All rows skipped: blocking `InlineAlertBanner` — "Debes registrar al menos una unidad en alguna línea para confirmar."
- Submit loading: "Confirmar recepción" shows spinner, all fields disabled, "Registrando recepción..." message replaces button text
- Network error: `ErrorSnackbar` + retry; form data preserved

**Iconography:** `Inventory2`, `CheckCircle`, `Warning`, `ArrowBack`

---

### 3.10 VEND-HOME — Vendedor Home (Vendedor · Mobile-first)

**Layout**
- Single-column, full-screen below AppBar and above BottomTabBar
- Padding: md (16px) all sides

**State: No jornada**
- Centered content: heading "Hoy no hay jornada abierta." — Inter 500 20px, `palette.text.primary`
- Full-width `PrimaryButton` "Abrir jornada" — large target, min-height 56px
- No monetary content, no monetary data

**State: Jornada abierta**
- Status indicator: `StatusChip` "ABIERTA" color="success" + "Iniciada a las HH:MM" Inter 400 14px `palette.text.secondary`
- Quick-action cards grid (2-col): "Reposición" + "Cierre de jornada"
  - Each card: `Paper` elevation=0, border, centered icon 32px + label Inter 500 16px
  - Min touch target: 80px height
- "Stock actual" — `Button` text variant below grid

**State: Jornada abierta sin traslado**
- `InlineAlertBanner` severity="warning" — "El traslado de apertura no se ha registrado. Hazlo ahora." + CTA `Button` text "Ir a apertura"

**Iconography:** `Store`, `AddShoppingCart`, `Inventory`, `CloseFullscreen`, `BarChart`

---

### 3.11 TRASLADO-APERTURA — Opening Transfer (Vendedor · Mobile-first; Admin · Desktop)

**PATTERN-IMR-01 applies to this screen.**

**Mobile layout**
- Page heading: "Traslado de apertura" Inter 600 24px
- Subheading: "Marca cuánto llevas hoy a la Tienda." — Inter 400 16px `palette.text.secondary`
- Hint: "Los campos vacíos o en cero no generan traslado." — Inter 400 12px `palette.text.secondary`

**Product list (mobile — cards)**
- Each product = stacked item: `Box` with border-bottom `1px solid rgba(0,0,0,0.08)`
- Product name: Inter 500 16px, `palette.text.primary`
- "Stock central: N" — Inter 400 12px, `palette.text.secondary` — displayed as context (quantities only, no cost)
- `NumericInput` "Cantidad", min-height 44px
- Preflight stock error: input border `palette.error.main`, helper text "Stock disponible en central: X unidades" `palette.error.main`
- Filled product: checkmark `CheckCircle` icon 16px `palette.success.main` right of product name

**ProgressIndicator:** "N de M productos con cantidad" — sticky above StickyFooterAction

**StickyFooterAction:** "Ver resumen y confirmar" — disabled until at least 1 product has quantity > 0

**Desktop layout (Admin)**
- Same structure as mobile but rendered as `DataTable` with editable quantity column
- Column: Producto | Stock central | Cantidad
- Preflight error shown as row-level inline message

**No monetary values at any breakpoint for this screen.**

**Iconography:** `CheckCircle`, `WarningAmber`, `ArrowForward`

---

### 3.12 TRASLADO-CONFIRM — Transfer Confirmation (Vendedor · Mobile-first)

**Layout**
- Full-screen below AppBar
- Heading: "Confirmar traslado de apertura" — Inter 600 24px
- Subheading: "Estás trasladando N productos a la Tienda:" — Inter 400 16px `palette.text.secondary`

**Summary list**
- Per product with quantity > 0: product name Inter 500 14px left, quantity "N unidades" Inter 400 14px right
- `Button` text "Editar" right-most — navigates back to TRASLADO-APERTURA with data preserved

**Warning state (0 products):** `InlineAlertBanner` severity="warning" — "Debes trasladar al menos un producto antes de confirmar."

**Actions**
- `SecondaryButton` "Editar cantidades" + `PrimaryButton` "Confirmar traslado" — stacked on mobile, side-by-side on sm+
- Submit loading: spinner, "Trasladando..." message

**Success:** `SuccessSnackbar` "Traslado registrado. ¡Buena jornada!" → redirect VEND-HOME

**No monetary values at any breakpoint.**

---

### 3.13 REPOS-FORM — Mid-Day Replenishment (Vendedor · Mobile-first; Admin · Desktop)

**Mobile layout**
- Page heading: "Reposición" — Inter 600 24px
- Status line: "Jornada activa · Iniciada HH:MM" — Inter 400 14px `palette.success.main`
- No-jornada state: `InlineAlertBanner` severity="warning" — "No hay jornada abierta. Abre primero la jornada del día." + CTA "Abrir jornada"

**Form fields**
- `FormSelect` "Producto" — options show product name + "Stock en Tienda: N unidades" as helper below select after selection
- `NumericInput` "Cantidad a trasladar", helper text: "Disponible en almacén central: N unidades"
- Client-side validation: if qty > CENTRAL stock → inline error before submit

**Action:** `PrimaryButton` "Registrar reposición" — full-width on mobile

**Desktop layout (Admin)**
- Same fields but two-column form (producto + cantidad side-by-side on md+)
- Actions: `SecondaryButton` "Cancelar" + `PrimaryButton` "Registrar reposición"

**No monetary values at any breakpoint for vendedor; admin sees the same form without monetary fields (replenishment has no monetary field in this form).**

**Iconography:** `Refresh`, `LocalShipping`

---

### 3.14 CIERRE-CONTEO — Physical Count Entry (Vendedor · Mobile-first)

**PATTERN-IMR-01 applies to this screen.**

**Layout**
- Step indicator: "Cierre de jornada — Paso 1 de 3" — Inter 400 12px `palette.text.secondary`, top of content

**Product list (mobile — card per product)**
- Product name: Inter 600 16px
- "Trasladado hoy: N unidades" — Inter 400 12px `palette.text.secondary`
- `NumericInput` "¿Cuántas quedan?" — min-height 44px, large numeric keyboard
- Filled indicator: when value entered, subtle left-border `palette.success.main` 2px

**Blank product warning (before navigation to step 2)**
- Inline `ConfirmationDialog` listing uncounted products: "Dejaste sin contar: [Agua 500ml]. El sistema lo considerará como 0 unidades. ¿Es correcto?"
- Actions: "Volver a contar" (secondary) + "Sí, continuar" (primary)

**ProgressIndicator:** "N de M productos contados" sticky above StickyFooterAction

**StickyFooterAction:** "Ver resumen" — enabled when all products have values (or user confirmed blanks)

**No monetary values.**

---

### 3.15 CIERRE-DINERO — Cash Entry (Vendedor · Mobile-first)

**Layout**
- Step indicator: "Cierre de jornada — Paso 2 de 3"
- Embedded below CIERRE-CONTEO in same scrollable screen (or separate scroll region on mobile)

**Fields**
- `NumericInput` with `InputAdornment` "$" — "¿Cuánto dinero entregas?" — required; no expected amount shown
- `Switch` + `FormControlLabel` "¿Hubo algún gasto en efectivo hoy?" — default OFF
- When ON: `MonetaryInput` "Monto del gasto" + `FormTextField` "Descripción" with placeholder "¿Para qué fue el gasto? Ej: Bolsas para empaque"

**Critical rule (BR-027 / BR-028):** the dinero_entrega field is a free-entry numeric field. No calculated revenue total, no expected amount, no comparison is shown to the vendedor anywhere in this step.

**Action:** `PrimaryButton` "Ver resumen" — full-width sticky footer

---

### 3.16 CIERRE-RESUMEN — Pre-Close Summary (Vendedor · Mobile-first; Admin · Desktop)

**Step indicator:** "Cierre de jornada — Paso 3 de 3"

**Summary table — Vendedor view (quantities only)**

| Column | Alignment | Note |
|---|---|---|
| Producto | Left | Inter 500 14px |
| Trasladado | Right | Inter 400 14px |
| Conteo | Right | Inter 400 14px |
| Vendidas | Right | Inter 400 14px |
| Retorno central | Right | Inter 400 14px |

- Negative sold units warning: row with amber background `palette.warning.light`, icon `WarningAmber`, text "Este conteo supera lo trasladado (N und). Revisa el número."
- Dinero echo: "Dinero a entregar: $18,000" — Inter 500 14px, `palette.text.primary` — shown to vendedor as echo only, no comparison

**Summary table — Admin view (additional monetary section)**
- Same table as vendedor
- Additional section below table, separated by Divider: "Resumen de caja (visible solo para administrador)" — heading Inter 600 16px `palette.text.secondary`
- Monetary rows: Revenue estimado, COGS estimado, Utilidad bruta estimada (all admin-only, never rendered for vendedor)
- Dinero reportado por vendedor + Salidas de efectivo rows

**CRITICAL RULE:** The monetary section is conditionally rendered based on `user.rol_tienda === 'tienda_admin'`. It is never hidden with CSS — it is absent from the render tree for vendedor.

**Action row:** `SecondaryButton` "← Corregir" + `PrimaryButton` "Confirmar cierre definitivo"
- Subtext below button: "Al confirmar, el inventario sobrante vuelve al almacén central. Esta acción no se puede deshacer." — Inter 400 12px `palette.error.main`

**Tapping a row on mobile:** navigates back to CIERRE-CONTEO with that product's count field focused

---

### 3.17 JORNADA-LIST — Jornada History (Admin · Desktop-first)

**Layout:** Same as ORDER-LIST structure

**Table columns**

| Column | Width | Note |
|---|---|---|
| Fecha | 12% | DD/MM/AAAA |
| Tienda | 12% | Location name |
| Vendedor | 18% | cerrado_por name |
| Estado | 12% | `StatusChip` |
| Revenue | 12% | Admin-only column |
| Alerta | 14% | `StatusChip` FALTANTE/SOBRANTE or empty |
| Acciones | 10% | Ver detail |

- FALTANTE chip: `palette.error.main` background, white text — `StatusChip` variant error
- SOBRANTE chip: `palette.warning.main` background, white text — `StatusChip` variant warning
- No chip shown when cuadre ok

---

### 3.18 JORNADA-DETAIL-ADMIN — Closed Jornada Detail (Admin · Desktop-first)

**Layout:** Single-column, max-width 960px

**Cash alert banner (top, above all content)**
- `InlineAlertBanner` severity="error" for FALTANTE — full-width, prominent
- `InlineAlertBanner` severity="warning" for SOBRANTE
- No banner when ok

**Banner content (FALTANTE)**
- Heading: "ALERTA DE CAJA — FALTANTE" — Inter 600 16px
- Lines: "Ingresos esperados: $XX,XXX" / "Dinero entregado: $XX,XXX" / "Salidas registradas: $X,XXX ([description])" / "Diferencia: –$XX,XXX"
- All monetary values in `palette.error.main` color for FALTANTE, `palette.warning.main` for SOBRANTE

**Product results table**

| Column | Alignment | Admin-only |
|---|---|---|
| Producto | Left | No |
| Vendidas | Right | No |
| Revenue | Right | Yes |
| COGS | Right | Yes |
| Utilidad bruta | Right | Yes |

- TOTAL row: `TableRow` with `fontWeight: 600`, border-top 2px `palette.primary.main`

**Restocking section**
- Section heading: "Lista de reabastecimiento" — Inter 600 20px with Divider
- Empty state: `InlineAlertBanner` severity="success" — "Todos los productos están sobre el punto de reorden."
- With data: same as RESTOCK-LIST embedded view
- CTA: `PrimaryButton` "Generar orden de compra con estos productos"

**Physical count section**
- Collapsible `Accordion`: "Conteo físico registrado"
- Table: Producto | Trasladado | Conteo | Vendidas | Retorno central

---

### 3.19 RESTOCK-LIST — Restocking View (Admin · Desktop-first)

**Layout:** Table with checkboxes, select-all, action button

**Table columns**

| Column | Width | Note |
|---|---|---|
| Checkbox | 5% | MUI `Checkbox` |
| Producto | 22% | Inter 500 14px |
| Stock actual | 12% | Right-aligned |
| Pto. reorden | 12% | Right-aligned |
| Ya en órdenes | 14% | Right-aligned |
| Neta a pedir | 14% | Right-aligned, tooltip icon |
| Sugerido | 11% | Right-aligned |

- "Ya cubierto" rows: `StatusChip` "ya cubierto" gray, checkbox unchecked by default, row opacity 0.7
- Column tooltip on "Neta a pedir": `Tooltip` — "La cantidad neta descuenta las unidades ya en órdenes activas."

**Actions bar (above table)**
- `Checkbox` "Seleccionar todo" + `PrimaryButton` "Generar orden de compra (N seleccionados)" — disabled when 0 selected; activates on selection

**Multi-supplier warning (after generation):** `SuccessSnackbar` "Orden en borrador creada. Completa los detalles para activarla." + `InlineAlertBanner` severity="warning" if multi-supplier products selected

**Iconography:** `Warning`, `Refresh`, `ShoppingCartCheckout`, `InfoOutlined`

---

### 3.20 AJUSTE-FORM — Manual Inventory Adjustment (Admin · Desktop-first)

**Layout:** Single-column, max-width 600px

**Field order (from UX spec §11.4 — note prominently placed)**
1. `FormSelect` "Producto" — required; shows "Stock actual: CENTRAL N und / Tienda N und" as helper text after selection
2. `RadioGroupLarge` "Tipo de ajuste" — two large card-style radio buttons:
   - "ENTRADA — Agregar unidades al inventario"
   - "SALIDA — Retirar unidades del inventario"
   - Helper note below radio group: "Los ajustes de entrada recalculan el costo promedio. Los ajustes de salida no lo modifican." — Inter 400 12px `palette.text.secondary`
3. `RadioGroup` "Ubicación" — horizontal: "Almacén central" · "Tienda"
   - If Tienda selected without open jornada: `InlineAlertBanner` severity="warning" — "No hay jornada abierta en la Tienda. Ajustar el stock fuera de una jornada puede generar inconsistencias con el cierre del día."
4. `NumericInput` "Cantidad" and `MonetaryInput` "Costo por unidad" — appear after direction selected
5. `FormTextField` multiline rows={4} "Motivo del ajuste (obligatorio)" — **positioned before action buttons, not at the bottom** — label in `palette.text.primary`, required

**Button logic:** `PrimaryButton` "Registrar ajuste" is `disabled` until `motivo` field has content

**Iconography:** `Tune`, `AddCircle`, `RemoveCircle`, `WarningAmber`

---

### 3.21 AJUSTE-LIST — Adjustment History (Admin · Desktop-first)

**Layout:** Table with product filter

**Filter:** `FormSelect` "Filtrar por producto" above table

**Table columns**

| Column | Width | Note |
|---|---|---|
| Fecha | 14% | DD/MM/AAAA HH:mm |
| Producto | 16% | Inter 500 |
| Tipo | 10% | `StatusChip` ENTRADA green / SALIDA red |
| Ubicación | 10% | Central / Tienda |
| Cantidad | 8% | Right |
| Costo unit. | 10% | Right, admin-only |
| Registrado por | 14% | User name |
| Nota | 18% | Truncated, expandable via `Tooltip` |

**Iconography:** `History`, `FilterList`

---

### 3.22 STOCK-ADMIN — Stock View for Admin (Admin · Desktop-first)

**Layout:** Table with search, max-width fills content area

**Table columns**

| Column | Width | Note |
|---|---|---|
| Producto | 25% | Inter 500 14px |
| CENTRAL | 15% | Right-aligned qty |
| Tienda | 15% | Right-aligned qty |
| Total | 10% | Right-aligned sum |
| Costo prom. | 12% | Right-aligned, admin-only |
| Punto reorden | 13% | Right-aligned, warning icon if CENTRAL < threshold |

- Warning indicator: `WarningAmber` icon 16px `palette.warning.main` right of punto_reorden value
- Zero stock rows: muted style (opacity 0.65), shown not hidden

**Iconography:** `Search`, `WarningAmber`, `Inventory2`

---

### 3.23 STOCK-VENDEDOR — Stock View for Vendedor (Vendedor · Mobile-first)

**Layout:** Full-screen card list below AppBar, above BottomTabBar

**Search:** `TextField` with `Search` adornment, full-width, sticky below AppBar

**Product cards (stacked)**
- Product name: Inter 500 16px
- "En la Tienda: N unidades" — Inter 400 14px `palette.text.primary`
- "En el almacén central: N unidades" — Inter 400 14px `palette.text.secondary`
- Separator: `Divider`

**No monetary values — avg_cost absent from render.**

**Contextual note when no jornada:** Inter 400 12px `palette.text.secondary` — "El stock de la Tienda se actualiza durante la jornada."

**Iconography:** `Search`, `Inventory`

**Section 3 complete.**

---

## 4. Design System Core

### 4.1 Reusable Components Across the Entire Module

| Component | Screens where used | Notes |
|---|---|---|
| `StatusChip` | All list and detail screens | Centralized color mapping table in §2.2 |
| `InlineAlertBanner` | All forms and details | Severity-mapped; never used decoratively |
| `DataTable` | PROD-LIST, ORDER-LIST, JORNADA-LIST, STOCK-ADMIN, AJUSTE-LIST, RESTOCK-LIST | Shared header styling, alternating rows |
| `EmptyState` | All list screens | Consistent layout, screen-specific copy |
| `SkeletonLoader` | All data-fetching screens | Skeleton matches target layout |
| `SuccessSnackbar` / `ErrorSnackbar` | All form submit actions | Consistent position, duration, severity |
| `ConfirmationDialog` | Deactivate product, close with discrepancy, blank count warning | Title/body/actions pattern |
| `PrimaryButton` / `SecondaryButton` | All screens | One PrimaryButton per action area |
| `StickyFooterAction` | All mobile forms with commit action | Clears BottomTabBar |
| `ProgressIndicator` | TRASLADO-APERTURA, CIERRE-CONTEO, RECEP-FORM (mobile) | Shows completion progress |
| `InlineRowForm` | RECEP-FORM, TRASLADO-APERTURA, CIERRE-CONTEO | PATTERN-IMR-01 implementation |
| `ReadOnlyBadge` | PROD-FORM, PROD-DETAIL | avg_cost display only — never a form input |

### 4.2 Component Composition Patterns

**Pattern A — List + CTA page (Admin)**
```
AppBar
  NavSidebar | PageContent
               Breadcrumb
               PageTitle + PrimaryButton (top-right)
               SearchBar + FilterChips
               DataTable (or EmptyState / SkeletonLoader)
               TablePagination
```

**Pattern B — Form page (Admin)**
```
AppBar
  NavSidebar | PageContent
               Breadcrumb
               PageTitle
               FormSection (Divider + heading + fields)
               [additional FormSection]
               ActionRow (SecondaryButton + PrimaryButton)
```

**Pattern C — Mobile task screen (Vendedor)**
```
AppBar (56px)
  ScrollableContent
    PageHeading
    StepIndicator (if wizard)
    [CardList | FormFields]
    ProgressIndicator (if IMR-01)
  StickyFooterAction (above BottomTabBar)
BottomTabBar (56px)
```

**Pattern D — Detail page with sections (Admin)**
```
AppBar
  NavSidebar | PageContent
               Breadcrumb
               DetailHeader (title + status chip + metadata)
               [InlineAlertBanner if relevant]
               DataSection (Divider + heading + content)
               DataSection (Divider + heading + content)
               ActionRow (bottom)
```

### 4.3 Spacing and Density Rules

**Desktop (Admin)**
- Page padding: 32px (lg+), 24px (md)
- Between form sections (Divider + heading): 24px above Divider, 16px below heading before fields
- Between form fields within section: 16px (md spacing)
- Between action buttons: 16px gap

**Mobile (Vendedor)**
- Page padding: 16px all sides (md spacing)
- Between card items in IMR-01 list: 12px (between border-separated rows)
- Between step sections: 24px (lg spacing)

### 4.4 Role-Differentiation Architecture

All role-differentiated screens share the same route. Role detection at render time:

```
user.roles.includes('tienda_admin')
  → render admin variant (monetary columns, all fields)

user.roles.includes('tienda_vendedor')
  → render vendedor variant (quantities only, no monetary fields)
```

**Monetary fields never use CSS `display:none`, `visibility:hidden`, or `opacity:0`.** They are conditionally rendered via React's JSX conditional (`{isAdmin && <MonetaryField />}`). This applies to:
- `precio_venta`, `avg_cost` columns in PROD-LIST
- `costo_unitario_esperado` column in ORDER-DETAIL
- `costo_unitario_real` field in RECEP-FORM (labeled differently per role, but present for both — OBS-04 decision)
- Revenue, COGS, utilidad_bruta section in CIERRE-RESUMEN
- Revenue column in JORNADA-LIST
- All cash sections in JORNADA-DETAIL-ADMIN (entire section absent for vendedor)
- `avg_cost` in STOCK-ADMIN

**Section 4 complete.**

---

## 5. Accessibility Guide

### 5.1 Contrast Ratios

All text/background pairs meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text ≥18px regular or ≥14px bold). Full verified table in §1.2.

Critical pairs to verify at implementation:
- StatusChip text on chip background — all semantic combinations verified in §1.2
- Placeholder text (`rgba(0,0,0,0.38)` on white = 3.7:1) — acceptable only for placeholder, not for label text; all labels remain visible above fields
- Disabled text (`rgba(0,0,0,0.38)` on white) — acceptable per WCAG exception for disabled UI

### 5.2 Touch Target Minimum Sizes (Mobile)

Per WCAG 2.5.5 (Target Size, AAA) and practical mobile guidance:

| Component | Minimum touch target |
|---|---|
| BottomTabBar items | 48px height (full bar), 80px width per item |
| StickyFooterAction button | 48px height, full width |
| NumericInput on mobile | 44px height minimum |
| IMR-01 card inputs | 44px height minimum |
| `IconButton` (delete, edit) | 44×44px minimum |
| Toggle (Switch) | 44×44px tap area |
| Radio buttons (RadioGroupLarge) | 48px height per option card |

### 5.3 Required ARIA Labels and Roles

| Component | ARIA requirement |
|---|---|
| NavSidebar | `role="navigation"`, `aria-label="Navegación principal Tienda"` |
| BottomTabBar | `role="navigation"`, `aria-label="Navegación móvil"` |
| DataTable | `<table>` with `aria-label` describing content (e.g., `"Lista de productos"`) |
| StatusChip | `aria-label` with full status text (e.g., `aria-label="Estado: Pendiente"`) |
| InlineAlertBanner | `role="alert"` for error severity, `role="status"` for info/warning |
| ConfirmationDialog | `aria-labelledby` pointing to dialog title, `aria-describedby` to dialog body |
| MonetaryInput | `aria-label` indicating field purpose and admin-only nature |
| ProgressIndicator | `aria-live="polite"` so screen readers announce progress |
| StickyFooterAction | `aria-label` with action description and consequence if destructive |
| IconButton (delete) | `aria-label="Eliminar asociación con [supplier name]"` |
| SkeletonLoader | `aria-busy="true"` on the containing element while loading |
| RadioGroupLarge | `role="radiogroup"` with `aria-labelledby` pointing to group heading |
| Toggle (product active) | `aria-label="Producto activo"`, `aria-checked` reflects state |

### 5.4 Focus Management Rules

- **Dialog open:** focus moves to first focusable element inside dialog (title or first field)
- **Dialog close (cancel):** focus returns to the trigger button
- **Form submit error:** focus moves to first field with error, scrolling it into view
- **Snackbar:** does not capture focus; screen reader reads via `aria-live`
- **Tab navigation:** all interactive elements reachable by keyboard in logical DOM order
- **Skip link:** `<a href="#main-content">` as first focusable element in AppBar — allows keyboard users to bypass navigation
- **BottomTabBar:** tab key cycles through tab items; Enter/Space activates; active tab has `aria-current="page"`
- **InlineRowForm:** Tab key moves between editable fields within a row and then to next row in document order; no focus trapping within a row

### 5.5 prefers-reduced-motion

Global CSS rule required (from `digital-guidelines.md §8`):

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

This applies to all transitions defined in §1.7. The react-developer must add this to the global CSS base (index.css or theme baseline).

**Section 5 complete.**

---

## 6. React Implementation Notes

### 6.1 MUI Component Mapping

| UI element | MUI component | Key props / overrides |
|---|---|---|
| NavSidebar | `Drawer` variant="permanent" | width 240px; `sx={{ '& .MuiDrawer-paper': { bgcolor: 'primary.dark' } }}` |
| BottomTabBar | `BottomNavigation` | `showLabels` true; `sx={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}` |
| AppBar | `AppBar` position="fixed" | `color="primary"` — uses `palette.primary.main` |
| DataTable | `Table` + `TableHead` + `TableBody` | Header: `sx={{ bgcolor: 'primary.main', color: '#fff' }}` on `TableHead` |
| StatusChip | `Chip` size="small" | `color` prop from semantic mapping table §2.2; custom `sx` for `iniciada` and `inactivo` |
| InlineAlertBanner | `Alert` | `variant="standard"` with Hersa palette; `severity` prop drives color |
| FormTextField | `TextField` variant="outlined" | `fullWidth`, `helperText`, `error` + `helperText` for error state |
| MonetaryInput | `TextField` + `InputAdornment` | `startAdornment="$"`, `inputMode="decimal"` |
| NumericInput | `TextField` type="number" | `inputProps={{ min: 0 }}`, `inputMode="numeric"` on mobile |
| RadioGroupLarge | `RadioGroup` + styled `FormControlLabel` | Custom `Paper` wrapper per option — see §6.4 |
| Toggle | `Switch` color="primary" + `FormControlLabel` | `labelPlacement="end"` |
| ConfirmationDialog | `Dialog` maxWidth="sm" | `disableEscapeKeyDown` for destructive confirms |
| SkeletonLoader | `Skeleton` animation="wave" | `variant="rectangular"` for table rows |
| SuccessSnackbar | `Snackbar` + `Alert` severity="success" | `autoHideDuration={4000}`, position per breakpoint |
| StickyFooterAction | `Box` position="fixed" + `Button` fullWidth | `bottom: 56px` when BottomTabBar present |
| ProgressIndicator | `Box` position="sticky" | `bottom: 56+48px` (clears footer + tabbar) |
| Accordion (jornada detail) | `Accordion` + `AccordionSummary` + `AccordionDetails` | `elevation={0}`, custom border |
| ReadOnlyBadge | `Box` + `Typography` + `Chip` variant="outlined" | `disabled` Chip with custom label |
| EmptyState | `Box` display="flex" flexDirection="column" alignItems="center" | min-height 200px |

### 6.2 Theme Customization Required

The following overrides must be added to `frontend/src/shared/styles/theme.ts`:

```ts
// DO NOT add Playfair Display — this module is B2B only
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  button: {
    textTransform: 'none',  // REQUIRED — brand rule: no uppercase button text
    fontWeight: 500,
    fontSize: '0.875rem',
  },
},
components: {
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        '& .MuiTableCell-head': {
          color: '#FFFFFF',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:nth-of-type(odd)': { backgroundColor: '#FFFFFF' },
        '&:nth-of-type(even)': { backgroundColor: '#F5F5F5' },
        '&:hover': { backgroundColor: 'rgba(11,31,58,0.04)' },
      },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 4, minHeight: 36 },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 16 },
    },
  },
}
```

### 6.3 Responsive Behavior per Component

| Component | xs (< 600px) | sm (600–900px) | md+ (> 900px) |
|---|---|---|---|
| NavSidebar | Hidden (Drawer temporary) | Hidden | Permanent 240px |
| BottomTabBar | Visible, fixed bottom | Visible | Hidden |
| AppBar logo | Icon-only variant | Icon-only | Horizontal (icon + wordmark) |
| DataTable | Horizontal scroll | Horizontal scroll | Full columns visible |
| ConfirmationDialog | fullWidth, fullScreen=false | maxWidth="sm" | maxWidth="sm" |
| FormTextField | fullWidth | fullWidth | fullWidth or 50% col |
| ORDER-CREATE lines | Stacked card per line | Side-by-side fields | Table row |
| PROD-DETAIL | Single-column | Two-column 50/50 | 60/40 split |
| Typography h1 | 24px | 28px | 32px |

### 6.4 Custom Components Requiring Implementation Beyond MUI Base

#### InlineRowForm (PATTERN-IMR-01)

The single most complex component. Key implementation constraints:

- Use a single `react-hook-form` `FormProvider` wrapping all rows
- Row data modeled as an array in `useFieldArray` (`react-hook-form`)
- Each row's fields use `register('lines.N.fieldName')` — controlled, shared state
- Single submit handler collects all row data from `getValues('lines')`
- Virtualization: if `lines.length > 20`, use `react-window` `FixedSizeList` — but this requires moving `react-hook-form` state outside the virtual row component (use `Controller` with external `control` passed via context)
- Desktop: render as `<table>` with `<tbody>` of editable rows
- Mobile: render as stacked `<Paper>` cards via `Array.map` (no virtualization needed on mobile — product count is bounded)
- Disabled rows (already-processed): use `disabled` prop on individual fields; do not use a separate component
- Progress calculation: `lines.filter(l => l.buen_estado > 0 || l.averiadas > 0).length` out of non-disabled total

#### RadioGroupLarge

Each option rendered as:
```tsx
<Paper
  variant="outlined"
  sx={{
    p: 2,
    cursor: 'pointer',
    border: selected ? '2px solid' : '1px solid',
    borderColor: selected ? 'primary.main' : 'rgba(0,0,0,0.12)',
    bgcolor: selected ? 'rgba(11,31,58,0.06)' : 'background.paper',
    '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(11,31,58,0.04)' },
    transition: 'all 150ms ease-out',
  }}
  onClick={() => onChange(value)}
>
  <Radio checked={selected} />
  <Typography variant="body1" fontWeight={500}>{label}</Typography>
  <Typography variant="body2" color="text.secondary">{description}</Typography>
</Paper>
```

#### RoleDifferentiatedScreen wrapper

Pattern for all screens shared between roles:

```tsx
const { isAdmin } = useTiendaRole()  // custom hook wrapping auth context

// In render:
{isAdmin && <MonetaryInput ... />}
{isAdmin && <TableCell>{formatCurrency(row.revenue)}</TableCell>}
// Never: style={{ display: isAdmin ? 'block' : 'none' }}
```

### 6.5 Data Fetching and State Notes

- All server state via React Query (`@tanstack/react-query`)
- Form state via `react-hook-form` with `yup` or `zod` schema validation
- Role state from auth context — no additional store needed
- IMR-01 form state stays in component (not Redux) — draft data persisted to `localStorage` for CIERRE-CONTEO flow (prevents loss on phone lock per UX spec §8.5)
- Optimistic updates: not used — inventory operations are too consequential for optimism
- Stale time: 30 seconds for STOCK views; 0 (always refetch) for jornada status on VEND-HOME load

### 6.6 File Structure for This Module

```
frontend/src/modules/tienda/
├── constants/
│   └── routes.ts              # /tienda/* route constants
├── features/
│   ├── catalogo/              # Products + Suppliers (PROD-*, PROV-*)
│   ├── compras/               # Orders + Reception (ORDER-*, RECEP-*)
│   ├── jornada/               # Opening + Replenishment + Closing (VEND-HOME, TRASLADO-*, REPOS-*, CIERRE-*)
│   ├── reportes/              # JORNADA-LIST, JORNADA-DETAIL-ADMIN, RESTOCK-LIST
│   ├── ajustes/               # AJUSTE-FORM, AJUSTE-LIST
│   └── stock/                 # STOCK-ADMIN, STOCK-VENDEDOR
├── shared/
│   ├── components/
│   │   ├── InlineRowForm/
│   │   ├── RadioGroupLarge/
│   │   └── RoleDifferentiatedScreen/
│   └── hooks/
│       └── useTiendaRole.ts
└── index.ts
```

**Section 6 complete.**

---

## Handoff Instructions for react-developer

1. Read `documentation/brand/digital-guidelines.md §10` for the MUI theme typography configuration before touching `theme.ts`.
2. Read `documentation/brand/digital-guidelines.md §8` for the `prefers-reduced-motion` global CSS rule — add it to `index.css` before implementing any animation.
3. The Tienda module is **B2B only** — Playfair Display must not be loaded or referenced in any component under `frontend/src/modules/tienda/`.
4. Implement the **role-differentiation rule** (§4.4) as a render-conditional pattern, never a CSS visibility rule. The vendedor must never receive monetary data in the component tree.
5. PATTERN-IMR-01 (`InlineRowForm`) is a shared component — implement it once in `tienda/shared/components/InlineRowForm/` and reuse across RECEP-FORM, TRASLADO-APERTURA, and CIERRE-CONTEO.
6. Cash alert colors for `FALTANTE` (red) and `SOBRANTE` (amber) use the standard semantic palette — no custom colors needed beyond what is in `hersaTheme`.
7. Persist CIERRE-CONTEO draft state to `localStorage` — key: `tienda_cierre_draft_${jornadaId}`. Clear on successful close or explicit cancellation.
8. Virtualize any IMR-01 list with more than 20 rows using `react-window` — maintain `react-hook-form` state outside the virtual list via `Controller` components.
9. All UI text in Spanish. Code identifiers, types, and variable names in English.
10. `TextTransform: none` on all buttons — already specified in theme override §6.2; do not add `text-transform: uppercase` anywhere.

---

*UI Specification — Módulo Tienda v1.0*
*Produced by ui-designer (Jose) · 2026-05-04*
*Source: tienda-ux-spec.md v1.2 · tienda-especificaciones-funcionales.md v1.3 · tienda-pm-document.md v1.1*
*All brand values derived from brand-manual.md v1.0 and digital-guidelines.md v1.0*
*No unresolved FRICCIÓN ALTA blockers in source UX spec*
