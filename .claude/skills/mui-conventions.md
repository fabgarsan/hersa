# MUI Conventions — Hersa

> **Agents:** react-developer, tdd-writer
> **Load when:** Building UI with MUI — choosing components, layouts, or form primitives
> **Summary:** Preferred MUI components per use case, Grid2 migration notes, form integration patterns

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
