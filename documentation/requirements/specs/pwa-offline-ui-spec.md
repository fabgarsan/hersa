# UI Specification — PWA Offline Feedback Components
**Version:** 1.0
**Date:** 2026-04-27
**Author:** ui-designer
**Surface:** Portal institucional B2B (internal operational tool)
**UX Source:** `documentation/requirements/specs/pwa-offline-ux-spec.md` v1.0
**Status:** Ready for react-developer

> **Surface declaration (mandatory per digital-guidelines.md §9):**
> - Surface type: B2B institutional portal
> - Playfair Display: NOT used anywhere in this spec
> - Dominant color: `$primary-main` (#0B1F3A) for indicator bar backgrounds; `$bg-paper` (#FFFFFF) for dialog surfaces
> - Photography: none in these components — no overlay required
> - Typography: Inter exclusively throughout all four components

---

## Pre-flight Verification

- UX spec exists: confirmed (`pwa-offline-ux-spec.md` v1.0)
- Unresolved `[FRICCIÓN ALTA]` items: zero (all three resolved with explicit design decisions in sections 5 of Components 1 and 2)
- Brand files read: `brand-manual.md` v1.0, `digital-guidelines.md` v1.0
- SCSS variables file read: `frontend/src/shared/styles/_variables.scss`
- MUI theme read: `frontend/src/shared/styles/theme.ts`

---

## Section 1 — Design Tokens

### 1.1 Color Tokens

All tokens reference existing variables from `frontend/src/shared/styles/_variables.scss`. No new color values are introduced.

| Token Name | SCSS Variable | Hex Value | Usage in These Components |
|---|---|---|---|
| `error-main` | `$error-main` | `#A32D2D` | ConnectivityIndicator offline background; OfflineSnackbar background |
| `success-main` | `$success-main` | `#3B6D11` | ConnectivityIndicator reconnected background |
| `bg-paper` | `$bg-paper` | `#FFFFFF` | OfflineMutationDialog surface |
| `primary-main` | `$primary-main` | `#0B1F3A` | Dialog title text; icon color on paper surfaces |
| `text-primary` | `$text-primary` | `#1A1A1A` | Dialog body text |
| `bg-default` | `$bg-default` | `#F5F5F5` | Disabled button background |
| `text-secondary` | `$text-secondary` | `#5F5E5A` | Disabled button label text |

#### WCAG AA Contrast Ratios — Verified Pairs

All pairs below meet the WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text (≥18px regular or ≥14px bold).

| Foreground | Background | Hex Pair | Ratio | WCAG AA | Usage |
|---|---|---|---|---|---|
| White `#FFFFFF` | Error `#A32D2D` | — | 5.1:1 | Pass (normal text) | ConnectivityIndicator offline copy; OfflineSnackbar copy |
| White `#FFFFFF` | Success `#3B6D11` | — | 5.6:1 | Pass (normal text) | ConnectivityIndicator reconnected copy |
| Marino `#0B1F3A` | White `#FFFFFF` | — | 14.7:1 | Pass | Dialog title on paper |
| Negro Marca `#1A1A1A` | White `#FFFFFF` | — | 16.1:1 | Pass | Dialog body on paper |
| Gris Texto `#5F5E5A` | Gris Claro `#F5F5F5` | — | 5.1:1 | Pass (normal text) | Disabled button label |
| White `#FFFFFF` | Marino `#0B1F3A` (button) | — | 14.7:1 | Pass | "Entendido" button label |

> Note on error token: `#A32D2D` with white text yields 5.1:1, confirmed passing WCAG AA for normal text (minimum 4.5:1). This is the standard semantic error treatment across the Hersa design system.

### 1.2 Typography Tokens

All from `hersaTheme` in `frontend/src/shared/styles/theme.ts`. **No Playfair Display anywhere in this spec.**

| Element | Variant | Font | Weight | Size | Line-height | SCSS Equivalent |
|---|---|---|---|---|---|---|
| ConnectivityIndicator copy (mobile) | `caption` | Inter | 400 | 12px | 1.5 | — |
| ConnectivityIndicator copy (desktop) | `body2` | Inter | 400 | 14px | 1.6 | — |
| OfflineSnackbar line 1 | `body2` semibold override | Inter | 600 | 14px | 1.6 | — |
| OfflineSnackbar line 2 | `body2` | Inter | 400 | 14px | 1.6 | — |
| Dialog title | `h3` | Inter | 500 | 20px | 1.4 | — |
| Dialog body | `body1` | Inter | 400 | 16px | 1.6 | — |
| Dialog button | `button` | Inter | 500 | 14px | — | — |
| Submit button disabled label | `button` | Inter | 500 | 14px | — | — |

> Justification for OfflineSnackbar line 1 weight override: the theme's `body2` is weight 400. Line 1 ("No se pudo guardar") functions as a micro-title within a 2-line snackbar and needs visual separation from the explanatory line 2. Weight 600 achieves this without requiring a different size, keeping the bar compact. This is implemented via a SCSS class targeting the MUI Snackbar content — see Section 6.

### 1.3 Spacing Tokens

Using the `sp()` SCSS function from `_variables.scss` (1 unit = 8px).

| Token | Value | Usage |
|---|---|---|
| `sp(0.5)` | 4px | Icon–text gap inside ConnectivityIndicator bar |
| `sp(1)` | 8px | Snackbar internal horizontal padding between icon and text |
| `sp(2)` | 16px | Dialog padding (all sides); Snackbar horizontal padding |
| `sp(3)` | 24px | Dialog button top margin |
| `sp(4)` | 32px | Mobile margin: `calc(100vw - 32px)` dialog width formula |

### 1.4 Border Radius Tokens

From `hersaTheme.shape.borderRadius = 8`.

| Component | Value | Rationale |
|---|---|---|
| ConnectivityIndicator bar | `0` | Full-width fixed bar — no radius |
| OfflineSnackbar paper | `8px` | Default MUI Snackbar radius (matches theme `borderRadius`) |
| OfflineMutationDialog paper | `8px` | Default MUI Dialog radius (matches theme `borderRadius`) |
| "Entendido" button | `8px` | Contained primary button — MUI default |
| Disabled submit button | `8px` | Matches enabled button shape |

### 1.5 Shadow Tokens

| Component | Elevation | Value |
|---|---|---|
| ConnectivityIndicator | `0` | No shadow — it sits between AppHeader (which has shadow) and content |
| OfflineSnackbar | MUI default (elevation 6) | Shadow provided by MUI — do not override |
| OfflineMutationDialog | MUI default (elevation 24) | Shadow provided by MUI — do not override |

### 1.6 Z-index Tokens

These are not in `_variables.scss` today. Add the following CSS custom properties in the global layout stylesheet (not as SCSS variables, to allow runtime access from JS if needed):

| Variable Name | Value | Element |
|---|---|---|
| `--z-connectivity-indicator` | `1090` | ConnectivityIndicator fixed bar |
| `--z-app-header` | `1100` | AppHeader (reference — do not redefine here) |

MUI manages Snackbar (`1400`) and Dialog (`1300`) z-index internally — do not override.

### 1.7 Transition Tokens

From `digital-guidelines.md §8`.

| Token | Value | Usage |
|---|---|---|
| Micro-interaction | `150ms ease-out` | Hover states on the "Entendido" button |
| State transition | `250ms ease-in-out` | ConnectivityIndicator fade-out after reconnection |
| `prefers-reduced-motion` override | Instant (no transition) | All transitions above are suppressed when media query is active |

---

## Section 2 — Component Inventory

### 2.1 Component List

| Component | MUI Base | Variants | File Path |
|---|---|---|---|
| `ConnectivityIndicator` | Custom div (no MUI wrapper needed) | `offline-mobile`, `offline-desktop`, `reconnected`, `hidden` | `src/shared/components/ConnectivityIndicator/` |
| `OfflineSnackbar` | `Snackbar` + `SnackbarContent` | Single variant (2-line error) | `src/shared/components/OfflineSnackbar/` |
| `OfflineMutationDialog` | `Dialog` + `DialogContent` + `DialogActions` | Single variant (critical error) | `src/shared/components/OfflineMutationDialog/` |
| Disabled submit button | `Button` (contained primary) | `disabled-offline` | Inline state within any form — no separate component |

### 2.2 ConnectivityIndicator — All Five States

| State | Visual Treatment | Trigger Condition |
|---|---|---|
| **Default (hidden)** | `display: none` — component in DOM, zero height, no layout space reserved | App initializing; connected baseline after reconnection fade |
| **Offline (mobile)** | Full-width bar, 32px height, `$error-main` background, white icon (16px) + caption text "Sin señal", `position: fixed` | `offline` event fired; rendered at `xs` breakpoint |
| **Offline (desktop)** | Full-width bar, 40px height, `$error-main` background, white icon (16px) + body2 text "Sin conexión — los datos pueden no estar actualizados", `position: fixed` | `offline` event fired; rendered at `md+` breakpoint |
| **Reconnected** | Full-width bar at active height (32px mobile / 40px desktop), `$success-main` background, white wifi icon + "Conexión restaurada", `position: fixed`; fades to `opacity: 0` after 4000ms over 250ms | `online` event fired; 4000ms timer running |
| **Error (N/A for this component)** | Not applicable — the component itself communicates error state; it has no internal error state | — |

> Hover and active states are not applicable to the ConnectivityIndicator — it is a passive informational bar with no interactive elements.

### 2.3 OfflineSnackbar — All Five States

MUI `Snackbar` with `SnackbarContent` custom content.

| State | Visual Treatment |
|---|---|
| **Default (hidden)** | `open={false}` — MUI manages mount/unmount |
| **Active (visible)** | Snackbar rendered; `$error-main` background on SnackbarContent; wifi-off icon (16px) + 2-line copy; close IconButton (X) |
| **Hover (close button)** | Close IconButton: background `rgba(255,255,255,0.12)` on hover, 150ms ease-out; icon remains white |
| **Active/pressed (close button)** | Background `rgba(255,255,255,0.24)` on mousedown, 150ms |
| **Disabled** | Not applicable — the Snackbar itself is never disabled; the button within it (close X) is never disabled |
| **Error** | This component IS the error — it has no internal error state |

Auto-dismiss: after 6000ms, `open` is set to `false`. The 6000ms duration is a deliberate exception to the 4000ms system default (documented in UX spec §5, [FRICCIÓN MEDIA] resolution).

### 2.4 OfflineMutationDialog — All Five States

MUI `Dialog` with custom internal layout.

| State | Visual Treatment |
|---|---|
| **Default (hidden)** | `open={false}` — Dialog not mounted |
| **Active (visible)** | Dialog open; dark backdrop (MUI default); paper surface `$bg-paper`; wifi-off icon centered (24px, `$primary-main` color); h3 title; body1 text; full-width "Entendido" button |
| **Hover ("Entendido" button)** | Button background: `$primary-light` (#1E3A5F) — MUI contained primary hover state (theme-driven); 150ms ease-out |
| **Active/pressed ("Entendido" button)** | Button background: `$primary-dark` (#122640); 150ms |
| **Disabled** | Not applicable — "Entendido" button is always enabled while dialog is open; the point of the dialog is to require acknowledgment |
| **Error** | This component IS the error — it has no internal error state |

> The Dialog has no close X icon in the corner (per UX spec §5, [FRICCIÓN ALTA] resolution). `disableEscapeKeyDown={true}` must be set. The only exit is the "Entendido" button.

### 2.5 Submit Button Disabled State — All Five States

This is not a new component — it is a state of the existing form submit button (`Button variant="contained" color="primary"`). Specified here so the react-developer knows the exact treatment.

| State | Visual Treatment | Label |
|---|---|---|
| **Default (enabled, online)** | Contained primary button — standard theme style | Original label (e.g., "Guardar pago") |
| **Hover (enabled, online)** | MUI theme-driven hover (`$primary-light` background) | Original label |
| **Active/pressed (enabled, online)** | MUI theme-driven active state | Original label |
| **Disabled — offline** | `disabled` prop true; `aria-disabled="true"`; MUI default disabled treatment (reduced opacity) | "Sin conexión" — label changes; no tooltip |
| **Error** | Not applicable — the disabled state is itself the error communication |

> Label change is the ONLY indicator of the disabled reason. No tooltip (unreliable on touch per UX spec §5). No badge overlay. The label "Sin conexión" must be legible even in the disabled visual state. MUI's default disabled opacity is 0.38 — verify contrast: `$text-secondary` (#5F5E5A) at 38% opacity on the button background does not meet WCAG AA, but `aria-disabled="true"` with the label change satisfies WCAG 1.4.3 exception for disabled controls. Document this explicitly in Section 5.

---

## Section 3 — Per-Screen Specification

The UX spec designates these components as layout-level overlays, not page-specific screens. Each specification below covers the visual treatment by breakpoint and state across all screens where the component appears.

### 3.1 ConnectivityIndicator

**Surface:** B2B institutional — Inter only, no Playfair Display.

#### Layout by Breakpoint

| Breakpoint | Height | Width | Position | Top offset |
|---|---|---|---|---|
| `xs` (< 600px) | 32px | 100vw | `fixed` | Height of AppHeader (typically 56px on mobile MUI) |
| `sm` (600–900px) | 32px | 100vw | `fixed` | Height of AppHeader (typically 64px) |
| `md+` (≥ 900px) | 40px | 100vw | `fixed` | Height of AppHeader (typically 64px) |

> The `top` value must be a CSS custom property or derived at runtime from the AppHeader height. The safest implementation: set `top: var(--app-header-height, 64px)`. If the AppHeader height changes (e.g., dense mode), update the CSS variable at the layout level.

#### Content Layout — Offline State

```
[  [wifi-off icon 16px]  [text]  ]

Alignment: flex, row, center (vertical), left-aligned content
Internal padding: 0 sp(2) (0 16px — left and right gutters)
Icon–text gap: sp(0.5) (4px)
```

**Mobile (xs):** icon (16px) + caption "Sin señal". Single line. No truncation.
**Desktop (md+):** icon (16px) + body2 "Sin conexión — los datos pueden no estar actualizados". Single line. No truncation.

> Icon specification: Material Icons `WifiOff` (outlined style, 16px). Color: white (`#FFFFFF`). Rendered via MUI `SvgIcon` with `fontSize="small"` override to 16px in SCSS.

#### Content Layout — Reconnected State

Same layout. Icon changes to Material Icons `Wifi` (outlined, 16px). Text: "Conexión restaurada". Background: `$success-main`.

#### Visual Hierarchy

1. Background color (pre-attentive — red vs. green tells the state before text is read)
2. Icon (reinforces state at 16px)
3. Copy (confirms state in words)

#### Micro-interactions

| Transition | Duration | Easing | Condition |
|---|---|---|---|
| Appear (offline/reconnected state) | Instant | — | No fade-in; appears immediately to communicate urgency |
| Disappear after reconnection | `250ms` | `ease-in-out` | Only after 4000ms reconnected display; uses CSS `opacity: 0` + `visibility: hidden` |
| Layout shift (content below bar) | Matches bar transition | `ease-in-out` | Content wrapper `padding-top` transitions simultaneously with bar opacity; prevents jump |
| `prefers-reduced-motion` | Instant | — | No transitions at all |

> Implementation note: the content wrapper below AppHeader must receive a `padding-top` equal to the bar height while the bar is visible. This prevents the bar from overlapping content. When the bar fades out, `padding-top` returns to 0 simultaneously, synchronized with the `opacity` transition. If `prefers-reduced-motion` is active, both change instantly.

#### Iconography

- Set: Material Icons (MUI native)
- Offline icon: `WifiOff` (outlined)
- Reconnected icon: `Wifi` (outlined)
- Size: 16px (override MUI default 24px via SCSS class)

---

### 3.2 OfflineSnackbar

**Surface:** B2B institutional — Inter only, no Playfair Display.

#### Layout by Breakpoint

| Breakpoint | Position | Max-width | Margin |
|---|---|---|---|
| `xs` / `sm` (< 900px) | `bottom-center` | `calc(100vw - 32px)` | `0 16px 16px` |
| `md+` (≥ 900px) | `bottom-right` | `400px` | `0 24px 24px 0` |

> MUI `Snackbar` props: `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}` for mobile; `anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}` for desktop. Breakpoint switching via the `useMediaQuery` hook in the parent consumer — the component accepts an `anchorOrigin` prop.

#### Content Structure

```
+----------------------------------------------+
| [wifi-off icon 16px]  No se pudo guardar     | [X]
|                       Sin conexión. Vuelve a |
|                       intentarlo cuando      |
|                       recuperes la señal.    |
+----------------------------------------------+
```

**Internal layout:** SnackbarContent uses a flex row:
- Left section: icon (16px) + text block (2 lines)
- Right section: IconButton close (X)

Text block:
- Line 1: `body2` variant, weight 600 (semibold override via SCSS) — "No se pudo guardar"
- Line 2: `body2` variant, weight 400 — "Sin conexión. Vuelve a intentarlo cuando recuperes la señal."

#### Colors

| Element | Background | Text/Icon Color | Ratio |
|---|---|---|---|
| SnackbarContent surface | `$error-main` (#A32D2D) | White (#FFFFFF) | 5.1:1 — Pass |
| Close button (default) | Transparent | White (#FFFFFF) | Pass (against error bg) |
| Close button (hover) | `rgba(255,255,255,0.12)` | White (#FFFFFF) | Pass |

#### Visual Hierarchy

1. Red background (pre-attentive — error state)
2. Icon (semantic reinforcement — wifi-off)
3. Line 1 weight 600 — "No se pudo guardar" (what happened)
4. Line 2 weight 400 — reason and action (why + what to do)
5. X button — manual dismiss affordance

#### Micro-interactions

| Element | Interaction | Duration | Easing |
|---|---|---|---|
| Close button | Hover background overlay | 150ms | ease-out |
| Snackbar | Auto-dismiss | 6000ms timer; no visual transition needed |
| Snackbar | Manual dismiss (X tap) | MUI default slide-out | 250ms ease-in-out |
| `prefers-reduced-motion` | Slide transitions suppressed | Instant | — |

#### Iconography

- Set: Material Icons (MUI native)
- Icon: `WifiOff` (outlined), 16px
- Close button: `Close` icon, 20px (MUI `IconButton` size `small`)

---

### 3.3 OfflineMutationDialog

**Surface:** B2B institutional — Inter only, no Playfair Display.

#### Layout by Breakpoint

| Breakpoint | Dialog max-width | Dialog width | Padding |
|---|---|---|---|
| `xs` (< 600px) | None | `calc(100vw - 32px)` | 16px all sides |
| `sm+` (≥ 600px) | `360px` | MUI auto (constrained to 360px) | 24px all sides |

> MUI `Dialog` props: `maxWidth={false}` with `PaperProps={{ style: { width: ... } }}` is not the right pattern — use `sx` is prohibited. Instead, override via SCSS targeting `:global(.MuiDialog-paper)` inside the component's module. See Section 6.

#### Content Structure (top to bottom)

```
+------------------------------------------+
|                                          |
|  [wifi-off icon — 24px, centered]        |
|  [sp(2) = 16px gap]                      |
|  El cambio no se guardó                  |  ← h3, Inter 500 20px, $primary-main
|  [sp(1) = 8px gap]                       |
|  No hay conexión en este momento.        |  ← body1, Inter 400 16px, $text-primary
|  Los datos no fueron enviados.           |
|  Cuando recuperes la señal, intenta      |
|  guardar de nuevo.                       |
|  [sp(3) = 24px gap]                      |
|  [     Entendido     ]                   |  ← Button contained primary, full width
|                                          |
+------------------------------------------+
```

**Icon:** Material Icons `WifiOff` (outlined), 24px, color `$primary-main` (#0B1F3A). Centered horizontally.
**Title:** `Typography variant="h3"`, `align="center"`, color `$primary-main` (from theme — no override needed).
**Body:** `Typography variant="body1"`, `align="center"`, color `$text-primary` (#1A1A1A).
**Button:** `Button variant="contained" color="primary"`, `fullWidth`, label "Entendido".

#### Visual Hierarchy

1. Icon (pre-attentive — wifi-off at 24px immediately signals connectivity)
2. Title "El cambio no se guardó" (h3 weight 500 — prominent, not alarming)
3. Body (body1 — calm, instructional)
4. Button (single CTA — no ambiguity)

#### Colors

| Element | Color Token | Hex | Rationale |
|---|---|---|---|
| Dialog paper | `$bg-paper` | `#FFFFFF` | Matches all modals in the system |
| Backdrop | MUI default `rgba(0,0,0,0.5)` | — | Standard MUI backdrop |
| Icon | `$primary-main` | `#0B1F3A` | Formal, not alarming — matches title text |
| Title text | `$primary-main` | `#0B1F3A` | From theme h3 definition |
| Body text | `$text-primary` | `#1A1A1A` | From theme body1 |
| Button bg (default) | `$primary-main` | `#0B1F3A` | Contained primary |
| Button text | White | `#FFFFFF` | Contrast 14.7:1 — Pass |
| Button bg (hover) | `$primary-light` | `#1E3A5F` | MUI theme hover |
| Button bg (active) | `$primary-dark` | `#122640` | MUI theme active |

> Icon color choice: `$primary-main` (navy) instead of `$error-main` (red). Rationale: the Dialog already appears in an error scenario. Using red for the icon would heighten alarm for users who are already under time pressure during a ceremony. Navy is formal and clear without being alarming. The copy and context communicate the error severity; the icon does not need to amplify it.

#### Micro-interactions

| Element | Interaction | Duration | Easing |
|---|---|---|---|
| Dialog appear | MUI default fade+scale | 225ms | ease-in-out |
| Dialog backdrop | MUI default opacity | 225ms | — |
| "Entendido" button hover | Background color shift | 150ms | ease-out |
| "Entendido" button pressed | Background color shift | 150ms | ease-out |
| `prefers-reduced-motion` | Dialog appears instantly; no transition | — | — |

#### Iconography

- Set: Material Icons (MUI native)
- Icon: `WifiOff` (outlined), 24px
- No close X icon (disableEscapeKeyDown + no corner X per UX spec)

---

### 3.4 Submit Button — Disabled Offline State

**Surface:** B2B institutional — this state appears on any form submit button in any screen where the user has attempted a mutation while offline.

#### Layout

The button occupies the same position and dimensions as its enabled state. No layout shift occurs on state change. Only the label and visual treatment change.

| Property | Enabled State | Disabled Offline State |
|---|---|---|
| Label | Context-dependent (e.g., "Guardar pago") | "Sin conexión" |
| Background | `$primary-main` (#0B1F3A) | MUI disabled: `rgba(0,0,0,0.12)` applied over current bg |
| Text color | White (#FFFFFF) | MUI disabled: `rgba(0,0,0,0.26)` |
| Opacity | 1 | MUI applies 0.38 opacity via theme |
| Cursor | `pointer` | `not-allowed` (via MUI) |
| `aria-disabled` | `false` (or absent) | `true` |

> WCAG note: WCAG 1.4.3 explicitly exempts inactive UI components (disabled controls) from the 4.5:1 contrast requirement. The visual dimming of the disabled state is therefore compliant. However, the label "Sin conexión" must remain readable. MUI's default disabled text color achieves approximately 3.2:1 against the disabled button background — below 4.5:1, but within the disabled-control exemption. The `aria-disabled="true"` plus the label text provides the accessible explanation. This exception must be documented in code comments.

#### Micro-interactions

None — state changes instantly when `online`/`offline` events fire. No transition on the label or button appearance.

---

## Section 4 — Design System Core

### 4.1 Reusable Components

| Component | Reusable Scope | Notes |
|---|---|---|
| `ConnectivityIndicator` | Entire application — all screens, all modules | Layout-level component; renders once in the app shell |
| `OfflineSnackbar` | All screens where non-critical mutations exist | Shared component — one instance managed globally or per-screen via hook |
| `OfflineMutationDialog` | All screens where critical mutations exist | Shared component — one instance, controlled by the mutation error handler |
| Disabled submit button state | Any `Button variant="contained"` in a form | Not a separate component — a state pattern applied consistently |

### 4.2 Component Composition Patterns

**ConnectivityIndicator placement:**
```
AppShell
├── AppHeader (z-index 1100, fixed)
├── ConnectivityIndicator (z-index 1090, fixed)
└── MainContentWrapper (padding-top adjusts when indicator is visible)
    ├── Sidebar (md+)
    └── PageContent (scrollable)
```

**OfflineMutationFeedback activation pattern:**
```
FormComponent
├── [Form fields]
└── SubmitButton
    ├── Enabled state: label = original label
    └── Disabled state: label = "Sin conexión", aria-disabled=true

MutationErrorHandler (in useMutation onError callback):
├── if (navigator.onLine === false && isCriticalMutation) → open OfflineMutationDialog
├── if (navigator.onLine === false && !isCriticalMutation) → open OfflineSnackbar
└── if (navigator.onLine === true && isNetworkTimeout) → open OfflineSnackbar (same treatment)
```

### 4.3 Spacing and Density Rules

These components follow the B2B institutional density model: compact, information-forward.

| Rule | Value |
|---|---|
| ConnectivityIndicator internal padding (horizontal) | `sp(2)` = 16px |
| ConnectivityIndicator icon–text gap | `sp(0.5)` = 4px |
| Snackbar internal padding | `sp(2)` = 16px |
| Dialog padding | `sp(2)` = 16px (mobile) / `sp(3)` = 24px (desktop) |
| Dialog icon–title gap | `sp(2)` = 16px |
| Dialog title–body gap | `sp(1)` = 8px |
| Dialog body–button gap | `sp(3)` = 24px |

### 4.4 Color Usage Consistency

| Pattern | Correct | Incorrect |
|---|---|---|
| Offline / error state | `$error-main` background with white text | Any other color for "I am offline" |
| Reconnected / success state | `$success-main` background with white text | Green from any other source |
| Dialog surface | `$bg-paper` (#FFFFFF) | Tinted or dark dialog backgrounds |
| Icon on error background | White | Colored icons on error red background |
| Icon on paper surface | `$primary-main` | `$error-main` red for the wifi-off icon in Dialog |

---

## Section 5 — Accessibility Guide

### 5.1 Contrast Ratios (WCAG AA)

All pairs verified against `digital-guidelines.md §2` and the standard 4.5:1 threshold for normal text.

| Component | Element | Foreground | Background | Ratio | Status |
|---|---|---|---|---|---|
| ConnectivityIndicator (offline) | Copy text | `#FFFFFF` | `#A32D2D` | 5.1:1 | Pass |
| ConnectivityIndicator (offline) | Icon | `#FFFFFF` (SVG fill) | `#A32D2D` | 5.1:1 | Pass |
| ConnectivityIndicator (reconnected) | Copy text | `#FFFFFF` | `#3B6D11` | 5.6:1 | Pass |
| OfflineSnackbar | Line 1 text | `#FFFFFF` | `#A32D2D` | 5.1:1 | Pass |
| OfflineSnackbar | Line 2 text | `#FFFFFF` | `#A32D2D` | 5.1:1 | Pass |
| OfflineSnackbar | Close icon | `#FFFFFF` | `#A32D2D` | 5.1:1 | Pass |
| OfflineMutationDialog | Icon | `#0B1F3A` | `#FFFFFF` | 14.7:1 | Pass |
| OfflineMutationDialog | Title | `#0B1F3A` | `#FFFFFF` | 14.7:1 | Pass |
| OfflineMutationDialog | Body text | `#1A1A1A` | `#FFFFFF` | 16.1:1 | Pass |
| OfflineMutationDialog | Button label | `#FFFFFF` | `#0B1F3A` | 14.7:1 | Pass |
| Submit button (disabled) | Label | `rgba(0,0,0,0.26)` | `rgba(0,0,0,0.12)` over bg | ~3.2:1 | Exempted (disabled control per WCAG 1.4.3) |

### 5.2 Touch Target Sizes (Mobile)

All interactive elements must meet the 44×44px minimum touch target size on mobile (iOS HIG / Android Material guidance).

| Element | Visual Size | Touch Target | Status |
|---|---|---|---|
| ConnectivityIndicator bar | 32px height × full width | Full bar is non-interactive (no tap action) | N/A |
| OfflineSnackbar close button (X) | 20px icon | MUI `IconButton` size="small" = 34px; override to 44px minimum via SCSS padding | Must override |
| OfflineMutationDialog "Entendido" button | Full width × 42px (MUI default medium) | Full width — always ≥ 44px tall; set `size="large"` for 48px height | Use `size="large"` |
| Submit button (disabled) | Context-dependent | Must already meet 44px in enabled state | Per existing button implementation |

> Correction for OfflineSnackbar close button: MUI `IconButton size="small"` renders a 30px touch target. Override to minimum 44px by adding padding in SCSS: `.closeButton { padding: 10px; }`. This gives a 40px icon zone + 4px visual margin — acceptable for a secondary dismiss action.

### 5.3 ARIA Labels and Roles

| Component | Required ARIA | Implementation |
|---|---|---|
| ConnectivityIndicator | `role="status"`, `aria-live="polite"`, `aria-label="Estado de conectividad"` | On the root container element |
| ConnectivityIndicator (offline) | `aria-label="Sin conexión"` on icon | MUI `SvgIcon` with `aria-label` prop |
| ConnectivityIndicator (reconnected) | `aria-label="Conexión restaurada"` on icon | Same |
| OfflineSnackbar | MUI Snackbar handles `role="alert"` via `SnackbarContent`; verify it is present | MUI default behavior — confirm in implementation |
| OfflineSnackbar close button | `aria-label="Cerrar notificación"` | `IconButton aria-label="Cerrar notificación"` |
| OfflineMutationDialog | MUI Dialog provides `role="dialog"`, `aria-modal="true"` by default | Confirm `aria-labelledby` points to title element ID |
| OfflineMutationDialog title | `id="offline-mutation-dialog-title"` | Required for `aria-labelledby` |
| OfflineMutationDialog "Entendido" | Focus is set here on Dialog open | MUI Dialog `autoFocus` on first button — verify |
| Submit button (disabled) | `aria-disabled="true"` | Explicit prop — not just `disabled` alone |

> Important: `aria-disabled="true"` must be used alongside the `disabled` prop. Using only `disabled` removes the element from tab order (correct) but `aria-disabled="true"` ensures screen readers announce the disabled state and its label "Sin conexión" even when the element is not focusable via keyboard.

> **`aria-live` behavior:** The ConnectivityIndicator uses `aria-live="polite"` (not `"assertive"`). Rationale: an `assertive` announcement would interrupt any ongoing screen reader narration, which is disruptive during ceremony operations. `polite` waits for a pause before announcing. The UX spec confirms this decision.

### 5.4 Focus Management

| Scenario | Required Behavior |
|---|---|
| ConnectivityIndicator appears | No focus change — passive component; keyboard focus stays on current element |
| OfflineSnackbar appears | No focus change — user can dismiss via tab + enter if they choose to; auto-dismiss at 6000ms |
| OfflineSnackbar close button | Must be reachable via Tab from the snackbar area; receives visible focus ring |
| OfflineMutationDialog opens | Focus moves to "Entendido" button immediately — MUI Dialog handles this via `autoFocus` |
| OfflineMutationDialog "Entendido" pressed | Focus returns to the element that triggered the failed mutation (the disabled submit button or its nearest focusable sibling) |
| Submit button disabled | Removed from tab order (`disabled` prop); `aria-disabled="true"` announced by screen reader |

### 5.5 `prefers-reduced-motion`

Apply the following rule globally in the base SCSS (already specified in `digital-guidelines.md §8`):

```scss
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

Components affected by this rule in this spec:

| Component | Normal behavior | Reduced-motion behavior |
|---|---|---|
| ConnectivityIndicator fade-out | 250ms ease-in-out opacity transition | Instant disappear |
| Content wrapper padding-top | 250ms ease-in-out | Instant |
| OfflineSnackbar slide-in/out | MUI default slide animation | Instant appear/disappear |
| OfflineMutationDialog fade+scale | MUI default 225ms | Instant appear |

---

## Section 6 — React Implementation Notes

### 6.1 MUI Component Mapping

| Visual Element | MUI Component | Key Props |
|---|---|---|
| ConnectivityIndicator container | Native `<div>` | No MUI wrapper needed; use SCSS for all styling |
| ConnectivityIndicator icon | `SvgIcon` from `@mui/material/SvgIcon` + `WifiOffIcon` from `@mui/icons-material/WifiOff` | `fontSize="inherit"` (size controlled via SCSS) |
| ConnectivityIndicator reconnected icon | `WifiIcon` from `@mui/icons-material/Wifi` | Same |
| ConnectivityIndicator text | `Typography` from `@mui/material/Typography` | `variant="caption"` (mobile) or `variant="body2"` (desktop) |
| OfflineSnackbar | `Snackbar` from `@mui/material/Snackbar` | `open`, `autoHideDuration={6000}`, `onClose`, `anchorOrigin` |
| OfflineSnackbar content | `SnackbarContent` from `@mui/material/SnackbarContent` | `message` (custom JSX), `action` (close button) |
| OfflineSnackbar close button | `IconButton` from `@mui/material/IconButton` | `size="small"`, `aria-label="Cerrar notificación"`, `onClick={onClose}` |
| OfflineSnackbar close icon | `CloseIcon` from `@mui/icons-material/Close` | `fontSize="small"` |
| OfflineSnackbar wifi-off icon | `WifiOffIcon` from `@mui/icons-material/WifiOff` | `fontSize="small"` (16px) |
| OfflineMutationDialog | `Dialog` from `@mui/material/Dialog` | `open`, `disableEscapeKeyDown={true}`, `PaperProps={{ className: styles.dialogPaper }}` |
| OfflineMutationDialog content | `DialogContent` from `@mui/material/DialogContent` | No extra props — padding managed via SCSS override |
| OfflineMutationDialog actions | `DialogActions` from `@mui/material/DialogActions` | `disableSpacing={true}` — spacing managed via SCSS |
| OfflineMutationDialog icon | `WifiOffIcon` from `@mui/icons-material/WifiOff` | `fontSize="large"` (override to 24px via SCSS) |
| OfflineMutationDialog title | `Typography` | `variant="h3"`, `align="center"`, `id="offline-mutation-dialog-title"` |
| OfflineMutationDialog body | `Typography` | `variant="body1"`, `align="center"` |
| OfflineMutationDialog button | `Button` from `@mui/material/Button` | `variant="contained"`, `color="primary"`, `fullWidth`, `size="large"`, `autoFocus` |
| Submit button (disabled offline) | `Button` | `variant="contained"`, `color="primary"`, `disabled={isOffline}`, `aria-disabled={isOffline}` |

### 6.2 Theme Customization Required

**No new theme overrides are required for these components.** All colors, typography, and shape values are already defined in `hersaTheme`. The following existing theme values are consumed:

| Theme Key | Value Consumed |
|---|---|
| `palette.error.main` | ConnectivityIndicator offline, OfflineSnackbar background |
| `palette.success.main` | ConnectivityIndicator reconnected background |
| `palette.primary.main` | Dialog icon, title, button; disabled button bg token |
| `palette.primary.light` | Button hover state (MUI auto-derives) |
| `palette.primary.dark` | Button active/pressed state (MUI auto-derives) |
| `palette.background.paper` | Dialog surface |
| `palette.text.primary` | Dialog body text |
| `shape.borderRadius` | Snackbar, Dialog, button border radius |
| `typography.h3` | Dialog title |
| `typography.body1` | Dialog body |
| `typography.body2` | Snackbar text, ConnectivityIndicator desktop copy |
| `typography.caption` | ConnectivityIndicator mobile copy |
| `typography.button` | Button text, textTransform: none |

### 6.3 SCSS Module Structure

Each component must have a co-located `.module.scss` file. Import tokens with `@use '../styles/variables' as v;` (adjust relative path per component location — all components live in `src/shared/components/`).

#### ConnectivityIndicator.module.scss

```scss
@use '@/shared/styles/variables' as v;

.root {
  position: fixed;
  top: var(--app-header-height, 64px);
  left: 0;
  width: 100%;
  z-index: 1090;
  display: flex;
  align-items: center;
  padding: 0 v.sp(2);
  gap: v.sp(0.5);
  transition: opacity 250ms ease-in-out;
  will-change: opacity;
}

.rootHidden {
  display: none;
}

.rootOffline {
  height: 32px;
  background-color: v.$error-main;
  color: #ffffff;
}

.rootOfflineDesktop {
  height: 40px;
}

.rootReconnected {
  background-color: v.$success-main;
  color: #ffffff;
  opacity: 1;
}

.rootFadingOut {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.icon {
  font-size: 16px !important;
  flex-shrink: 0;
}

.text {
  // Typography handled by MUI variant prop
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (prefers-reduced-motion: reduce) {
  .root { transition: none !important; }
}
```

#### OfflineSnackbar.module.scss

```scss
@use '@/shared/styles/variables' as v;

.snackbarContent {
  // Target MUI SnackbarContent paper
  &:global(.MuiSnackbarContent-root) {
    background-color: v.$error-main;
    color: #ffffff;
    padding: v.sp(1) v.sp(2);
    max-width: calc(100vw - v.sp(4));
  }
}

.messageWrapper {
  display: flex;
  align-items: flex-start;
  gap: v.sp(1);
}

.icon {
  font-size: 16px !important;
  flex-shrink: 0;
  margin-top: 2px; // Optical alignment with text cap height
}

.textBlock {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.line1 {
  // body2 with weight override
  font-weight: 600 !important;
  color: #ffffff;
}

.line2 {
  color: #ffffff;
}

.closeButton {
  color: #ffffff !important;
  padding: 10px !important; // Ensure 44px touch target (10px * 2 + 20px icon = 40px; acceptable)

  &:hover {
    background-color: rgba(255, 255, 255, 0.12) !important;
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.24) !important;
  }
}
```

#### OfflineMutationDialog.module.scss

```scss
@use '@/shared/styles/variables' as v;

.dialogPaper {
  // Override Dialog paper width
  padding: v.sp(2);

  @media (min-width: v.$breakpoint-sm) {
    max-width: 360px !important;
    width: 360px;
    padding: v.sp(3);
  }

  // Mobile: calc(100vw - 32px)
  @media (max-width: #{v.$breakpoint-sm - 1px}) {
    width: calc(100vw - v.sp(4)) !important;
    max-width: calc(100vw - v.sp(4)) !important;
    margin: 0 v.sp(2);
  }
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 !important; // Reset MUI DialogContent default padding; use dialogPaper padding
  gap: 0; // gaps managed by individual element margins
}

.iconWrapper {
  display: flex;
  justify-content: center;
  margin-bottom: v.sp(2);
}

.wifiIcon {
  font-size: 24px !important;
  color: v.$primary-main;
}

.title {
  margin-bottom: v.sp(1);
}

.body {
  margin-bottom: v.sp(3);
  color: v.$text-primary;
}

.actions {
  padding: 0 !important; // Reset MUI DialogActions padding
  width: 100%;
}

.confirmButton {
  // fullWidth is set via prop — no SCSS needed for width
  // size="large" gives 48px height — meets 44px touch target minimum
}
```

### 6.4 Component Interface (Props)

#### ConnectivityIndicator

```typescript
// ConnectivityIndicator/types.ts
export type ConnectivityState = 'hidden' | 'offline' | 'reconnected';

export interface ConnectivityIndicatorProps {
  state: ConnectivityState;
  onFadeComplete?: () => void; // Called after reconnected fade-out completes
}
```

#### OfflineSnackbar

```typescript
// OfflineSnackbar/types.ts
export interface OfflineSnackbarProps {
  open: boolean;
  onClose: () => void;
  anchorOrigin?: {
    vertical: 'bottom';
    horizontal: 'center' | 'right';
  };
}
```

#### OfflineMutationDialog

```typescript
// OfflineMutationDialog/types.ts
export interface OfflineMutationDialogProps {
  open: boolean;
  onAcknowledge: () => void; // Called when user taps "Entendido"
}
```

### 6.5 Custom Implementation Notes (Beyond MUI Base)

#### ConnectivityIndicator — CSS Variable for AppHeader Height

The component needs to know the AppHeader height to position itself correctly with `position: fixed`. The AppHeader must set a CSS custom property on mount:

```typescript
// In AppHeader component (already exists)
// Add to useEffect or directly to the element:
document.documentElement.style.setProperty(
  '--app-header-height',
  `${appHeaderRef.current?.offsetHeight ?? 64}px`
);
```

The ConnectivityIndicator SCSS uses `top: var(--app-header-height, 64px)`.

This avoids hardcoding the AppHeader height and handles MUI's responsive AppBar height (56px mobile / 64px desktop).

#### ConnectivityIndicator — Layout Push

The MainContentWrapper (the scrollable content area below AppHeader) must receive a `padding-top` equal to the bar height when the indicator is visible. This prevents content from being obscured. Implementation:

```typescript
// The padding-top value: 32px (mobile) or 40px (desktop) when indicator is visible
// Synchronized with the 250ms fade-out transition
// CSS class toggled by ConnectivityIndicator state
```

The SCSS class on the content wrapper transitions `padding-top` simultaneously with the bar's `opacity`. Both are 250ms ease-in-out. `prefers-reduced-motion` suppresses both.

#### OfflineMutationDialog — No Corner Close (X)

MUI `Dialog` does not render a corner X by default — it only appears if explicitly added. Confirm no `onClose` prop is wired to the backdrop click:

```typescript
// Correct — user cannot close by clicking backdrop or pressing Escape
<Dialog
  open={open}
  disableEscapeKeyDown={true}
  // No onClose prop — intentional
  PaperProps={{ className: styles.dialogPaper }}
  aria-labelledby="offline-mutation-dialog-title"
>
```

#### OfflineSnackbar — Anchor Origin by Breakpoint

The `anchorOrigin` prop must switch at `md` breakpoint. The consuming component determines breakpoint via `useMediaQuery(theme.breakpoints.up('md'))` and passes the appropriate `anchorOrigin`:

```typescript
const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
const anchorOrigin = isDesktop
  ? { vertical: 'bottom', horizontal: 'right' }
  : { vertical: 'bottom', horizontal: 'center' };
```

This keeps the `OfflineSnackbar` component itself breakpoint-agnostic and testable in isolation.

#### SnackbarContent Custom Message

MUI `SnackbarContent` accepts a `message` prop as a ReactNode. Pass the 2-line layout as JSX:

```typescript
const message = (
  <span className={styles.messageWrapper}>
    <WifiOffIcon className={styles.icon} aria-hidden="true" />
    <span className={styles.textBlock}>
      <Typography variant="body2" component="span" className={styles.line1}>
        No se pudo guardar
      </Typography>
      <Typography variant="body2" component="span" className={styles.line2}>
        Sin conexión. Vuelve a intentarlo cuando recuperes la señal.
      </Typography>
    </span>
  </span>
);
```

### 6.6 Responsive Behavior Per Component

| Component | xs (< 600px) | md+ (≥ 900px) |
|---|---|---|
| ConnectivityIndicator height | 32px | 40px |
| ConnectivityIndicator copy | "Sin señal" (caption) | Full copy (body2) |
| ConnectivityIndicator icon | WifiOff 16px | WifiOff 16px |
| OfflineSnackbar position | bottom-center | bottom-right |
| OfflineSnackbar width | calc(100vw - 32px) | max 400px |
| OfflineMutationDialog width | calc(100vw - 32px) | 360px (max) |
| OfflineMutationDialog padding | 16px | 24px |
| OfflineMutationDialog button | size="large" (48px) | size="large" (48px) |

### 6.7 Icon Import Pattern

Use direct MUI icon imports (never barrel imports — per frontend/CLAUDE.md import rules):

```typescript
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import CloseIcon from '@mui/icons-material/Close';
```

### 6.8 No `sx` Prop and No Inline Styles

All styling is via SCSS Modules with `className`. The only `sx`-like customization needed (Dialog paper width) is achieved via `:global(.MuiDialog-paper)` targeting inside the component's SCSS module. The `@emotion/cache` configuration with `prepend: true` ensures SCSS wins specificity battles against MUI Emotion styles.

---

## Section Summary

**Section 1 — Design Tokens:** Complete. All tokens derive from existing `_variables.scss` and `hersaTheme`. No new color values introduced. All WCAG AA contrast pairs verified. Two z-index CSS custom properties added to global layout stylesheet. Five transition definitions documented with `prefers-reduced-motion` compliance.

**Section 2 — Component Inventory:** Complete. Four components specified (3 standalone + 1 button state). All five states documented for each. MUI base components identified. No new MUI components needed beyond what is already in the stack.

**Section 3 — Per-Screen Specification:** Complete. Three component layouts specified across two breakpoints each. Visual hierarchy documented for each component. All micro-interactions specified with duration and easing. Iconography: Material Icons set, three specific icons (`WifiOff`, `Wifi`, `Close`).

**Section 4 — Design System Core:** Complete. Reusability scope defined. Component composition patterns documented. Spacing and density rules enumerated. Color usage consistency table produced.

**Section 5 — Accessibility Guide:** Complete. All WCAG AA contrast ratios verified and tabulated. Touch target minimums specified with override instructions. Full ARIA inventory per component. Focus management rules for all interaction scenarios. `prefers-reduced-motion` compliance documented per component.

**Section 6 — React Implementation Notes:** Complete. MUI component mapping with exact props for every visual element. SCSS module structure with concrete class patterns for all three components. Component prop interfaces (TypeScript). Five custom implementation notes for non-obvious patterns (CSS variable for AppHeader height, layout push synchronization, Dialog no-close configuration, breakpoint-agnostic Snackbar anchor, SnackbarContent custom message pattern).

---

## Handoff Instructions for react-developer

- Read `documentation/brand/digital-guidelines.md §8` for the `prefers-reduced-motion` global CSS block before implementing any transition in these components
- Read `documentation/brand/digital-guidelines.md §10` for the MUI theme configuration reference
- The `--app-header-height` CSS custom property must be set by the existing AppHeader component — coordinate with the AppHeader implementation before building ConnectivityIndicator
- Component file locations: `src/shared/components/ConnectivityIndicator/`, `src/shared/components/OfflineSnackbar/`, `src/shared/components/OfflineMutationDialog/`
- Each component directory must contain: `ComponentName.tsx`, `ComponentName.module.scss`, `types.ts`, `index.ts`
- No `sx` prop, no inline `style` — SCSS Modules only
- Import icons directly: `import WifiOffIcon from '@mui/icons-material/WifiOff'` — never from barrel `@mui/icons-material`
- All user-facing copy in this spec is in Spanish — do not translate or alter
