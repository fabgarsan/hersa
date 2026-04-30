# Hersa — Operational Process Context

This document summarizes the operational context developers need to write correct business logic. It is a quick reference, not a complete process document. For detailed flow, decision points, and Lean justifications, see `documentation/process/to-be/hersa-proceso-operativo-to-be.md`.

---

## 1. Central Operating Unit: Promoción (Graduation Class)

The **Promoción** is the fundamental operational unit — not the institution alone.

**Definition:**
- InstitucionEducativa + Grado (academic year/level) + Jornada (shift) + Año (calendar year)
- Example: "Colegio X, Secundaria, Diurna, 2026"

**Uniqueness rule:** The tuple (institucion + grado + jornada + año) must be globally unique. The system rejects duplicate Promociones with validation error.

**Multi-Promoción per institution:** A single institution may have multiple active Promociones simultaneously with different package prices, event dates, and conditions. All operations must be scoped to Promoción, not institution.

**Package negotiation by Promoción:** When the sales rep (Comercial) negotiates a graduation package with an institution, the negotiated price and item composition apply to that specific Promoción only. The system automatically creates a "snapshot" (PaquetePromocion) to isolate this Promoción's package from the base package template and from other Promociones' snapshots.

---

## 2. Complete Role Registry

All roles — permanent, temporary, internal, and external — must have complete profile data before assignment to an event: full name, phone, document number, country, state/department, and city (selected from master lookup tables, never free text).

A single person may hold multiple roles simultaneously.

### Internal Permanent Roles

| Role | Count | Primary Responsibility |
|------|-------|------------------------|
| Manager (Gerente) | 1 | Authorizes discounts; resolves payment disputes; closes complaints within 48-hour SLA; delegates event staffing with ≥48h notice |
| Administrator | 2 | System configuration, user/role management, item catalog, base packages, geographic master tables, global reports, incident history |
| Sales Rep (Comercial) | 3 | Institution prospecting, Promoción onboarding, student meetings, event date confirmations, package negotiation, no longer manages manual date-change notifications (system auto-sends) |
| Cashier/Scheduler (Planillador/Cajero) | Variable | Opens payment sessions, registers and collects student payments, issues receipts, can record payments below 50% with mandatory written justification, closes session (system auto-generates close report) |
| Photographer | Variable (internal or external) | Conducts photo shoots, retouching (can start in parallel with ongoing shoots), packages photo orders, verifies student payment status in system (no printed receipt required) |
| Dresser (Vestidor) | Variable (internal or external temp) | Measures and fits graduation gowns (togas) on photo shoot day |
| Graduation Coordinator (Coordinador de Grado) | Variable | Manages ceremony-day operations: entrance, gown verification, balance collection, package delivery, QR scanning; receives staffing assignment ≥48h before event |
| Warehouse Manager (Personal de Bodega) | Variable | Prepares event materials: gowns by size, tassels, caps, stoles, table linens, chairs, tables, glassware for each event |
| Logistics Lead (Jefe de Logística) | 1 permanent | Directs graduation logistics, makes individual and bulk personal assignments to events, delivers assignment notifications ≥48h before event |
| Secretary (Secretaria) | Variable | General administration, system access per role permissions |

### External Contractors

| Role | Type | Primary Responsibility |
|------|------|------------------------|
| Driver (Conductor) | Permanent or per-job | Transports graduates on shoot day and Prom day, manages pickup routes with scheduled stops |
| Master of Ceremony | Per-event | Directs ceremony protocol and traditions |
| Music Group (Grupo Musical) | Per-event | Performs during ceremony intermissions and Prom, if negotiated |
| Catering (Alimentos) | Per-event | Provides food and beverages for Teacher Dinner and Prom activity; contracted ≥48h before event |
| Waiters (Meseros) | Temporary per-event | Table service at Teacher Dinner and Prom activity |
| Additional Dressers (Vestidores Adicionales) | Temporary per-event | Support gown fitting if volume requires, ≥48h before event |

### External Candidate Pool

Candidates interested in temporary work (especially during high-season graduation months) are registered with state (interested, contacted, active, inactive), roles they can fill, and source (Hersa graduate, referral, external). Before assignment, their profile must be complete (6 mandatory fields). A candidate in "active" state is available for event assignment.

---

## 3. Operational Stages (Summary)

**Stage 0: Scheduling (Agendamiento)**
- Sales rep contacts principal/rector by phone or in-person
- Proposes meeting date; system records prospect visit with date and director contact
- No student or institution data captured yet

**Stage 0.5 (pre-Stage 1): Quoter / Cotizador**
- Sales rep creates a `Cotizacion` (quotation) during prospecting, before formal Promoción linkage
- Selects a base package, adds/removes items, sets price per student and estimated student count
- System generates PDF quotation (format TBD at implementation)
- Quotation states: `borrador`, `enviada`, `aceptada`, `rechazada`, `vencida`, `convertida_a_promocion`
- Item prices in the quotation are a snapshot at creation time; catalog price changes do not affect active quotations
- Quotation is not editable once sent — duplicate as new quotation instead
- When negotiation closes: sales rep uses "Convertir en Promoción" action → system creates Promoción + PaquetePromocion (snapshot) from quotation items/prices. Bidirectional link established
- Creating a Promoción without a prior quotation remains valid (the quoter is optional)
- Manager has dashboard visibility of all active quotations

**Stage 1: Institucional Onboarding / Promoción Linkage (Vinculación de la Promoción)**
- Sales rep meets with parent reps and student delegates at institution
- Negotiates graduation package (items, price per student, invitation card count, event dates)
- System auto-sends date-change notifications to all registered contacts (parent rep, student delegate) whenever a date is registered or updated; sales rep no longer manages WhatsApp notifications manually
- Defines: photo shoot dates (tentative), Prom date, graduation venue, package snapshot, price per student, invitation cards per student
- Graduation date may be registered later, before Prom; system allows filtering Promociones without graduation date for follow-up
- Contract signed between parent/guardian and Hersa (institutional approval is prerequisite, but institution does not sign)
- Parent and student WhatsApp group created
- **Bulk Promoción creation:** Sales rep can create multiple Promociones from one institution in a single step using the bulk panel. Applies the same package to multiple grade configurations (e.g., Bachillerato Diurna + Bachillerato Nocturna) with individual price per configuration. The system creates an independent PaquetePromocion snapshot per Promoción (never shared). Creation is atomic: if any Promoción fails validation, none are created. System shows pre-confirmation summary of all N Promociones with individual prices.

**Stage 1b: Teacher Dinner (Cena de Profesores) — Optional**
- Held at Hersa Casa Campestre
- Included in negotiated package; no separate charge
- Maximum 1 per Promoción cycle (system warns but allows multiple with justification)
- Requires staff assignment (waiters, catering provider) ≥48h before event

**Stage 2: Student Meeting at Institution**
- Sales rep meets with all graduates in-person
- Records student count per group (e.g., "11A" = 35 students; groups are subdivisions within a grade)
- Students join parent WhatsApp group
- Sales rep shares self-registration link/QR code with student delegates
- Students begin self-registration (async, can happen anytime after this stage until they pay in full)

**Stage 3: Photo Shoot (Toma Fotográfica)**
- Organized by group, not individual grade; one institution may occupy one full day across multiple groups
- **Toga flow (corrected order):** Dresser (vestidor) physically measures and fits the gown BEFORE the student goes to the cashier. The dresser does NOT enter anything in the system. The cashier is the actor who records the toga size in the system, at the same time as registering payment.
- Cashier opens payment session; processes payments per student in real-time; records toga size in the same transaction
- Minimum payment: 50% of package price in cash (default). If cashier collects <50%, mandatory written justification in payment comment field
- System auto-sends email/SMS receipt to student and parent showing amount paid and balance due
- System marks student as "authorized for photo shoot" once payment minimum is met
- Photographer consults system status to verify authorization (no printed receipt required as sole authorization; printed receipt is optional backup for the student)
- Photo shoot proceeds; group preferences collected (border colors, stoles, ceremony details)
- Retouching can begin in parallel with ongoing shoots (no need to wait for day-end)
- Absent students: $10,000 COP discount applied; they schedule Prom or Varios session. **Toga size is NOT recorded for absent students** — it gets recorded when they pay at the next session (Prom or Varios)
- At session close, cashier executes "close group" action; system auto-crosses absent students and applies discount
- System auto-generates closed-session report (total collected, per-student breakdown, pending balances, add-ons, exception payments with justification) — no manual close-of-day by cashier

**Stage 4: Prom Activity (Actividad Prom)**
- Graduation rehearsal held on this day
- Students pay remaining balance
- Invitation cards (QR tokens) distributed to each graduate
- Absent students: classmate can collect on their behalf with authorization letter + document copies and complete any pending balance
- No return transport on graduation day (return transport only on Prom day)
- Food and beverages provided by external catering contractor
- Waiters and catering provider assigned ≥48h before event
- System auto-generates closed-session report when payment session closes
- **Additional ticket gifts (Boletas Obsequio):** When leftover invitation cards remain, the Manager (or equivalent permission role) can authorize gifting additional boletas to specific students or all students. Authorization is exclusive to Manager-level. The system records each gifted QR token with origin `obsequio_prom` (distinct from `negociacion_inicial`), the authorizing user, and issue timestamp. Gifted tokens do not count against the negotiated quota. If the venue has a registered capacity, the system alerts (does not block) if total active tokens (negotiated + gifted) exceeds capacity.

**Stage 5: Miscellaneous Photos (Toma Fotografía Varios)**
- Extra photo session before graduation day; cross-institution
- Three use cases: (1) extra shots on top of originals, (2) dissatisfaction retakes (special cases only), (3) absent from both Stage 3 and Stage 4 (last chance)
- Held on date published in advance; all institutions notified
- Follows same payment flow as Stage 3

**Stage 6: Graduation Day (Día de Grado)**
- System auto-generates pre-list of students with pending balance ≥24h before event, and auto-notifies students/parents with amount and deadline
- Graduation Coordinator confirms event staffing (coordinator role, cashier role) ≥48h before (system allows late registrations with warning, notifies manager if critical roles missing)
- Warehouse staff prepares materials: gowns by size, tassels, caps, stoles, linens, chairs, tables, glassware
- Hersa staff receives graduates at entrance; gown size verified (must match photo-shoot assignment; system enforces this link)
- Cashier validates balance in real-time (pre-loaded list available). If balance >0, cashier collects full amount. Only then Coordinator delivers package
- Package delivery tracked in system with delivery timestamp (immutable)
- Family members enter via single-use QR ticket (scanned and invalidated at entry); no entry without ticket; children <5 not admitted; children ≥5 require ticket
- If student does not graduate: all QR tickets immediately cancelled and invalidated on graduation day. The 50% refund and package delivery do NOT happen on graduation day — they happen through a separate async `SolicitudReembolso` process initiated later (see Critical Business Rules)
- Ceremony starts punctually at time printed on invitation cards
- Manager can register escalations with timestamp and reason; escalation details enter incident history for future contract negotiations

---

## 4. Critical Business Rules for Implementation

**Payment minimum flexible:** Default 50% on photo shoot day, but cashier can collect <50% if they provide mandatory written justification in the payment comment field. System blocks save without justification if amount <50%. Report at session close includes all exception payments with their justification for manager review.

**Delivery conditional on full payment:** Graduation day: student must have saldo = 0 before package is delivered. No exceptions.

**Package snapshot isolation:** When sales rep modifies a base package for a Promoción, system auto-creates PaquetePromocion (snapshot). Changes to snapshot do not affect base package or other Promociones.

**Non-graduation refund (SolicitudReembolso — async):** If student fails year, QR tickets are cancelled immediately on graduation day. The 50% refund and package/album delivery happen through a separate async process:
- Student or representative initiates `SolicitudReembolso` after graduation day (with authorization letter + document copies)
- Uploads non-graduation proof (PDF or image)
- Solicitud states: `solicitado` → `en_revision` → `aprobado` → `procesado` | `rechazado`
- Manager is sole authority to approve. System calculates 50% of amount paid
- Manager or admin marks as `procesado` with transfer reference once refund is paid
- Package delivery timestamp recorded in system (immutable)
- SLA for refund processing: TBD (not yet defined by business)

**Complaint SLA and escalation (configurable):** 3 calendar-day resolution window from registration (default). Escalation alert fires at a configurable time before SLA expiry. Both values are stored in `ConfiguracionSistema` table (`inconformidad.sla_dias`, `inconformidad.alerta_horas_antes_vencimiento`) and adjustable by administrator without redeploy. Each `Inconformidad` records `sla_aplicado` (snapshot of SLA value at creation) to preserve historical metrics when config changes. Auto-notification to complainant at registration (with reference number) and at closure (with summary). Manager is sole authority to close complaint in system.

**Manager-authorized discounts only:** Only Manager (or role equiv) can authorize discounts. Discounts are visible to cashier at payment time (system-applied). Cashier cannot create or modify discounts.

**Multi-event simultaneity support:** Every data model involving events must scope to (Promoción + FechaEvento). Hersa may run multiple ceremonies same day, different venues.

**48-hour event staffing notice:** Personal assignment (individual or bulk) to any event (photo shoot, Prom, graduation, Teacher Dinner) must be confirmed in system ≥48 hours before event. Manager notified if critical roles (coordinator, cashier) are missing. Bulk assignments can be overridden per-event by individual assignment.

**Date mutability without data loss:** Photo shoot, Prom, Varios, and graduation dates can change after being set. System preserves prior dates in change history. All student payments, registrations, and logistics data remain intact.

**Group-level organization, not individual-grade:** Photo shoots and logistics are organized by named group within grade (e.g., "11A", "11B"), each with its own student count. System must scope operations to group level.

**Student self-registration async:** Students can register via shared QR/link without user account. Registration link/QR auto-invalidates when student balance reaches 0.

**External collaborators require complete profile:** All internal and external collaborators (temporary and permanent) must have: name, phone, document number, country, department, city (selected from master tables—no free text). No assignment without complete profile.

**Candidate external staff bulk contact:** When convening temporary staff from candidate pool, administrator can send postulation invitations to multiple candidates simultaneously (not one-by-one). Each candidate gets unique form link. Candidate completes mandatory profile fields to become "active" and eligible for assignment.

**QR ticket one-time-use and invalidation:** Each invitation card is a single-use QR code. Scanned at ceremony entrance and invalidated. If student does not graduate, all their QR codes cancelled immediately.

**Complaint auto-notifications:** System auto-sends confirmation (with reference number and 48h-SLA info) when complaint registered. System auto-sends closure summary when manager closes complaint. These auto-notifications are in addition to any manual manager contact.

**Personal assignment bulk origin traceability:** When bulk rule (by venue or date-range) creates multiple personal assignments, system records that origin. This allows quick identification of which events were affected if the bulk rule is modified.

**Event collaborator notification control:** Administrator manually initiates notifications to event staff (not automatic). System shows summary before send (count of recipients, count already notified, message preview), prevents duplicate sends by default, allows forced resend with confirmation. All sends logged with timestamp per recipient.

**Collaborator calendar recent-change indicator:** Collaborator-facing calendar shows visual marker on events notified of changes in last 48 hours.

---

## 5. Key Data Entities (Relationship Tree)

```
Cotizacion (pre-Promocion quotation — optional)
  ├─ InstitucionEducativa (FK)
  ├─ CotizacionItem (snapshot: ItemCatalogo + precio_cotizado)
  └─ Promocion (FK nullable — set when converted)

InstitucionEducativa
  └─ Promocion (unique: institucion + grado + jornada + año)
      ├─ Grupo
      │   └─ Estudiante
      │       ├─ Pago
      │       ├─ TicketQR (origen: negociacion_inicial | obsequio_prom)
      │       │   └─ BoletaObsequio (FK to TicketQR where origen=obsequio_prom, + autorizador, fecha_emision)
      │       ├─ EntregaPaquete
      │       ├─ Inconformidad
      │       │   └─ sla_aplicado (snapshot del SLA vigente al crear)
      │       ├─ DescuentoAutorizado
      │       └─ SolicitudReembolso (async non-graduation refund)
      │           ├─ estado: solicitado|en_revision|aprobado|procesado|rechazado
      │           └─ comprobante_no_graduacion (PDF or image)
      ├─ FechaEvento (tipo: toma_fotografica, prom, varios, grado, cena_profesores)
      │   ├─ AsignacionPersonalEvento (origen: individual | bulk | postulacion_slot)
      │   ├─ Ruta
      │   │   └─ ParadaRuta
      │   ├─ NotificacionColaborador
      │   │   └─ DestinatarioNotificacion
      │   └─ SesionCobro
      │       ├─ Pago (includes talla_toga field recorded by cashier)
      │       └─ ReporteCierreCaja
      ├─ ContactoPromocion (representante_padres, delegado_estudiantil)
      ├─ PaquetePromocion (snapshot de paquete negociado)
      │   └─ ItemCatalogo (through PaquetePromocionItem)
      └─ Escalacion (incident record)

PaqueteBase
  └─ ItemCatalogo (through PaqueteBaseItem)

ItemCatalogo
  └─ Precio (0 = incluido; >0 = adicional)

Usuario (internal staff)
  ├─ Rol (M2M: administrator, comercial, cajero, fotografo, coordinador_grado, gerente, etc.)
  ├─ AsignacionPersonalEvento
  └─ Perfil (nombre, teléfono, documento, país, departamento, ciudad)

CandidatoExterno (external temp staff)
  ├─ Rol (mesero, vestidor_adicional, etc.)
  ├─ fecha_ultima_actualizacion_perfil (for yearly-update tracking)
  ├─ PostulacionEnviada (token-based profile form — legacy convocation flow)
  └─ PostulacionSlot (bidirectional calendar application)
      └─ estado: postulado | aceptado | rechazado | cancelado_por_candidato

SlotEvento (published by admin in postulation calendar)
  ├─ rol_requerido (FK to Rol)
  ├─ capacidad, hora_llegada, hora_salida, descripcion
  ├─ tipo_cobertura: evento_especifico | dia_completo_localidad
  ├─ fecha_evento (FK optional to FechaEvento)
  ├─ localidad (FK optional to Sede/Auditorio)
  ├─ estado_publicacion: disponible | completo | cerrado | cancelado
  └─ PostulacionSlot (multiple)
      └─ → AsignacionPersonalEvento (created on acceptance, origin: postulacion_slot)

ReglaAsignacionBulk
  └─ AsignacionPersonalEvento (origin: bulk)

ConfiguracionSistema (global system settings, managed by administrator)
  ├─ inconformidad.sla_dias (default: 3 calendar days)
  └─ inconformidad.alerta_horas_antes_vencimiento (configurable)

Inconformidad
  ├─ sla_aplicado (snapshot of ConfiguracionSistema value at creation time)
  └─ NotificacionEnviada (acuse de recibo, cierre)

Pais → Departamento → Ciudad (master lookup tables)
```

---

## 6. Domain-Critical Technical Constraints

- **Multi-Promoción simultaneous:** Hersa may run multiple graduations on same day, different venues. All operations must be scoped to (Promoción, FechaEvento).
- **Groups within grade:** Grades are subdivided into named groups (11A, 11B, 11C). Photo shoots, logistics, and all event operations are organized **by group**, not flat by grade.
- **Partial payment tracking:** System tracks balance per student at all times. Minimum 50% (or justified exception) triggers "authorized" state; remainder due at Prom or graduation.
- **Gown size recorded by cashier:** The dresser (vestidor) physically measures BEFORE payment. The cashier records toga size in the system at payment time. No other actor records this field. System blocks save without toga size if student doesn't already have one. If student is absent on shoot day, size is recorded at next session (Prom or Varios).
- **Physical photo packages:** Packages are assembled per student for delivery tracking; delivery must be recorded in system with timestamp.
- **TicketQR origin tracking:** `TicketQR.origen` enum distinguishes `negociacion_inicial` from `obsequio_prom`. Negotiated quota validation only applies to `negociacion_inicial` tokens. Gifted tokens require Manager authorization and are recorded per-student with authorizer and timestamp. Venue capacity alert fires when total active tokens (both origins) exceed registered aforo.
- **Ticket cancellation bulk:** Single action cancels and invalidates all QR codes for non-graduating student (executed on graduation day immediately).
- **Async refund flow (SolicitudReembolso):** Non-graduate refund is NOT same-day. System manages lifecycle: `solicitado → en_revision → aprobado → procesado | rechazado`. Proof of non-graduation upload required (PDF or image). Manager is sole approver. SLA TBD.
- **Date mutability and cascade notification:** Dates can change; system sends auto-notifications to all linked contacts; no WhatsApp burden on sales rep.
- **Self-registration async flow:** Students register independently via shared QR/link, no user account required. Async process with async validation.
- **Varios cross-institutional:** Shared photo session serving multiple Promociones; tracks attendance reason (add-on, retake, absent-makeup).
- **Manager discount authorization:** System enforces authorization gate; no other role can create or modify discounts.
- **Bulk personal assignment origin tracking:** System records whether assignment came from bulk rule, individual creation, or `postulacion_slot`. Allows safe rule modification.
- **Multi-cashier per session:** Multiple cashiers can operate independent payment sessions same day/event; each session tied to one cashier.
- **48-hour event staffing confirmation:** All event assignments must be in system ≥48h before. Manager notified of missing critical roles.
- **Master table geographic:** Country, Department, City are lookup-only (CRUD via Django Admin). No free-text entry in collaborator profiles.
- **Configurable SLA via ConfiguracionSistema:** Read SLA values from `ConfiguracionSistema` table via `ConfigService`, never hardcode. Each `Inconformidad` stores `sla_aplicado` snapshot at creation to protect historical metrics when config changes.
- **Bulk Promoción creation atomicity:** If any Promoción in a bulk creation fails validation, none are created. Use single database transaction. Each always gets its own independent `PaquetePromocion` snapshot.
- **Quotation price snapshot:** `Cotizacion` stores item prices at creation time. Catalog changes must NOT retroactively affect quotations. Converting to Promoción copies prices from quotation snapshot into `PaquetePromocion`.
- **SlotEvento conflict check:** When admin accepts a `PostulacionSlot`, system validates no existing `AsignacionPersonalEvento` in same time window for that candidate. Alert shown (does not block); admin confirms explicitly.
- **Candidate profile yearly tracking:** `CandidatoExterno.fecha_ultima_actualizacion_perfil` updated on every save. System sends yearly reminder campaign. Profile can be updated at any time.

---

## 7. Reference to Complete Documentation

- **Full process:** See `documentation/process/to-be/hersa-proceso-operativo-to-be.md` (Spanish, v2.1)
- **Functional specifications:** See `documentation/requirements/specs/hersa-especificaciones-funcionales.md` (Spanish, v2.0)
- **API contracts:** See `.claude/shared/conventions/api-contract.md` (or `api-contract.md` in the skills directory)
- **Hersa company context:** See `.claude/shared/hersa-context.md`
