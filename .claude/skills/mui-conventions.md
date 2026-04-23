# MUI Conventions — Hersa

## Theme — hersaTheme

The centralized theme lives at `src/shared/styles/theme.ts`. **Never hardcode brand colors in components.**

```ts
// Brand tokens — Hersa / Togas
primary.main:        '#0B1F3A'   // Navy — AppBar, primary buttons, headers
primary.dark:        '#122640'   // Dark navy — sidebar, drawers
primary.light:       '#1E3A5F'   // Mid navy — hover states, emphasized borders
primary.contrastText:'#C9A227'   // Gold on navy

secondary.main:      '#C9A227'   // Gold — CTAs, accents, active nav
secondary.light:     '#E8D49A'   // Light gold — hover on gold elements
secondary.dark:      '#A07B10'   // Dark gold — pressed/active states
secondary.contrastText:'#0B1F3A'// Navy on gold

background.default:  '#F5F5F5'  // App-wide page background
background.paper:    '#FFFFFF'   // Cards, modals, drawers
text.primary:        '#1A1A1A'
text.secondary:      '#5F5E5A'
```

## Color usage rules

| Context | MUI prop to use |
|---------|-----------------|
| AppBar / Header | `color="primary"` (navy) with gold text |
| Sidebar / Drawer | `sx={{ bgcolor: 'primary.dark' }}` |
| Primary button | `variant="contained" color="primary"` |
| Secondary button | `variant="outlined" color="primary"` |
| Floating CTA / accent | `color="secondary"` (gold, navy text) |
| Active nav item | `color="secondary"` + `borderBottom` |
| Active status | `<Chip color="success">` |
| Pending status | `<Chip color="warning">` |
| Error / overdue status | `<Chip color="error">` |
| Informational | `<Chip color="info">` |

## Imports — always direct for tree shaking

```typescript
// ✅ Correct
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ❌ Incorrect — barrel import
import { Button, Box, Typography } from '@mui/material';
```

## Preferred components

| Use case | Component |
|----------|-----------|
| Data tables | `DataGrid` from `@mui/x-data-grid` |
| Forms | `TextField` + RHF `Controller` |
| Modals | `Dialog` — never a custom implementation |
| Content loading | `Skeleton` |
| Action loading | `CircularProgress` |
| Status badges | `Chip` with semantic `color` |
| Sidebar | `Drawer` |
| Sub-navigation | `Tabs` |
| Notifications | `Snackbar` + `Alert` |

## Styles

- `sx` prop only for unique, non-repetitive styles
- For reusable styles: `styled()` from `@mui/material/styles`
- Never CSS modules or manual CSS classes
- Never `style={{ color: '#...' }}` for brand colors
- Never fixed `px` for spacing — use `theme.spacing()` or theme values: `sx={{ p: 2, mt: 3 }}`
- Responsive always with theme breakpoints: `sx={{ display: { xs: 'none', md: 'block' } }}`

## Layout

- `Grid2` (new Grid from MUI v6) for multi-column page layouts
- `Stack` for aligning elements in a single direction
- `Box` as a semantic div with theme access

## Hersa logo

- SVG at `src/shared/assets/logo-hersa.svg`
- Full variant (with wordmark): login and splash screens
- Icon variant (mortarboard + H): collapsed AppBar and mobile views
- Background always `primary.main` or white — never on gold or semantic color backgrounds
- Never modify the logo's proportions or colors

## Typography

- `fontFamily`: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`
- Headings with `color: 'primary.main'` — already defined in the theme
- Buttons without automatic uppercase — already configured in theme: `textTransform: 'none'`
- Never write `textTransform: 'none'` per component (it is already in the theme)
