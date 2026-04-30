---
paths:
  - "frontend/src/**/*.tsx"
  - "frontend/src/**/*.ts"
---

# MUI Conventions — Hersa

## Preferred MUI components

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
| Multi-column layout | `Grid2` (MUI v6) with `size={{ xs, sm, md }}` prop |
| Single-direction alignment | `Stack` |

## Grid2 (MUI v6)

Use `Grid2` with the new `size` prop. Do **not** use the legacy `Grid` with `item` / `xs` / `sm` / `md` as separate props.

```tsx
import Grid2 from '@mui/material/Grid2';

<Grid2 container spacing={2}>
  <Grid2 size={{ xs: 12, md: 6 }}>...</Grid2>
  <Grid2 size={{ xs: 12, md: 6 }}>...</Grid2>
</Grid2>
```

## Imports — direct, never barrel

MUI imports must be direct for tree shaking:

```typescript
import Box from '@mui/material/Box';        // ✅ direct
import Button from '@mui/material/Button';  // ✅ direct
// ❌ never: import { Button } from '@mui/material';
```

## Forms — RHF + Controller

Always use `react-hook-form` for form state and validation. Integrate with MUI via the `Controller` component.

```tsx
import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';

const { control, handleSubmit } = useForm<FormValues>();

<Controller
  name="email"
  control={control}
  rules={{ required: 'Email requerido' }}
  render={({ field, fieldState }) => (
    <TextField
      {...field}
      label="Correo electrónico"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>
```

Never use ad-hoc or uncontrolled form state.

## Deprecated APIs — never use

MUI v6 replaced legacy slot props. Use the new `slots` / `slotProps` API exclusively.

| Deprecated (v5) | Replacement (v6) |
|-----------------|-----------------|
| `InputProps={{ ... }}` | `slotProps={{ input: { ... } }}` |
| `inputProps={{ ... }}` | `slotProps={{ htmlInput: { ... } }}` |
| `componentsProps={{ ... }}` | `slotProps={{ ... }}` |
| `components={{ ... }}` | `slots={{ ... }}` |
| `PaperProps`, `BackdropProps`, `PopperProps` | `slotProps={{ paper: ..., backdrop: ..., popper: ... }}` |
| `TransitionComponent` / `TransitionProps` | `slots.transition` / `slotProps.transition` |
| `primaryTypographyProps={{ ... }}` (ListItemText) | `slotProps={{ primary: { ... } }}` |
| `secondaryTypographyProps={{ ... }}` (ListItemText) | `slotProps={{ secondary: { ... } }}` |

```tsx
// ✅ v6 — TextField with end adornment
<TextField
  slotProps={{
    input: {
      endAdornment: <InputAdornment position="end">...</InputAdornment>,
    },
  }}
/>

// ❌ deprecated
<TextField InputProps={{ endAdornment: ... }} />
```

## Styling

MUI styling rules live in `frontend/CLAUDE.md` (SCSS Modules section). **Never** use `sx` prop or inline `style={{}}` objects.

---

## Brand Rules — Eventos Hersa

> These rules derive from `documentation/brand/digital-guidelines.md`. They are binding for every MUI component rendered in the Hersa frontend.

### Button hierarchy (one primary CTA per action area)

| Intent | MUI props | When |
|--------|-----------|------|
| Primary action | `variant="contained" color="primary"` | The single most important action on screen |
| Secondary action | `variant="outlined" color="primary"` | Alternative or lower-weight action |
| B2C celebratory CTA | `variant="contained" color="secondary"` | Student portal only — high emotional-weight moments |
| Destructive | `variant="outlined" color="error"` | Delete, cancel with consequences |
| Tertiary / link | `variant="text" color="primary"` | Secondary navigation |

**Rule:** Only one `contained primary` button may be visible per action area. If two actions feel equally primary, one of them is not.

### Cards

```scss
// Never use elevation. Always border + subtle hover.
// CardWrapper.module.scss
.card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: none;
  &:hover { border-color: #1E3A5F; } // primary.light
}
```

Pass `elevation={0}` to every `<Card>` component. Minimum internal padding: 16px.

### Tables (DataGrid / Table)

- Header: `background: primary.main (#0B1F3A)` with white text
- Alternating rows: `#FFFFFF` / `#F5F5F5`
- Numbers: right-aligned
- Dates: DD/MM/AAAA (Colombian format)

### Photo backgrounds — overlay required

Any `<Box>` or container with a photo background **must** apply the brand overlay before placing text:

```scss
.heroBanner {
  background-image: url('...');
  background-size: cover;
  background-position: center;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(11, 31, 58, 0.65); // marino overlay
  }
}
```

Text on photo backgrounds is always `#FFFFFF`. Never place text directly on a photo without this overlay.

### Typography — Playfair Display (B2C student portal only)

Playfair Display is permitted **only** in the student portal, in these specific screens:
- Welcome / splash screen headline
- Graduation confirmation message
- Photo gallery section header
- Package delivery confirmation

```tsx
// Only where explicitly approved — never in B2B portal, forms, nav, or alerts
<Typography
  sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: '3rem' }}
>
  ¡Tu graduación está confirmada!
</Typography>
```

Until Playfair Display is added to `hersaTheme`, use inline `fontFamily` **only** in these approved locations. Never use it elsewhere.

### Snackbar positioning

```tsx
<Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />   // mobile
<Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />    // desktop (md+)
```

Auto-hide duration: 4000ms. For critical errors, use `<Dialog>` or inline form error — never a Snackbar.

### Status chips — only semantic colors

```tsx
// ✅ Always use MUI semantic color prop
<Chip label="Entregado" color="success" />
<Chip label="Pendiente" color="warning" />
<Chip label="Vencido"   color="error" />
<Chip label="Info"      color="info" />

// ❌ Never custom badge colors outside the theme
<Chip label="Entregado" sx={{ backgroundColor: '#3B6D11' }} />
```
