---
name: ui-patterns
description: Global UI interaction and visual conventions for forms, modals, loading states, empty states, page layout, tables, feedback patterns, motion, and Hersa domain-specific UI states.
version: 1.1.0
when_to_use:
  - Implementing any form, modal, drawer, loading state, or empty state in the Hersa portal
  - Implementing page layout structure, DataGrid toolbar, row actions, or bulk selection
  - Choosing between Dialog vs Drawer, Snackbar vs inline error, or Skeleton vs spinner
  - Implementing steppers, inline alert banners, destructive confirmations, or motion/transitions
  - Rendering payment session, student authorization, QR ticket, or gown-size states
when_not_to_use:
  - Selecting brand color tokens or typography scale → use theme-tokens.md
  - Choosing MUI components, RHF wiring, button hierarchy, or chip colors → use mui-conventions.md
  - Writing axios interceptors or React Query hooks → use react-conventions.md

# LINE-COUNT NOTE (v1.1.0): This file exceeds the standard 500-line ceiling.
# Excess is intentional and approved — the Hersa Domain States section (§12) cannot be
# split or referenced elsewhere: it defines visual treatments for payment sessions,
# student authorization, QR tickets, and gown-size conflicts that have no generic MUI
# analogue and would otherwise be invented independently by each developer.
# Total: 532 lines. Review before adding new content.
---

# UI Patterns — Hersa Global Conventions

> **Language rule:** All user-facing UI text in Spanish. All code identifiers in English.

---

## 1. Forms

### 1.1 Layout — columns and max-width

| Condition | Layout | Max-width |
|-----------|--------|-----------|
| Mobile (B2C, xs–sm) | Always 1-col | 100% |
| Desktop, simple (≤5 fields, same type) | 1-col | 560px |
| Desktop, standard (6–12 fields, mixed) | 2-col | 800px |
| Desktop, complex (student registration, staff profile, package config) | 2-col + full-width overrides for long fields | 960px |
| Desktop, data-dense (>12 fields, multiple sections) | 2-col per section | 960px |
| Never use 3-col | — | — |

- Full-width overrides within 2-col: `<textarea>`, file upload, notes/comments, any field label > ~30 chars.

### 1.2 Section grouping

- Group related fields under a section header (`h6 fontWeight={600}`). Minimum 2 fields per section.
- Separate sections with 32px spacing — `<Divider sx={{ my: 3 }} />` only within a section to sub-group.
- Section order: identity/primary info → contact info → configuration/options → notes/comments.
- Maximum 4 sections before converting to a stepper (see Section 9).

### 1.3 Spacing

| Gap type | Value |
|----------|-------|
| Between fields within a section | `spacing={2}` (Stack or Grid2) |
| Between sections | 32px |
| Between last section and action row | `mt: 3` on action `Box` |
| Between action buttons | `gap: 2` |

- Default field: `fullWidth` + `size="medium"`. Restrict width only when explicitly required by layout.

### 1.4 Labels and validation

- Position: always top-label. Never floating label (placeholder-as-label) or inline label to the left.
- Required field: MUI `required` prop only — never a custom `*` character. No legend needed.
- Optional fields: no indicator unless most fields are required and the optional one would cause confusion.
- `helperText` prop only — never a separate `<Typography>` below the field.
- Never use both placeholder and helper text simultaneously. Format hint → placeholder; rule hint → helper text.

| Validation rule | When |
|-----------------|------|
| Show field-level errors | onBlur |
| Re-validate corrected field | onChange (immediate green feedback) |
| Show remaining errors | onSubmit |
| Error summary above action buttons | Only when >6 fields AND first error is scrolled out of view — render as `<Alert severity="error">` with a list of field-name anchor links that scroll to each failing field |
| Clear error | As soon as field value becomes valid |

### 1.5 Read-only and disabled fields

| State | When to use | Implementation |
|-------|-------------|----------------|
| Read-only | Data exists, cannot be changed in this context | `variant="filled"` + `slotProps={{ input: { readOnly: true } }}` |
| Disabled | Will become editable once a condition is met | `disabled` prop + helper text explaining the condition |
| Never disable | To hide information user should not see | Use conditional rendering |

### 1.6 Action buttons

```tsx
<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
  <Button variant="outlined" color="primary" onClick={onCancel}>Cancelar</Button>
  <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}
    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
  >
    {isSubmitting ? 'Guardando...' : 'Guardar'}
  </Button>
</Box>
```

| Rule | Decision |
|------|----------|
| Position | Bottom of form, flush right |
| Sticky footer | Only when button is not visible without scrolling AND form is not a stepper. 1px top border, no shadow. |
| Button order | Secondary (Cancelar) left → Primary (Guardar) right |
| "Cancelar" vs "Volver" vs "Salir" | "Cancelar" = discards unsaved changes. "Volver" = no data entered / wizard back-nav. "Salir" = inside a stepper where prior steps are already saved in the system — triggers a confirmation Dialog warning that partial progress exists. |
| Destructive confirm | Rightmost, `variant="outlined" color="error"`. Secondary always "Cancelar". |
| Prevent double submit | Disable primary immediately on first click. Re-enable only on error response. |
| Cancel while submitting | Never disable — user must always be able to escape. |

---

## 2. Modals and Drawers

### 2.1 Dialog vs Drawer

| Use Dialog when | Use Drawer when |
|-----------------|-----------------|
| Focused, bounded interaction: confirmation, short form (≤6 fields), error escalation | Contextual side panel user may reference while viewing the page behind |
| Interaction blocks progress | Detailed record view, preview, supplementary filters |
| Destructive confirmations — always Dialog, never Drawer | User may need to scroll content behind the panel |

### 2.2 Sizes

| Size | Use case | `maxWidth` prop |
|------|----------|----------------|
| `sm` | Confirmations, single-field prompts | `"sm"` (444px) |
| `md` | Standard forms (3–6 fields), record previews | `"md"` (600px) |
| `lg` | Complex forms (7–12 fields) | `"lg"` (800px) |

- Always use `fullWidth` together with `maxWidth`. On xs, all Dialogs render full-screen.

```tsx
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>
    Registrar pago
    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="cerrar">
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>{/* dividers only when content may scroll */}</DialogContent>
  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button variant="outlined" color="primary" onClick={onClose}>Cancelar</Button>
    <Button variant="contained" color="primary" onClick={onConfirm}>Confirmar</Button>
  </DialogActions>
</Dialog>
```

### 2.3 Drawer

```tsx
<Drawer anchor="right" open={open} onClose={handleClose}
  slotProps={{ paper: { sx: { width: 'min(480px, 100vw)' } } }}>
  {/* content */}
</Drawer>
```

- Close button must be sticky at the top — never scroll with content on long record views.
- **Unsaved changes guard:** When the Drawer contains a form with unsaved changes, disable backdrop click (`onClose` should check dirty state first). If user clicks backdrop or close button while dirty, show a confirmation Dialog ("¿Descartar cambios? Los cambios no guardados se perderán.") before closing. Never silently discard in-progress form data.
- Drawers without a form: backdrop click closes normally.

### 2.4 Destructive confirmation — standard pattern

- Title: `"¿Eliminar [entity name]?"`
- Body: `"Esta acción no se puede deshacer. [Concrete consequence.]"` — never generic.
- Buttons: `[Cancelar (outlined, left)]` → `[Eliminar (outlined error, right)]`
- Confirm label must name the action ("Eliminar", "Anular tickets") — never "Aceptar" or "Sí".
- Size: `sm`.

---

## 3. Loading States

### 3.1 Decision table

| Condition | Pattern |
|-----------|---------|
| Initial page data fetch | `<Skeleton>` shaped to match the real layout |
| Page-level action in progress (bulk, export) | Linear progress bar at top of content area |
| Async form submit | Spinner inside primary button (Section 1.6) |
| Dependent select loading (e.g., City after Department) | Disable child select + spinner as `endAdornment` |
| Background fire-and-forget | Snackbar ("Procesando...") — no button spinner |
| Never | Full-page centered spinner with blank background |

| Duration | Show |
|----------|------|
| < 300ms | Nothing |
| 300ms – 2s | Skeleton or button spinner |
| > 2s | Skeleton/spinner + `"Esto puede tomar unos segundos..."` |
| > 10s | Timeout message with retry action |

### 3.2 Skeleton implementation

```tsx
// Card list — shape must match structural slots of real component, not just total height
<Stack spacing={2}>
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 1 }} />
  ))}
</Stack>

// DataGrid rows — render outside grid while loading (52px = real row height)
<Stack spacing={0.5}>
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} variant="rectangular" height={52} />
  ))}
</Stack>
```

---

## 4. Empty States

| Situation | Show |
|-----------|------|
| List/table has zero records | Yes |
| Search/filter returns zero results | Yes — title must echo the active filter value: `"Sin resultados para '[search term]'"` |
| No permissions for the content | Yes — specific message, not generic empty list |
| Data is loading | No — show Skeleton |
| Error fetching data | No — show error state with retry |

```tsx
<Box sx={{ textAlign: 'center', py: 8 }}>
  <SomeOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
  <Typography variant="h6" sx={{ mt: 2 }}>No hay registros</Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
    Aún no se han creado elementos en esta sección.
  </Typography>
  <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={onCreate}>
    Crear nuevo
  </Button>
</Box>
```

| Type | Title | Subtitle | CTA |
|------|-------|----------|-----|
| Empty list | "No hay [entities] registrados" | "Comienza agregando el primer [entity]." | `variant="contained"` |
| No search results | `"Sin resultados para '[term]'"` | "Intenta con otros términos o limpia los filtros." | `variant="text"` — "Limpiar filtros" (optional) |
| No permissions | "No tienes acceso a esta sección" | "Contacta al administrador si necesitas acceso." | None |
| Feature unavailable | "Próximamente" | "Esta función estará disponible pronto." | None |

---

## 5. Page Layout

```tsx
<Box sx={{ p: { xs: 2, md: 3 } }}>
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
    <Box>
      <Breadcrumbs>
        <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">Inicio</Link>
        <Typography color="text.primary">Sección actual</Typography>
      </Breadcrumbs>
      {/* h5 is intentional for app UI (dashboard context). h1–h4 are reserved for
          marketing/landing surfaces where larger scale is appropriate. */}
      <Typography variant="h5" fontWeight={600} mt={0.5}>Título de página</Typography>
    </Box>
    <Box>{/* one primary CTA max — variant="contained" color="primary" */}</Box>
  </Stack>
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>{/* page body */}</Box>
</Box>
```

- **Photo backgrounds:** Any container with a photo background MUST apply the brand overlay before placing text — see `mui-conventions.md §Photo backgrounds`. Text directly on a photo without the overlay violates the brand manual.

| Context | Max-width | Padding |
|---------|-----------|---------|
| B2B desktop portal | 1200px | 24px (md), 32px (lg+) |
| B2C student portal | 600px centered | 16px (xs–sm), 24px (md+) |
| Data table pages | 100% content area — no cap | 24px |

| Gap | Value |
|-----|-------|
| Page header → first content section | 24px |
| Between content sections | 32px |
| Section header → first content item | 12px |
| Between cards in a card grid | 16px |
| Table toolbar → table | 0px (flush) |

- Breadcrumbs: show only when user can navigate up more than one level.
- Page title: noun phrase naming the entity or section — never a verb phrase.

---

## 6. Feedback and Confirmations

### 6.1 Snackbar defaults

- Duration: **4000ms** for all success confirmations. **6000ms** when an "Deshacer" action is included (soft delete).
- Position: `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}` on mobile (xs–sm). `anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}` on desktop (md+).
- Persistent (no auto-hide): network offline only.

### 6.2 Success

| Action type | Pattern |
|-------------|---------|
| Record created/updated | Snackbar ("Guardado correctamente") + navigate away or close modal |
| Record deleted (optimistic) | Remove from list immediately. Snackbar with "Deshacer" for 6000ms. **If DELETE API call fails:** re-insert item at its original list position, replace Snackbar with error Snackbar ("No se pudo eliminar. Intenta de nuevo."), remove undo action. |
| High-stakes event (payment session closed, graduation confirmed) | Inline confirmation within page. Replace action button with status indicator. |
| Multi-step wizard completed | Dedicated success screen (last step) |

### 6.3 Errors

| Error type | Pattern |
|------------|---------|
| Field-level validation | Inline below field (`helperText` with error) — never Snackbar |
| Form-level business rule violation | Inline `<Alert severity="error">` block above action buttons |
| API error on form submit (400 conflict) | Inline `<Alert severity="error">` above action buttons — parse API message, display in Spanish |
| API error unrelated to form (500, page load) | Error state replaces content with retry button |
| Network offline | Persistent Snackbar (no auto-hide, bottom-center) with retry action |
| Critical error requiring user decision | Dialog — never Snackbar |
| Auth expired / unauthorized | Redirect to login — no Snackbar |

- Destructive confirmations: always a Dialog. See Section 2.4.

---

## 7. Tables / DataGrid

### 7.1 Toolbar structure

`[Search — left]` `[Filter button — left, after search]` `[Spacer]` `[Export icon]` `[Primary action — rightmost]`

- Search: always present when list can have >10 rows. Placeholder: `"Buscar [entity]..."`.
- Filter button: only when there are filterable columns beyond search. Badge shows active filter count.
- Primary action: same as page header CTA — never show in both toolbar and header simultaneously.

### 7.2 DataGrid implementation

```tsx
<DataGrid
  rows={rows} columns={columns}
  density="standard" rowHeight={52}
  pageSizeOptions={[10, 25, 50]}
  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
  slots={{ toolbar: GridToolbar }}
  slotProps={{ toolbar: { showQuickFilter: true } }}
  disableRowSelectionOnClick
/>
```

- Date column: `type: 'date'` + `valueFormatter` using `toLocaleDateString('es-CO', ...)` → DD/MM/AAAA.
- Apply header/row colors via `MuiDataGrid.styleOverrides` in theme (`primary.main` header, `#FFF`/`#F5F5F5` alternating rows) — not per-instance `sx`.

### 7.3 Row actions

| Condition | Pattern |
|-----------|---------|
| 1–2 actions per row | Inline icon buttons, right-aligned, tooltip only |
| 3+ actions per row | Kebab menu (3-dot icon). Menu items have labels. |
| Primary row action ("Ver detalle") | Entire row is clickable. `cursor: pointer`. |
| Destructive row action | Always in kebab menu, never as inline icon. Error color in menu. |

- **Kebab menu item ordering:** neutral/safe actions first → edit/modify actions in the middle → `<Divider />` → destructive action last. Never place a destructive action above the Divider or at the top of the menu.
- If row is clickable, action buttons must `stopPropagation`. Never combine a clickable row with an inline "Ver" button.

### 7.4 Bulk selection and pagination

- Checkbox in header: selects current page only.
- When selection active: toolbar shows "N seleccionados" chip; bulk action buttons replace search/filter.
- Bulk buttons: `variant="outlined"`. Destructive bulk: `variant="outlined" color="error"`.
- Destructive bulk always triggers confirmation Dialog. Body must state count: "Se eliminarán 3 registros."
- Server-side pagination for lists that can exceed 100 rows. Default page size: 10.
- On mobile (B2C): replace DataGrid with infinite scroll or card list.

### 7.5 Empty state within table

- Rendered inside the DataGrid body — not outside. Minimum height: 200px.
- CTA inside uses `variant="text"` — `variant="contained"` stays in the toolbar.

---

## 8. B2B vs B2C Structural Differences

| Dimension | B2B — Coordinator (desktop) | B2C — Student (mobile) |
|-----------|----------------------------|------------------------|
| Primary device | Desktop (md+) | Mobile (xs–sm) |
| Navigation | Persistent left sidebar | Bottom tab bar or hamburger drawer |
| Form layout | 2-col where applicable | Always 1-col |
| Action buttons | Bottom-right, not sticky unless long form | Sticky bottom footer always |
| Modals | Standard Dialog | Full-screen Dialog on xs |
| Tables | DataGrid with toolbar | Card list — DataGrid not used |
| Touch targets | Standard | Minimum 48px height for all interactive elements |
| Celebratory moments | Not applicable | Graduation confirmation, package delivery — use Playfair Display headline. See `theme-tokens.md §Typography`. |

---

## 9. Form Steppers (Multi-step Flows)

- Use when: form has >4 logical sections, OR step N depends on step N-1, OR mobile form has >8 fields.
- Step indicator: horizontal stepper (desktop) / `"Paso 2 de 4"` text counter (mobile).
- Navigation: `"Anterior"` (outlined, left) → `"Siguiente"` (contained, right). `"Cancelar"` / `"Salir"` as text link, leftmost.
- **"Salir" vs "Cancelar" in steppers:** Use `"Salir"` (not "Cancelar") when prior steps are already persisted in the system (e.g., package config wizard where step 1 saved a PaquetePromocion). `"Salir"` triggers a confirmation Dialog: `"¿Salir del flujo? El progreso del paso [N] en adelante se perderá. Los pasos anteriores ya están guardados."` Never use `"Cancelar"` when partial persistence exists — it misleads the user about what data is at risk.
- Last step: `"Siguiente"` becomes `"Guardar"` or the action-specific label.
- Validate current step on `"Siguiente"` click. Allow free backward navigation without re-validating.
- Data NOT persisted mid-flow unless feature spec explicitly requires it.
- **Review step** (high-stakes flows — payment, package delivery, event creation): add a final read-only step. Shows all data grouped by section with an "Editar" link per section. `"Guardar"` appears only here.

---

## 10. Inline Alert Banners

> For persistent in-page conditions — not transient (Snackbar), not blocking (Dialog).

| Use when | Do not use when |
|----------|-----------------|
| Persistent condition affects the page entity (e.g., "Promoción sin fecha de grado") | Message is transient → Snackbar |
| Warning user should read before acting (e.g., "Saldo pendiente de $X") | Message requires a decision → Dialog |
| System notice not yet dismissed (e.g., "3 colaboradores sin asignación") | |

```tsx
<Alert severity="warning" action={<Button size="small">Asignar</Button>}>
  <AlertTitle>Saldo pendiente</AlertTitle>
  Este estudiante tiene un saldo pendiente de $150.000.
</Alert>
```

- Severity: `info | warning | error | success` only.
- Dismissible: only for non-critical info. Warnings and errors are never dismissible.
- Position: top of content area, below page header, above first content section.
- Maximum 1 banner per page. If multiple: show highest severity + `"+ 2 avisos más"` badge.

---

## 11. Motion and Transitions

> Apply to all animated MUI components (Dialog, Drawer, Snackbar, Skeleton, page transitions).

| Tier | Duration | Easing | Use for |
|------|----------|--------|---------|
| Micro-interaction | 150ms | `ease-out` | Hover states, button press feedback, chip appearance |
| State transition | 250ms | `ease-in-out` | Dialog open/close, Drawer slide, Snackbar enter/exit |
| Page navigation | 300ms | `ease-in-out` | Route transitions, full-panel swaps |

```tsx
// Override Dialog transition duration in theme
MuiDialog: {
  defaultProps: {
    TransitionProps: { timeout: 250 },
  },
},
// Override Drawer transition in theme
MuiDrawer: {
  styleOverrides: {
    paper: { transition: 'transform 250ms ease-in-out !important' },
  },
},
```

- **`prefers-reduced-motion`:** All transitions must respect the accessibility setting. MUI respects it via the theme automatically if `transitions.create` is used — never hardcode transition strings in `sx` props that bypass this.

---

## 12. Hersa Domain-Specific UI States

> These states have no generic MUI analogue — use the patterns below without deviation. Without explicit guidance here, every developer invents their own visual treatment.

### 12.1 Payment Session (Sesión de Cobro)

| State | Visual treatment | MUI |
|-------|-----------------|-----|
| Open (activa) | `<Chip label="Sesión abierta" color="success" icon={<FiberManualRecordIcon />} />` | Green chip — cashier is actively collecting |
| Closed (cerrada) | `<Chip label="Sesión cerrada" color="default" />` | Grey chip — session closed, report generated |

- The session-open chip must be prominent in the coordinator's view — render in the page header row, not inline in a table.
- Never allow any payment action when session state is "cerrada" — disable the register-payment button with helper text: `"La sesión de cobro está cerrada."`.

### 12.2 Student Authorization State

| State | Condition | Visual treatment |
|-------|-----------|-----------------|
| Autorizado | Paid ≥50% (or justified exception accepted) | `<Chip label="Autorizado" color="success" size="small" />` |
| Saldo pendiente | Paid <100% but ≥50% | `<Chip label="Saldo $X" color="warning" size="small" />` — show exact balance amount |
| Pago insuficiente | Paid <50% without accepted justification | `<Chip label="Pago insuficiente" color="error" size="small" />` |
| Pago completo | Balance = 0 | `<Chip label="Pagado" color="success" variant="outlined" size="small" />` — distinct from "Autorizado" |
| Excepción | Paid <50% with justification recorded | `<Chip label="Excepción" color="warning" variant="outlined" size="small" />` + tooltip showing justification text |

- "Autorizado" unlocks photo shoot access. "Pago completo" (saldo=0) unlocks package delivery. Never conflate the two — a student can be "Autorizado" but still have balance due.

### 12.3 QR Ticket (Ticket de Invitación) State

| State | Condition | Visual treatment |
|-------|-----------|-----------------|
| Válido | Not yet scanned | `<Chip label="Válido" color="success" size="small" />` |
| Usado | Scanned and invalidated at ceremony entry | `<Chip label="Usado" color="default" size="small" />` — grey, non-interactive |
| Cancelado | Student did not graduate — bulk cancellation | `<Chip label="Cancelado" color="error" size="small" />` |

- Cancelled state must be shown with an inline `<Alert severity="error">` banner on the student's record: `"Todos los tickets QR han sido cancelados por no graduación."`.
- Never show a "resend" or "regenerate" action for a cancelled ticket.

### 12.4 Gown Size Conflict (Conflicto de Toga)

| State | Condition | Visual treatment |
|-------|-----------|-----------------|
| Talla confirmada | Physical gown matches photo-shoot assignment | `<Chip label="Talla confirmada" color="success" size="small" />` |
| Conflicto de talla | Physical gown does not match assigned size | `<Chip label="Conflicto de talla" color="error" size="small" />` + inline `<Alert severity="error">`: `"La talla física no coincide con la asignada en toma fotográfica ([talla]). Se requiere autorización del coordinador."` |

- Gown size conflict is a **blocking state** — the coordinator cannot proceed to package delivery until the conflict is resolved or overridden with explicit authorization.
- Render the conflict alert at the top of the student's graduation-day record, above all other actions.

---

## Outputs

- No file artifacts produced. Read-only reference loaded by `react-developer` and `ui-designer`.

---

## Failure Modes

| Condition | Recovery |
|-----------|----------|
| Pattern not found in this file | Check `mui-conventions.md` (component choices) or `theme-tokens.md` (colors/typography) |
| B2B vs B2C rule conflict | B2C always takes mobile-first precedence; flag in code review |
| Domain state not listed in §12 | Consult `hersa-process.md` for business rules, then define the state visually using the closest analogous pattern in §12 and document the decision in a PR comment |

---

## Trigger Tests

**Should invoke:**
- "How do I implement the skeleton loading state for the promotions list page?"
- "What is the correct pattern for a destructive confirmation dialog?"
- "Implement the toolbar and pagination for the students DataGrid."
- "Where should the submit button go on this form, and how do I handle the loading state?"
- "When should I use a Drawer instead of a Dialog for this side panel?"
- "How do I render the student's payment status on the graduation day screen?"
- "What happens visually when a QR ticket is cancelled?"

**Should NOT invoke:**
- "What color token should I use for the primary button?" → `theme-tokens.md`
- "How do I wire up a React Hook Form Controller?" → `mui-conventions.md`
- "How should I handle API errors from the axios interceptor?" → `react-conventions.md`
