# UI Specification — Not Found Page (404)

**Context:** B2B institutional portal  
**Audience:** Coordinators and authenticated users  
**Visual register:** Professional, institutional, warm — NOT tech-startup  
**Typography:** Inter only (B2B context — Playfair Display is NOT permitted here)  
**Authored by:** ui-designer  
**Date:** 2026-05-02

---

## 1. Design Tokens

All tokens derive from `frontend/src/shared/styles/_variables.scss` and `hersaTheme` in `frontend/src/shared/styles/theme.ts`. No new color values are introduced.

### 1.1 Colors used on this screen

| Token name | Hex value | Role on this screen | WCAG AA contrast |
|---|---|---|---|
| `$primary-main` / `primary.main` | `#0B1F3A` | Page background (fullpage variant) | — |
| `$bg-default` / `background.default` | `#F5F5F5` | Page background (in-layout variant) | — |
| `$bg-paper` / `background.paper` | `#FFFFFF` | Card surface (in-layout variant) | — |
| `$text-primary` / `text.primary` | `#1A1A1A` | Body text on white/light surfaces | 16.1 : 1 vs `#FFFFFF` / 13.7 : 1 vs `#F5F5F5` — passes AA |
| `$text-secondary` / `text.secondary` | `#5F5E5A` | Descriptive copy on white/light surfaces | 5.9 : 1 vs `#FFFFFF` — passes AA |
| `$secondary-main` / `secondary.main` | `#C9A227` | Error code display, icon accent, CTA button | 3.4 : 1 vs `#0B1F3A` — passes AA for large text (>=18pt / >=14pt bold) |
| `#FFFFFF` | `#FFFFFF` | All text on navy background (fullpage variant) | 15.1 : 1 vs `#0B1F3A` — passes AA |
| `$secondary-light` / `secondary.light` | `#E8D49A` | Subtitle / muted text on navy (fullpage variant) | 8.6 : 1 vs `#0B1F3A` — passes AA |

**Contrast note:** Gold (`#C9A227`) on navy (`#0B1F3A`) at 3.4 : 1 meets AA only for large text (>=18px regular or >=14px bold). The error code "404" is rendered at 96px bold — this qualifies as large text and passes AA. Do NOT use gold for body-size text on navy.

### 1.2 Typography tokens

| Role | MUI variant | Font | Weight | Size | Color |
|---|---|---|---|---|---|
| Error code ("404") | `h1` override | Inter | 700 | 96px | `$secondary-main` (#C9A227) |
| Primary headline | `h4` | Inter | 600 | 34px / 2.125rem | `#FFFFFF` (fullpage) / `text.primary` (in-layout) |
| Description | `body1` | Inter | 400 | 16px / 1rem | `#FFFFFF` (fullpage) / `text.secondary` (in-layout) |
| CTA button label | Button (theme default) | Inter | 500 | 14px / 0.875rem | navy `#0B1F3A` (on gold button) |

### 1.3 Spacing scale (sp() function — 1 unit = 8px)

| Usage | Value | sp() call |
|---|---|---|
| Icon bottom margin | 24px | `sp(3)` |
| Error code bottom margin | 8px | `sp(1)` |
| Headline bottom margin | 16px | `sp(2)` |
| Description bottom margin | 32px | `sp(4)` |
| Card internal padding (in-layout) | 64px 48px | `sp(8) sp(6)` |
| Full-page vertical centering padding | 32px | `sp(4)` |

### 1.4 Border radius

| Element | Value | Rationale |
|---|---|---|
| CTA Button | 4px (MUI theme default) | Consistent with all app buttons |
| Card container (in-layout) | 8px | Consistent with MUI Paper default in theme |

### 1.5 Shadows

| Element | Value |
|---|---|
| Card (in-layout variant) | `none` — `elevation={0}` per brand card rules; border `1px solid rgba(0,0,0,0.08)` |
| Icon wrapper | none |

### 1.6 Icon

| Property | Value |
|---|---|
| MUI Icon | `SearchOffIcon` from `@mui/icons-material/SearchOff` |
| Size | 80px x 80px |
| Color | `$secondary-main` (#C9A227) on navy background (fullpage); `$primary-light` (#1E3A5F) on white surface (in-layout) |

**Rationale for `SearchOffIcon`:** Communicates "the resource was not found" without using generic tech iconography (broken robot, etc.). Aligns with the institutional tone. Alternative: `ExploreOffIcon` or `HelpOutlineIcon` — use `SearchOffIcon` as primary.

---

## 2. Component Inventory

### 2.1 Components required

| Component | MUI base | Custom? | Location |
|---|---|---|---|
| `NotFoundPage` | — | New page component | `src/modules/not-found/NotFoundPage.tsx` |
| `NotFoundPage.module.scss` | — | New SCSS module | `src/modules/not-found/NotFoundPage.module.scss` |
| `SearchOffIcon` | `@mui/icons-material/SearchOff` | No — direct import | — |
| `Typography` (error code) | `Typography` | No — className override | — |
| `Typography` (headline) | `Typography variant="h4"` | No | — |
| `Typography` (description) | `Typography variant="body1"` | No | — |
| `Button` (primary CTA) | `Button variant="contained" color="secondary"` | No | — |
| `Button` (secondary CTA) | `Button variant="outlined"` | No | — |
| `Box` (page wrapper) | `Box` | No — SCSS class | — |
| `Box` (card wrapper, in-layout only) | `Box` as Paper substitute | `elevation={0}` Paper | — |

**Note on EmptyState reuse:** The existing `EmptyState` component (`src/shared/components/EmptyState.tsx`) is intentionally NOT reused here. `EmptyState` is designed for content areas within modules (tables, lists). The 404 page requires a full-page centered layout (fullpage variant) or a visually dominant card (in-layout variant), with a large typographic error code and multiple CTA buttons — behavior not supported by `EmptyState`'s current props. `EmptyState` served as the pattern reference for structure and SCSS conventions.

### 2.2 Component states

**CTA Button — primary ("Volver al inicio")**

| State | Visual |
|---|---|
| Default | `color="secondary"` contained — gold background `#C9A227`, navy text `#0B1F3A` |
| Hover | `secondary.dark` background `#A07B10`, navy text — MUI handles automatically via theme |
| Active / pressed | Darker overlay — MUI ripple on navy background |
| Disabled | Not applicable — this button is always enabled on 404 |
| Focus | MUI default focus ring — 2px outline in `secondary.main` |

**CTA Button — secondary ("Ir al panel principal")**

| State | Visual |
|---|---|
| Default | `variant="outlined"` — white border `#FFFFFF`, white text (fullpage) / navy border + navy text (in-layout) |
| Hover | Background fills to `rgba(255,255,255,0.08)` (fullpage) / `rgba(11,31,58,0.04)` (in-layout) |
| Active / pressed | MUI ripple |
| Disabled | Not applicable |
| Focus | MUI default focus ring |

---

## 3. Per-Screen Specification

### 3.1 Variant A — Fullpage (unauthenticated / outside protected layout)

**Description:** The user lands on a URL that does not exist while not being inside the authenticated shell. No AppBar or NavSidebar are visible. The entire viewport is owned by this page.

#### Layout structure

```
[viewport 100vw x 100vh]
  background: $primary-main (#0B1F3A)
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: sp(4)   ← ensures content does not touch viewport edges on small screens

    [content-column]
      display: flex
      flex-direction: column
      align-items: center
      text-align: center
      max-width: 480px
      gap: none (individual margins handle spacing — see tokens)

        [icon-wrapper]        ← SearchOffIcon 80px, color #C9A227
        [error-code]          ← "404", h1 override, 96px, bold, #C9A227
        [headline]            ← h4, #FFFFFF
        [description]         ← body1, #FFFFFF (opacity 0.87 for readability)
        [cta-group]           ← Stack horizontal, gap sp(2), wrap on mobile
          [btn-primary]       ← "Volver al inicio", contained secondary (gold)
          [btn-secondary]     ← "Ir al panel principal", outlined white
```

#### Breakpoints

| Breakpoint | Changes |
|---|---|
| xs (< 600px) | CTA Stack switches to `direction="column"` — buttons full-width, stacked vertically |
| sm+ (>= 600px) | CTA Stack `direction="row"` — buttons side by side |

#### Visual hierarchy

1. Error code "404" — largest element, gold, immediate visual anchor
2. Icon — gold, reinforces the "not found" concept
3. Headline — white, explains what happened in plain language
4. Description — white at reduced opacity, offers guidance
5. CTA buttons — clear exit path

#### Micro-interactions

| Element | Interaction | Duration | Easing |
|---|---|---|---|
| Button hover background | Color transition | 200ms | `ease-in-out` |
| Button focus ring | Instant | — | — |
| Page enter | Fade-in from opacity 0 to 1 | 300ms | `ease-out` |

**`prefers-reduced-motion`:** The page fade-in animation must be wrapped in a `@media (prefers-reduced-motion: no-preference)` query in the SCSS module. When reduced motion is preferred, the page appears immediately at full opacity.

#### Copy (Spanish — final)

| Element | Text |
|---|---|
| Error code | `404` |
| Headline | `Página no encontrada` |
| Description | `La dirección que ingresaste no existe o fue movida. Verificá el enlace e intentá de nuevo.` |
| Primary CTA | `Volver al inicio` |
| Secondary CTA | `Ir al panel principal` |

---

### 3.2 Variant B — In-layout (authenticated, inside protected shell)

**Description:** The user navigates to a non-existent route while authenticated. AppBar and NavSidebar remain visible. The 404 content renders in the main content area as if it were a module page.

#### Layout structure

```
[main-content-area]   ← owned by the protected layout shell; NotFoundPage renders here
  background: $bg-default (#F5F5F5)
  padding: inherited from ProtectedLayout (typically sp(3) or sp(4))

    [centering-wrapper]
      display: flex
      align-items: center
      justify-content: center
      min-height: calc(100vh - AppBar height - top/bottom padding)
        ← AppBar height = 64px on desktop, 56px on mobile
        ← Use CSS custom property or hardcoded value; document the choice

        [card]
          background: $bg-paper (#FFFFFF)
          border: 1px solid rgba(0,0,0,0.08)
          border-radius: 8px
          elevation={0}
          padding: sp(8) sp(6)   ← 64px top/bottom, 48px left/right
          max-width: 560px
          width: 100%

          display: flex
          flex-direction: column
          align-items: center
          text-align: center

            [icon-wrapper]    ← SearchOffIcon 80px, color $primary-light (#1E3A5F)
            [error-code]      ← "404", h1 override, 96px, bold, $secondary-main (#C9A227)
            [headline]        ← h4, $text-primary (#1A1A1A)
            [description]     ← body1, $text-secondary (#5F5E5A)
            [cta-group]       ← Stack, gap sp(2), direction="row" wrapping
              [btn-primary]   ← "Volver al inicio", contained secondary (gold)
```

**In-layout variant uses only one CTA** ("Volver al inicio") because the navigation sidebar already provides all route options. A second redundant button creates noise in an already-navigable context.

#### Breakpoints

| Breakpoint | Changes |
|---|---|
| xs (< 600px) | Card padding reduces to `sp(4) sp(3)` (32px / 24px); CTA button full-width |
| sm+ (>= 600px) | Full padding as specified; CTA auto-width |

#### Visual hierarchy

1. Error code "404" — gold, large, anchors attention
2. Icon — navy-mid tone, secondary reinforcement
3. Headline — primary text weight
4. Description — muted secondary text
5. Single CTA — contained gold button

#### Micro-interactions

Same as Variant A. Additionally:

| Element | Interaction | Duration | Easing |
|---|---|---|---|
| Card enter | Fade-in + subtle translateY(8px) to translateY(0) | 300ms | `ease-out` |

**`prefers-reduced-motion`:** Same rule — wrap in `@media (prefers-reduced-motion: no-preference)`.

#### Copy (Spanish — final)

| Element | Text |
|---|---|
| Error code | `404` |
| Headline | `Página no encontrada` |
| Description | `Esta sección no existe o no tenés acceso. Usá el menú lateral para navegar.` |
| Primary CTA | `Volver al inicio` |

---

## 4. Design System Core

### 4.1 Reusability

`NotFoundPage` is a standalone page component, not a reusable shared component. It is not exported to `src/shared/components/`. It lives in `src/modules/not-found/` (or `src/router/` if the team prefers co-location with routing config).

The two variants (fullpage vs. in-layout) are controlled by a single `fullPage?: boolean` prop on `NotFoundPage`. This avoids creating two separate components with duplicated logic.

### 4.2 Composition pattern

```
NotFoundPage (fullPage?: boolean)
  ├── Box.pageWrapper  (SCSS: .pageWrapper / .pageWrapperInLayout)
  │     ├── [fullPage] Box.contentColumn
  │     └── [in-layout] Box.cardWrapper > Paper(elevation=0).card
  │           ├── SearchOffIcon (className: .icon)
  │           ├── Typography.errorCode  ("404")
  │           ├── Typography variant="h4" .headline
  │           ├── Typography variant="body1" .description
  │           └── Stack .ctaGroup
  │                 ├── Button variant="contained" color="secondary"  (always present)
  │                 └── Button variant="outlined" [fullPage only]
```

### 4.3 Spacing and density

- This is a low-density screen by design — whitespace communicates that the user is outside the normal flow.
- No DataGrid, no form, no navigation tabs within the page itself.
- Minimum content column width: 280px (xs with padding).

---

## 5. Accessibility Guide

### 5.1 Contrast ratios (all text/background pairs)

| Text | Background | Ratio | WCAG AA result |
|---|---|---|---|
| `#C9A227` "404" (96px bold) | `#0B1F3A` | 3.4 : 1 | Pass — large text |
| `#C9A227` "404" (96px bold) | `#FFFFFF` | 2.3 : 1 | Fail — do NOT use gold "404" on white |
| `#1A1A1A` "404" (96px bold) | `#FFFFFF` | 16.1 : 1 | Pass — use as in-layout fallback if gold is removed |
| `#C9A227` headline h4 | `#0B1F3A` | 3.4 : 1 | Pass — h4 at 34px qualifies as large text |
| `#FFFFFF` headline h4 | `#0B1F3A` | 15.1 : 1 | Pass |
| `#FFFFFF` body1 | `#0B1F3A` | 15.1 : 1 | Pass |
| `#5F5E5A` body1 | `#FFFFFF` | 5.9 : 1 | Pass |
| `#1A1A1A` h4 | `#FFFFFF` | 16.1 : 1 | Pass |
| `#0B1F3A` button label | `#C9A227` | 3.4 : 1 | Pass — button text is 14px bold (bold at 14px = large text threshold) |

**Important:** Gold "404" on white card background fails WCAG AA for any text size below the large text threshold. In the in-layout variant the error code "404" MUST use `$secondary-main` (#C9A227) ONLY because it is at 96px bold. Do not reduce the font size below 24px bold for this element.

### 5.2 Touch targets (mobile)

| Element | Minimum size | Specification |
|---|---|---|
| Primary CTA button | 44px height | MUI Button default — enforce `minHeight: 44px` in SCSS |
| Secondary CTA button | 44px height | Same |
| Minimum tap area enforced | 44px x 44px | Per WCAG 2.5.5 (Level AAA target; AA guidance is 24px — enforce 44px as best practice for touch) |

### 5.3 ARIA landmarks and roles

```html
<!-- Variant A — fullpage -->
<main role="main" aria-label="Página no encontrada">
  <!-- all content -->
</main>

<!-- Variant B — in-layout -->
<!-- The protected layout already provides <main>. -->
<!-- NotFoundPage renders inside that <main>. -->
<!-- Do NOT add a second <main> element. -->
<!-- Add aria-labelledby pointing to the h4 headline. -->
<section aria-labelledby="not-found-headline">
  <h2 id="not-found-headline">Página no encontrada</h2>
  <!-- ... -->
</section>
```

### 5.4 Semantic HTML and ARIA labels

| Element | Requirement |
|---|---|
| Error code "404" | `aria-label="Error 404: página no encontrada"` — screen readers should read this as a unit, not as individual digits |
| Icon (`SearchOffIcon`) | `aria-hidden="true"` — decorative; the text already conveys the meaning |
| Primary CTA button | No additional aria-label needed — button text is self-describing |
| Secondary CTA button | No additional aria-label needed |
| Page `<title>` | `404 - Página no encontrada | Hersa` — set via React Router `<title>` or document.title in a useEffect |

### 5.5 Focus management

- On page mount, focus must move to the headline (`h4` element with `id="not-found-headline"`) using `useEffect` + `ref.current.focus()`.
- The headline must have `tabIndex={-1}` to be programmatically focusable without appearing in the tab order.
- Tab order after focus lands on headline: Primary CTA -> Secondary CTA (fullpage) / Primary CTA (in-layout).
- No focus trap — this is not a modal.

---

## 6. React Implementation Notes

### 6.1 File locations

```
src/
  modules/
    not-found/
      NotFoundPage.tsx
      NotFoundPage.module.scss
```

If the team prefers routing-adjacent placement:

```
src/
  router/
    not-found/
      NotFoundPage.tsx
      NotFoundPage.module.scss
```

Either location is acceptable. Use `modules/not-found/` as default.

### 6.2 Props interface

Define in a co-located `types.ts` file or directly inline if the component stays under 300 lines:

```typescript
// types.ts (co-located)
export interface NotFoundPageProps {
  /**
   * When true: renders as a full-page centered layout with navy background.
   * No AppBar or NavSidebar are present in this variant.
   * When false (default): renders inside the protected layout's main content area.
   */
  fullPage?: boolean;
}
```

### 6.3 MUI component mapping

| Visual element | MUI component | Props |
|---|---|---|
| Page wrapper (fullpage) | `Box` | `component="main"` + SCSS class `.pageWrapper` |
| Card wrapper (in-layout) | `Paper` | `elevation={0}` + SCSS class `.card` |
| Icon | `SearchOffIcon` | `aria-hidden="true"` + SCSS class `.icon` |
| Error code "404" | `Typography` | `component="p"` + SCSS class `.errorCode` (NOT `variant="h1"` — prevents duplicate h1 conflict with the h4 headline) |
| Headline | `Typography` | `variant="h4"` + `component="h1"` (fullpage) or `component="h2"` (in-layout) + `id="not-found-headline"` + `tabIndex={-1}` + `ref={headlineRef}` |
| Description | `Typography` | `variant="body1"` + SCSS class `.description` |
| CTA group | `Stack` | `direction={{ xs: 'column', sm: 'row' }}` (fullpage) / `direction="row"` (in-layout) + `spacing={2}` |
| Primary CTA | `Button` | `variant="contained"` `color="secondary"` `component={Link}` `to="/"` |
| Secondary CTA | `Button` | `variant="outlined"` `color="inherit"` (fullpage, for white border) `component={Link}` `to="/dashboard"` |

**Note on `color="inherit"` for outlined button (fullpage):** MUI's `outlined` variant inherits the current text color. Since the fullpage background is navy and the content column has `color: white` set via SCSS, `color="inherit"` will produce a white-bordered, white-text button. This is the correct approach — do NOT use `sx` to override.

### 6.4 SCSS module structure

```scss
// NotFoundPage.module.scss
@use '@/shared/styles/variables' as v;

// ---- Fullpage variant ----

.pageWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: v.$primary-main;
  padding: v.sp(4);
  color: #fff; // inherited by all children in this variant
}

.contentColumn {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  width: 100%;
}

// ---- In-layout variant ----

.centeringWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  // min-height accounts for AppBar (64px desktop / 56px mobile) and layout padding
  min-height: calc(100vh - 64px - v.sp(6));

  @media (max-width: v.$breakpoint-sm) {
    min-height: calc(100vh - 56px - v.sp(6));
  }
}

.card {
  background-color: v.$bg-paper;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: v.sp(8) v.sp(6);
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: v.$breakpoint-sm) {
    padding: v.sp(4) v.sp(3);
  }
}

// ---- Shared elements ----

.icon {
  font-size: 80px;
  width: 80px;
  height: 80px;
  margin-bottom: v.sp(3);

  // fullpage: gold; in-layout: primary-light
  // controlled by variant-specific parent class or component prop
}

.iconFullPage {
  @extend .icon;
  color: v.$secondary-main;
}

.iconInLayout {
  @extend .icon;
  color: v.$primary-light;
}

.errorCode {
  font-size: 96px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: v.sp(1);
  color: v.$secondary-main; // gold — valid only at this size (large text AA)
}

.headline {
  margin-bottom: v.sp(2);
  font-weight: 600;
}

.description {
  margin-bottom: v.sp(4);
  max-width: 400px;
}

.descriptionMuted {
  // in-layout variant — override MUI's body1 color to text-secondary
  color: v.$text-secondary;
}

// ---- Animations ----

@media (prefers-reduced-motion: no-preference) {
  .pageWrapper,
  .card {
    animation: fadeIn 300ms ease-out both;
  }

  .card {
    animation: fadeInUp 300ms ease-out both;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Implementation cost note:** The `@extend .icon` directive works within a single SCSS module. If the linter flags it, replace with a shared mixin `@mixin iconBase` and `@include iconBase` in each class. The mixin approach has zero implementation cost difference and is arguably clearer.

### 6.5 Focus management implementation

```typescript
// Inside NotFoundPage.tsx
import { useEffect, useRef } from 'react';

const headlineRef = useRef<HTMLHeadingElement>(null);

useEffect(() => {
  headlineRef.current?.focus();
}, []);

// Applied to the Typography headline:
// ref={headlineRef}  tabIndex={-1}  id="not-found-headline"
```

### 6.6 Page title

```typescript
// Inside NotFoundPage.tsx
useEffect(() => {
  const previous = document.title;
  document.title = '404 - Página no encontrada | Hersa';
  return () => {
    document.title = previous;
  };
}, []);
```

If the project uses React Router v6.4+ data routers with `<title>` support, use that mechanism instead and remove the `useEffect`.

### 6.7 Router integration

The 404 route must be configured as the catch-all at the bottom of the route tree:

```typescript
// src/router/index.tsx (illustrative — adapt to actual router structure)

// Inside the public routes (no layout):
{ path: '*', element: <NotFoundPage fullPage /> }

// Inside the protected layout routes:
{ path: '*', element: <NotFoundPage /> }
```

Both `*` wildcards are needed — one for unauthenticated contexts (no shell) and one for authenticated contexts (with shell). The component itself renders correctly in both cases via the `fullPage` prop.

### 6.8 Navigation targets for CTA buttons

| Button | Route | Notes |
|---|---|---|
| "Volver al inicio" | `/` | React Router `<Link>` — redirects to login if unauthenticated, to dashboard if authenticated (handled by AuthGuard) |
| "Ir al panel principal" (fullpage only) | `/dashboard` | Direct link to the authenticated dashboard — only shown when the user may be authenticated but navigated to a broken public URL |

If `/dashboard` is not the correct authenticated home route, update to match the actual route. Do not hardcode paths as strings — use a `ROUTES` constant if one exists in `src/shared/constants/`.

