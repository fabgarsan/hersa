# Theme Tokens — Eventos Hersa

> **Agents:** react-developer, tdd-writer, ui-designer
> **Load when:** Styling components, defining the MUI theme, or adding new brand assets
> **Brand authority:** `documentation/brand/brand-manual.md` — read that first for visual rationale; this file is the implementation reference
> **Summary:** Brand identity, color palette, typography, and logo rules for the Hersa design system

The application follows the **Togas HERSA** brand identity. Always use these tokens when styling components; never introduce arbitrary colors.

## Color tokens

Define in `src/shared/styles/theme.ts` using MUI `createTheme`:

```ts
// src/shared/styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const hersaTheme = createTheme({
  palette: {
    primary: {
      main:  '#0B1F3A',   // Deep navy — headers, AppBar, primary buttons
      dark:  '#122640',   // Dark navy — sidebar, drawers, secondary surfaces
      light: '#1E3A5F',   // Mid navy — hover states, emphasized borders
      contrastText: '#C9A227',
    },
    secondary: {
      main:  '#C9A227',   // Gold — CTAs, accents, highlighted icons, active links
      light: '#E8D49A',   // Light gold — hover on gold elements, chips
      dark:  '#A07B10',   // Dark gold — pressed/active states
      contrastText: '#0B1F3A',
    },
    background: {
      default: '#F5F5F5', // App-wide page background
      paper:   '#FFFFFF', // Cards, modals, drawers
    },
    text: {
      primary:   '#1A1A1A', // Primary text (brand black)
      secondary: '#5F5E5A', // Secondary / muted text
    },
    // Semantic states — always use standard MUI color props, never hardcode
    success: { main: '#3B6D11', light: '#EAF3DE' },  // Delivered / Active
    warning: { main: '#854F0B', light: '#FAEEDA' },  // Pending / In progress
    error:   { main: '#A32D2D', light: '#FCEBEB' },  // Overdue / Error
    info:    { main: '#185FA5', light: '#E6F1FB' },  // Informational
  },
});
```

## Usage rules

| Context | Token |
|---------|-------|
| AppBar / Header | `primary.main` (#0B1F3A) with `secondary.main` (#C9A227) text |
| Sidebar / Drawer | `primary.dark` (#122640) |
| Primary button | `variant="contained" color="primary"` → navy background, gold text |
| Secondary button | `variant="outlined" color="primary"` → navy border |
| Accent / floating CTA | `color="secondary"` → gold with navy text |
| Active nav item | `secondary.main` text, `borderBottom: 2px solid secondary.main` |
| Status badge | `color="success" \| "warning" \| "error" \| "info"` via MUI `Chip` |
| Text on dark backgrounds | Always white `#FFFFFF` or gold `#C9A227`, never gray |

## Logo

- SVG/PNG file located at `src/shared/assets/logo-hersa.svg`.
- Full variant (with "HERSA" wordmark): use on the login screen and splash screen.
- Icon variant (mortarboard + H only): use in collapsed AppBar and mobile views.
- **Never modify** the logo's proportions or colors in any component.
- Logo background: always `primary.main` or white — never on gold or semantic color backgrounds.

## Typography

Two-font system: **Inter** (functional, all UI and B2B) + **Playfair Display** (celebratory, B2C headlines only).

```ts
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 600, color: '#0B1F3A' },
  h2: { fontWeight: 600, color: '#0B1F3A' },
  h3: { fontWeight: 500, color: '#0B1F3A' },
  button: { textTransform: 'none', fontWeight: 500 }, // no automatic uppercase
  // Playfair Display — celebratory display variant for B2C portal only
  // Usage: welcome screens, graduation confirmation, photo delivery, package delivery
  // Load via Google Fonts: family=Playfair+Display:wght@400;700
},
```

**Playfair Display** is NOT in the theme yet — add it before using in B2C surfaces. See `documentation/brand/digital-guidelines.md §3` for the implementation snippet. Never use Playfair Display in the B2B institutional portal.

## Brand rules

- Use `hersaTheme` in the root `ThemeProvider`; never hardcode `#0B1F3A` or `#C9A227` inside components.
- Use `color="primary"` / `color="secondary"` on MUI components; never `style={{ color: '#...' }}` for brand colors.
- Place the logo on navy or white backgrounds; never on gold or semantic color backgrounds.
- Use `Chip` with `color="success/warning/error"` for statuses; never custom-colored badges outside the theme.
- `textTransform: 'none'` on buttons is already set in the theme — do not re-enable automatic uppercase.
