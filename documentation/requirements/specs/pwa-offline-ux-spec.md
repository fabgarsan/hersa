# UX Specification — PWA Offline Feedback System
**Version:** 1.0
**Date:** 2026-04-27
**Author:** ux-designer
**Surface:** Portal institucional B2B (internal operational tool)
**Status:** Ready for UI Designer

---

## Scope

This specification covers two components of the Hersa internal operational PWA used by coordinators, photographers, and field staff during graduation ceremonies:

1. **ConnectivityIndicator** — Persistent visual indicator of the current network state
2. **OfflineMutationFeedback** — Feedback shown when a user attempts to save a change without network connectivity

These components are consumed by the **UI Designer** (for visual spec) and **react-developer** (for adjusted implementation). They do not cover student-facing surfaces; Playfair Display must not appear anywhere in this spec.

---

## UX Observations for Systems Analyst

*(No systems-analyst spec exists for this feature — these components emerge from an operational need discovered post-implementation. The following observations are addressed to the engineering team.)*

1. **Mutations do not queue offline.** The current architecture lets mutations fail silently with no recovery path. This is the root cause of the UX problem. A future improvement worth evaluating: an offline mutation queue with automatic retry on reconnection. This spec does not depend on that improvement — it works within the current fail-immediately constraint — but this constraint must be surfaced so future engineering decisions are made with awareness of the UX cost.

2. **No distinction between stale cache and true offline.** The PWA uses NetworkFirst caching. A user may be seeing data that is minutes or hours old even when the banner says "online." This spec does not solve cache staleness (that is a separate concern), but the copy chosen avoids implying the data is always fresh.

3. **The copy "mostrando datos en caché" may confuse non-technical staff.** Field staff (ceremony coordinators, cashiers at events) are the primary users during ceremonies. The word "caché" is technical. This spec replaces it with plain language. See copy decisions in Section 5.

---

## Component 1 — ConnectivityIndicator

---

### 1. Users Involved in This Flow

| User | Device | Context | Goal |
|---|---|---|---|
| Graduation coordinator (Coordinador de Grado) | Mobile (primary) or desktop | Ceremony hall; unstable 4G | Know they are offline before attempting any action |
| Cashier (Cajero) | Mobile or desktop tablet | Ceremony hall entrance | Know they are offline before recording a payment |
| Photographer | Mobile | Photo shoot venue | Know they are offline before uploading or reviewing data |
| Logistics lead (Jefe de Logística) | Desktop | Office or venue | Know they are offline before making staff assignments |

**Critical context:** These users are working under time pressure during live ceremonies. They cannot stop to troubleshoot. The indicator must communicate status without requiring any cognitive effort.

---

### 2. User Journey — ConnectivityIndicator

1. User opens the app (connected) — no indicator visible; this is the baseline state
2. User loses connectivity (walks into a building with no signal, or tower congestion during ceremony)
3. User continues navigating — reading lists, reviewing student data (served from cache)
4. **Indicator appears** — user immediately understands they are offline and data may not be current
5. User decides whether to attempt any action or wait for signal
6. User regains connectivity
7. **Indicator transitions** — confirms reconnection, then disappears
8. User resumes normal operations

---

### 3. Required Screens

The ConnectivityIndicator is not a screen — it is a persistent overlay component that attaches to the app layout. It appears on every screen of the application without exception.

**Screens where it must appear:**
- Dashboard / home
- Promotion list and detail
- Student payment view
- Staff assignment view
- Event detail
- Any modal or drawer that is open when connectivity is lost

---

### 4. Information Hierarchy

When the indicator is visible (offline state), the user must process information in this order:

1. **State** — "I am offline right now" (immediate, pre-attentive — color + icon)
2. **Implication** — "My data may not be up to date" (one line of body text)
3. **Action guidance** — "Do not try to save changes" (implicit in the indicator; explicit in OfflineMutationFeedback when they try anyway)

When the indicator transitions to reconnected:

1. **State** — "I am back online" (color + icon change)
2. **Implicit guidance** — "You can now save changes" (no explicit text needed; the absence of the offline indicator is sufficient)

---

### 5. Anticipated Friction Points

**[FRICCIÓN ALTA] — The indicator is invisible when the user is looking at content below the fold**

The current design uses a top fixed banner. On mobile, once the user scrolls down a long student list, the banner scrolls out of reach of peripheral vision. If the user scrolls far enough and then reaches for a save button, they may not realize the banner is there.

**Resolution:** The indicator must be `position: fixed` AND placed immediately below the AppHeader (not above it, not replacing it). This ensures it is always in the same physical location on screen regardless of scroll position. The AppHeader itself (z-index ~1100) must remain above the indicator. The indicator takes z-index ~1090, sitting between the AppHeader and the main content.

**Why not replace the AppHeader?** The AppHeader contains navigation and the hamburger menu on mobile. Replacing or shifting it would break navigation access during the very moment the user is most stressed.

**[FRICCIÓN ALTA] — "Sin conexión" banner appearing on first load before the connectivity check resolves**

If the app initializes and the connectivity check has not yet resolved, a brief false-positive "offline" state may flash before the true state is known. On a slow connection, `window.navigator.onLine` can return `true` even when the network is effectively unavailable. Conversely, the `offline` event may fire before the UI is ready.

**Resolution:** The indicator must not appear during app initialization (first 800ms) unless the `offline` event has explicitly fired. On initialization, default to no indicator. Do not show the "online" confirmation banner on first load.

**[FRICCIÓN MEDIA] — The green reconnection banner disappears too fast**

3 seconds (current implementation) is borderline. A user whose attention is on a student's payment record may miss a 3-second banner.

**Resolution:** Keep the reconnection confirmation visible for 4000ms (aligns with MUI Snackbar default duration per digital-guidelines.md). This is consistent with the system-wide notification timing.

**[FRICCIÓN MEDIA] — The indicator competes visually with the AppHeader on mobile**

On mobile, the AppHeader is already the dominant visual anchor. A full-width banner immediately below it creates two full-width horizontal bars at the top of the screen, which feels heavy.

**Resolution:** On mobile (`xs` breakpoint), the offline indicator is full-width but reduced in height — a slim bar (32px height) with icon + short text only. On desktop (`md` and up), it may include slightly more detail. See wireframes below.

---

### 6. Screen States

| State | Trigger | Visual | Duration |
|---|---|---|---|
| **Connected (baseline)** | App loads; `online` event fires after offline period | No indicator visible | Persistent until changed |
| **Offline** | `offline` event fires | Slim fixed bar below AppHeader; error color treatment; WiFi-off icon + copy | Persistent until `online` event fires |
| **Reconnected (transitional)** | `online` event fires | Bar changes to success color treatment; WiFi icon + copy; then fades out | 4000ms, then hides |
| **Initializing** | App first load, before connectivity confirmed | No indicator | Until first `offline` event or 800ms, whichever comes first |

---

### 7. Alternative Flows

**User opens app while already offline:**
- App loads from cache
- `offline` event has already fired (or `navigator.onLine === false`)
- Indicator appears without the reconnection transition — starts directly in offline state
- No "Reconnected" banner shown when user subsequently reconnects (the banner should still appear — this is the normal reconnection flow)

**User loses connectivity during a form interaction:**
- Indicator appears
- Form remains editable (inputs are not disabled)
- If user submits the form, OfflineMutationFeedback component handles the error (see Component 2)
- Indicator remains visible throughout

**User is in a modal or Dialog when going offline:**
- Indicator appears behind the modal in z-index stacking
- The indicator is still visible at the top of the screen above the modal's backdrop
- This is by design: the modal backdrop does not cover the fixed indicator bar

**Network oscillates rapidly (signal in and out every few seconds):**
- Each `offline` event shows the bar
- Each `online` event triggers the 4000ms reconnected state, then hides
- If `offline` fires again during the 4000ms window, the bar immediately returns to offline state
- This oscillation behavior may confuse users, but it accurately reflects their connectivity reality — the correct UX response is to show the true state, not to debounce it aggressively

---

### 8. Text Wireframes

#### 8.1 — Offline State (Mobile — xs breakpoint)

```
+----------------------------------------------------------+
| [AppHeader — fixed, z-index 1100, full width]            |
| Logo   [Title / Page Name]              [Hamburger menu] |
+----------------------------------------------------------+
| [ConnectivityIndicator — fixed, z-index 1090, full width]|
| [wifi-off icon 16px]  Sin señal                          |
| height: 32px | background: error color | text: white     |
+----------------------------------------------------------+
| [Main content — scrollable]                              |
| ...                                                      |
```

**Copy (offline, mobile):** `[wifi-off icon]  Sin señal`

No additional text on mobile — brevity is critical on a 32px bar. The icon carries the semantic weight.

#### 8.2 — Offline State (Desktop — md+ breakpoint)

```
+----------------------------------------------------------+
| [AppHeader — fixed, z-index 1100, full width]            |
| [Logo]  [Nav items]                    [User avatar]     |
+----------------------------------------------------------+
| [ConnectivityIndicator — fixed, z-index 1090, full width]|
| [wifi-off icon 16px]  Sin conexion — los datos pueden    |
|                       no estar actualizados              |
| height: 40px | background: error color | text: white     |
+----------------------------------------------------------+
|        |                                                 |
| Sidebar| [Main content — scrollable]                    |
|        |                                                 |
```

**Copy (offline, desktop):** `[wifi-off icon]  Sin conexion — los datos pueden no estar actualizados`

Note: The Sidebar and main content area shift down by the height of the ConnectivityIndicator when the bar is visible, to prevent the bar from overlapping content. This is achieved via a CSS variable or a layout padding-top applied to the content wrapper when the indicator is active.

#### 8.3 — Reconnected State (All breakpoints — 4000ms, then hidden)

```
+----------------------------------------------------------+
| [AppHeader — fixed, z-index 1100, full width]            |
+----------------------------------------------------------+
| [ConnectivityIndicator — fixed, z-index 1090, full width]|
| [wifi icon 16px]  Conexion restaurada                    |
| background: success color | text: white                  |
+----------------------------------------------------------+
| [Main content]                                           |
```

**Copy (reconnected):** `[wifi icon]  Conexion restaurada`

After 4000ms: the bar fades out (250ms fade, `ease-in-out`). The layout padding-top on content returns to zero simultaneously to avoid a visible content jump. The AppHeader does not move.

#### 8.4 — Connected Baseline (No indicator)

```
+----------------------------------------------------------+
| [AppHeader — fixed, z-index 1100, full width]            |
+----------------------------------------------------------+
| [Main content — full height, no extra padding-top]       |
```

No indicator is rendered. The component is in the DOM but not visible (display:none or height:0 — not `visibility:hidden`, to avoid layout reservation).

---

### 9. Validation Questions

1. Do field staff (coordinators, cashiers) look at the top of the screen during a ceremony, or do their eyes stay on the content below?
2. Is a 32px bar on mobile noticeable enough without being disruptive? Would a pulsing icon in the AppHeader itself be more visible?
3. Are there moments during ceremonies when the team loses signal for only 10–15 seconds (signal oscillation)? If so, would rapidly appearing and disappearing bars cause more confusion than they solve?
4. Does the phrase "los datos pueden no estar actualizados" cause anxiety, or does it help? Would staff prefer to not know about staleness and just know they're offline?
5. Should the indicator include a timestamp of when connectivity was lost? ("Sin conexion desde las 10:32 a.m.") This could help coordinators explain delays to colleagues.

---

## Component 2 — OfflineMutationFeedback

---

### 1. Users Involved in This Flow

| User | Device | Context | Goal |
|---|---|---|---|
| Cashier (Cajero) | Mobile or desktop | Recording student payment at ceremony | Understand why payment did not save; know what to do next |
| Graduation coordinator | Mobile | Marking task complete or changing event status | Understand why action failed; know what to do next |
| Photographer | Mobile | Updating shoot status or student record | Understand why update failed; know what to do next |

---

### 2. User Journey — OfflineMutationFeedback

**Scenario A — User does not notice the offline indicator:**
1. User is offline (ConnectivityIndicator is visible)
2. User attempts an action: taps "Guardar pago", "Confirmar entrega", or "Cerrar sesion de cobro"
3. The mutation fires; the backend request fails immediately (no network)
4. React Query or the mutation handler catches the error
5. **OfflineMutationFeedback appears** — user now understands what happened and why
6. User waits for signal or notes the information to enter manually when connected
7. User regains signal; ConnectivityIndicator shows "Conexion restaurada"
8. User retries the action manually

**Scenario B — User notices the offline indicator before acting:**
1. User sees the ConnectivityIndicator bar
2. User decides not to attempt any save action
3. OfflineMutationFeedback is never triggered
4. This is the ideal flow — the indicator prevents the frustration

---

### 3. Required Screens / Entry Points

OfflineMutationFeedback must be triggerable from every screen where a mutation (POST, PATCH, DELETE) can be initiated:

- Payment recording form (Cajero)
- Task / checklist completion (Coordinador de Grado)
- Event status change (Coordinador, Jefe de Logistica)
- Staff assignment confirmation
- Package delivery confirmation
- Any other form with a save or submit action

The component itself is shared and reusable — it is not duplicated per screen.

---

### 4. Information Hierarchy

When OfflineMutationFeedback appears, the user must receive, in order:

1. **What happened** — The action did not complete (first line, prominent)
2. **Why it happened** — No network connection (second line, explanatory)
3. **What to do** — Wait for signal and try again (third element, actionable)

This hierarchy applies to all mutation types. The severity of the operation changes the **delivery mechanism** (see friction points below), not the information structure.

---

### 5. Anticipated Friction Points

**[FRICCIÓN ALTA] — Silent failure on critical operations (closing a payment session, delivering a package)**

For operations that are operationally irreversible or that coordinators depend on for ceremony flow (closing the payment session, confirming package delivery), a silent failure is dangerous. The cashier may believe they recorded a payment when they did not. This has direct business consequences: a student is incorrectly considered paid and receives their package, then the discrepancy is discovered after the ceremony.

**Resolution:** For critical mutations, use a MUI `Dialog` (modal), not a Snackbar. The Dialog requires explicit user acknowledgment (they must tap "Entendido"). This forces conscious awareness of the failure. A Snackbar at the bottom of the screen can be missed; a Dialog cannot.

**Critical mutations (Dialog):**
- Closing a payment session (`SesionCobro` close)
- Recording a student payment
- Confirming package delivery
- Confirming QR ticket scan (ceremony entrance)

**Non-critical mutations (Snackbar):**
- Marking a checklist task complete
- Updating a non-binding event note
- Any read-preference or display setting change

**[FRICCIÓN ALTA] — User retries immediately while still offline**

After seeing the feedback message, some users — especially under ceremony pressure — will immediately tap "Guardar" again without waiting for signal. This creates a loop of repeated failures and repeated error messages.

**Resolution:** After OfflineMutationFeedback appears, the triggering action button (submit/save) must be disabled until either (a) connectivity is restored (`online` event fires) or (b) the user explicitly dismisses the feedback and 3 seconds have passed. This prevents the retry loop. The button disabled state must have a visible reason: a tooltip or label change — not just greyed out.

**[FRICCIÓN MEDIA] — The feedback disappears before the user reads it (Snackbar case)**

For non-critical operations using a Snackbar, the 4000ms default (digital-guidelines.md) may be too short for a user who is simultaneously managing a line of students.

**Resolution:** For offline error Snackbars specifically, use 6000ms instead of the standard 4000ms. This is a justified exception to the default because the user needs time to read the reason ("sin conexion") not just acknowledge a status. Add a manual close (X) button to the Snackbar so the user can dismiss it intentionally.

**[FRICCIÓN MEDIA] — Generic error message does not differentiate offline from other errors**

If the app already shows error feedback for server errors (500s, validation errors), a new offline error must be visually and textually distinct. Otherwise, the user thinks the server rejected their data, not that they have no connection.

**Resolution:** OfflineMutationFeedback uses distinct copy that explicitly names the network as the cause. It must not share copy with validation errors or server errors.

---

### 6. Screen States

#### Non-critical mutation (Snackbar)

| State | Trigger | Component | Duration |
|---|---|---|---|
| **Idle** | No failed mutation | Nothing shown | Persistent |
| **Error — offline** | Mutation fails + `navigator.onLine === false` | Snackbar appears bottom-center (mobile) or bottom-right (desktop) | 6000ms or until manual close |
| **Dismissed** | User taps X or 6000ms elapses | Snackbar disappears | — |
| **Retry available** | `online` event fires after dismissal | ConnectivityIndicator handles this; save button re-enables | — |

#### Critical mutation (Dialog)

| State | Trigger | Component | Duration |
|---|---|---|---|
| **Idle** | No failed mutation | Nothing shown | — |
| **Error — offline** | Critical mutation fails + `navigator.onLine === false` | Modal Dialog appears, overlays content, requires acknowledgment | Until user taps "Entendido" |
| **Acknowledged** | User taps "Entendido" | Dialog closes; save button disabled for 3 seconds; then re-enabled when online | — |
| **Button disabled** | After Dialog dismissal | Save/submit button shows disabled state with reason label | Until `online` event |

---

### 7. Alternative Flows

**Mutation fails for a non-connectivity reason (server error, validation error) while user is online:**
- OfflineMutationFeedback must NOT appear
- Existing error handling (validation inline, server error banner, etc.) handles this
- The condition for showing OfflineMutationFeedback is: mutation fails AND `navigator.onLine === false` at the time of failure
- If `navigator.onLine` is true but the request timed out, treat it as a connectivity issue and show OfflineMutationFeedback with the same copy (the user's effective experience is the same — they cannot save)

**User dismisses the Dialog and reconnects before retrying:**
- The save button re-enables when the `online` event fires
- No additional feedback needed — ConnectivityIndicator handles the reconnection announcement
- The user retries normally; if the retry succeeds, normal success feedback appears

**Multiple mutations fail in sequence (user taps save multiple times rapidly before the button disables):**
- Only one Dialog (for critical) or one Snackbar (for non-critical) should be shown at a time
- Subsequent failures while the feedback is already visible should not stack additional dialogs or snackbars
- The existing feedback remains until dismissed or elapsed

**User is in the middle of filling a long form when connectivity drops:**
- Form data is not lost (it lives in React state / react-hook-form)
- ConnectivityIndicator appears
- User finishes filling the form and taps submit
- OfflineMutationFeedback appears for the failed submit
- Form data remains intact so the user can retry when online

---

### 8. Text Wireframes

#### 8.1 — Non-critical Mutation: Snackbar (Mobile — bottom-center)

```
+----------------------------------------------------------+
| [AppHeader]                                              |
| [ConnectivityIndicator — offline bar if applicable]      |
| [Main content]                                           |
|                                                          |
|                                                          |
| +----------------------------------------------+ [X]   |
| | [wifi-off icon]  No se pudo guardar           |       |
| | Sin conexion. Vuelve a intentarlo cuando      |       |
| | recuperes la senal.                           |       |
| +----------------------------------------------+       |
+----------------------------------------------------------+

Position: bottom-center (mobile)
Duration: 6000ms or until [X] is tapped
Background: error color treatment (NOT #A32D2D raw — use theme error token)
Text color: white
Typography: body2 (Inter, 14px) — never Playfair Display
```

**Copy:**
- Line 1 (prominent): `No se pudo guardar`
- Line 2 (explanatory): `Sin conexion. Vuelve a intentarlo cuando recuperes la senal.`

#### 8.2 — Non-critical Mutation: Snackbar (Desktop — bottom-right)

```
+----------------------------------------------------------+
| [AppHeader]                                              |
| [ConnectivityIndicator — offline bar if applicable]      |
|         |                                                |
| Sidebar | [Main content]                                |
|         |                                               |
|         |     +-----------------------------------+[X] |
|         |     | [wifi-off icon]  No se pudo       |   |
|         |     | guardar                           |   |
|         |     | Sin conexion. Vuelve a intentarlo |   |
|         |     | cuando recuperes la senal.        |   |
|         |     +-----------------------------------+   |
+----------------------------------------------------------+

Position: bottom-right (desktop), respects sidebar width
Duration: 6000ms or until [X] is tapped
```

Copy identical to mobile. The layout adjusts; the message does not change.

#### 8.3 — Critical Mutation: Dialog

```
+----------------------------------------------------------+
| [AppHeader — still visible above overlay]                |
| [ConnectivityIndicator — still visible above overlay]    |
|                                                          |
|   [Modal overlay — dark backdrop]                        |
|   +------------------------------------------+          |
|   |                                          |          |
|   |  [wifi-off icon — 24px, centered]        |          |
|   |                                          |          |
|   |  El cambio no se guardo                  |          |
|   |  [h3 — Inter 500 20px]                   |          |
|   |                                          |          |
|   |  No hay conexion en este momento.        |          |
|   |  Los datos no fueron enviados.           |          |
|   |  Cuando recuperes la senal, intenta      |          |
|   |  guardar de nuevo.                       |          |
|   |  [body1 — Inter 400 16px]                |          |
|   |                                          |          |
|   |  [     Entendido     ]  <- contained btn |          |
|   |                                          |          |
|   +------------------------------------------+          |
+----------------------------------------------------------+

Width: 360px max on desktop; full-width minus 32px margin on mobile
Button: MUI contained primary, full width within dialog padding
No secondary action — there is nothing else the user can do right now
No close X in the Dialog corner — user must acknowledge via button
```

**Copy:**
- Title: `El cambio no se guardo`
- Body: `No hay conexion en este momento. Los datos no fueron enviados. Cuando recuperes la senal, intenta guardar de nuevo.`
- Button: `Entendido`

#### 8.4 — Submit Button Disabled State (After Dialog Dismissal, While Still Offline)

```
[  Guardar pago  ]       <- normal state (enabled)
[ Sin conexion  ]        <- disabled state (button label changes)
```

The submit button label changes to `Sin conexion` while disabled. This eliminates the need for a tooltip (which does not work reliably on touch devices). When the `online` event fires, the label returns to its original text and the button re-enables.

Alternative for buttons where label-change is not appropriate (icon-only buttons, FABs):
- Show a small badge or status dot on the button indicating disabled reason
- The UI Designer will determine the exact treatment; the UX requirement is that the disabled reason must be visible without hover

---

### 9. Validation Questions

1. Do cashiers ever hand their phone/tablet to a student to verify data during payment? If so, the Dialog must not expose any editable state when handed over.
2. Is "El cambio no se guardo" clear to non-technical staff, or would "No se pudo registrar" be more natural for payment contexts?
3. Should the Dialog for payment failures include the amount the user was trying to save? ("No se pudo registrar el pago de $180.000") This would help recovery — the cashier would know exactly what to re-enter.
4. Are there operations that staff currently write on paper when the system is unavailable? If so, the copy should reference that fallback: "Anota el dato en papel y registralo cuando tengas senal."
5. Is 6000ms still too short for the Snackbar given that coordinators are often talking to people while operating the app?

---

## Cross-Component Interaction

### When both components are active simultaneously

This is the expected state for any failed mutation: the user is offline (ConnectivityIndicator is showing the offline bar) AND they have just attempted a save (OfflineMutationFeedback appears).

**Z-index layering (from bottom to top):**
```
Main content (scroll layer)                    z-index: auto
Sidebar                                        z-index: 1000
ConnectivityIndicator (fixed bar)              z-index: 1090
AppHeader (fixed)                              z-index: 1100
OfflineMutationFeedback Snackbar               z-index: 1400 (MUI Snackbar default)
OfflineMutationFeedback Dialog backdrop        z-index: 1300 (MUI Dialog default)
OfflineMutationFeedback Dialog paper           z-index: 1300+
```

Both the ConnectivityIndicator AND the OfflineMutationFeedback will be visible simultaneously in most failure scenarios. This is intentional and correct. The ConnectivityIndicator explains the context (offline); the OfflineMutationFeedback explains the consequence (this specific save failed). They do not conflict or duplicate information because they address different information needs.

### Redundancy is intentional — not a design flaw

A user who saw the ConnectivityIndicator and did not act on it, then attempted a save, is receiving a second signal. This redundancy is the system catching them. The two components work in layers:
- Layer 1 (ConnectivityIndicator): passive, always visible, prevents the attempt
- Layer 2 (OfflineMutationFeedback): active, triggered by failure, ensures recovery

---

## Component Naming for react-developer

| UX Name | Suggested React Component Name | Location |
|---|---|---|
| ConnectivityIndicator | `ConnectivityIndicator` | `src/shared/components/ConnectivityIndicator/` |
| OfflineMutationFeedback (Snackbar) | `OfflineSnackbar` | `src/shared/components/OfflineSnackbar/` |
| OfflineMutationFeedback (Dialog) | `OfflineMutationDialog` | `src/shared/components/OfflineMutationDialog/` |

All three are shared components — they must not live inside any single feature module. Each must have a co-located `.module.scss` per frontend/CLAUDE.md styling rules. No `sx` prop usage.

---

## Copy Reference — All States, Final

All copy in Spanish (Inter typeface — never Playfair Display — B2B portal).

### ConnectivityIndicator

| State | Copy | Notes |
|---|---|---|
| Offline (mobile) | `Sin señal` | Icon carries the semantic weight; text is minimal |
| Offline (desktop) | `Sin conexión — los datos pueden no estar actualizados` | More space available; adds useful context |
| Reconnected (all) | `Conexión restaurada` | 4000ms, then hidden |

### OfflineMutationFeedback — Non-critical (Snackbar)

| Element | Copy |
|---|---|
| Line 1 | `No se pudo guardar` |
| Line 2 | `Sin conexión. Vuelve a intentarlo cuando recuperes la señal.` |
| Close button | `[X icon]` (no text label needed) |

### OfflineMutationFeedback — Critical (Dialog)

| Element | Copy |
|---|---|
| Title | `El cambio no se guardó` |
| Body | `No hay conexión en este momento. Los datos no fueron enviados. Cuando recuperes la señal, intenta guardar de nuevo.` |
| Button | `Entendido` |

### Submit Button Disabled State

| Element | Copy |
|---|---|
| Button label (disabled) | `Sin conexión` |

---

## Accessibility Notes for UI Designer

- All error-state color treatments must meet WCAG AA minimum 4.5:1 contrast ratio for text. The existing `error.main: #A32D2D` on white background meets this. White text on `error.main` also meets this. The UI Designer must verify the specific token combination chosen.
- The ConnectivityIndicator bar must have `role="status"` and `aria-live="polite"` for screen reader users. The transition to "Conexión restaurada" triggers a polite announcement.
- The OfflineMutationFeedback Dialog must trap focus while open (MUI Dialog does this by default). The "Entendido" button must be the initial focus target.
- The disabled submit button must have `aria-disabled="true"` and the label change (`Sin conexión`) serves as the accessible name explaining the disabled reason — do not rely on `title` attribute tooltips.
- `prefers-reduced-motion`: the ConnectivityIndicator fade-out transition (250ms) must be suppressed when this media query is active. The bar should disappear instantly instead of fading.

---

## What This Spec Does Not Cover

- Visual design tokens, colors, or spacing values — that is the UI Designer's domain
- React component implementation — that is react-developer's domain, consuming this spec and the UI spec
- Offline mutation queuing or retry logic — this spec works within the current constraint that mutations fail immediately; if queuing is added in the future, this spec should be revised
- Cache staleness indicators beyond the offline bar — a separate UX initiative if needed
