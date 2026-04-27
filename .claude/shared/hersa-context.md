# Hersa — Business Domain Reference

Hersa manages end-to-end graduation ceremonies for educational institutions in Cali, Colombia. This file is the authoritative domain reference for implementing features. Read it when designing data models, writing business logic, or implementing any feature across the four system modules.

---

## Services Portfolio

**Ceremony logistics:**
- Ushers, ceremony staff, master of ceremony
- Rehearsal and graduation protocol

**Deliverables per graduate:**
- Invitation cards (quantity varies by contract)
- Luxury button with institution shield
- Award medals (top students)
- Diploma folder branded with institution logo
- Embroidered stole with institution logo
- Leather-bound photo album
- Graduation cap (birrete) + cord as keepsake
- Serenade

**Decoration:** Floral arrangements and full auditorium decoration.

**Photography studio** (held at Casa Campestre Hersa — Carrera 127° #20-22, Pance):
- 1 half-body enlargement 20×30 cm
- 9 half-body photos 3×4 cm
- 1 half-body with parchment 20×30 cm
- 1 card-photo enlargement 20×30 cm
- 1 group photo 20×30 cm
- 1 group "loca" photo 20×30 cm
- 1 poster 50×70 cm (unframed)
- Add-ons: extra posters $50,000 COP; family photos $20,000 COP each

**Prom integration activity** (Casa Campestre Hersa):
- Full decoration, Tiffany chairs, glassware
- Meal: two-protein plate, rice, salad, soda
- Servers + toast
- Round-trip transport for graduates only (shared buses between groups)

> Prom and photography studio are **exclusive to graduates** — no family members.

---

## Operational Flow

### Stage 0 — Scheduling (Agendamiento)
A micro-stage before educational institution onboarding. The sales rep contacts the educational institution principal by phone or in-person to define a meeting date. No data is captured yet — this is purely a scheduling step.

### Stage 1 — Educational Institution onboarding (Vinculación de la Institución Educativa)
A Hersa sales rep meets with parent representatives and student delegates. If Hersa is selected:
- Collect contacts: parent rep + student rep (student reps are added to the WhatsApp group)
- Define: photo shoot dates, Prom date, graduation venue, package price per student, **invitation card count per student** (defined at this first visit)
- Graduation date may not be defined yet — the sales rep confirms it later after checking venue availability
- Create a WhatsApp group with parents for ongoing communication

### Stage 2 — Student meeting at educational institution
Sales rep meets with all graduates at educational institution:
- Record **student count per group** (not per grade — a grade can have multiple groups)
- Students are added to the parents' WhatsApp group
- Communicate confirmed photo shoot dates
- Student self-registration can begin here: sales rep shares a link or QR code with student reps so graduates fill in their own data (full name, document number, phone, toga size, etc.)
- Group preferences (border colors, stoles, ceremony details) are **not** collected here — they happen during the photo shoot stage

### Stage 3 — Photo shoot (Tomas fotográficas)
Held at Casa Campestre. Organized **by group**, not by grade. A single educational institution may occupy one full day across its multiple groups; up to 2 small institutions may share a day (each institution can still have many groups within that shared day). Multiple groups from the same grade at the same institution may exceptionally shoot at the same hour.

- Register each student: full name, institution, package total, amount paid (≥50% in cash on the day), balance due, toga size, phone, document number
- Collect group preferences: border colors, stoles, and ceremony details
- Photos are taken, sent for retouching, then packaged per student for delivery on graduation day
- **Add-ons available:** family photo ($20,000 COP), companion-group photo (defined price), extra posters ($50,000 COP each)
- **Absent students:** $10,000 COP discount applied; they may attend a later "Varios" session or on Prom day
- The 50×70 poster can be taken in toga or personal attire (student brings their own outfit)
- Hersa may grant partial payment discounts, authorized by the manager (defined in advance or on the spot)
- Buses depart at the exact scheduled time — no exceptions
- System must cross-check registered students against those with no payment recorded

### Stage 4 — Prom activity (Actividad Prom)
- **Graduation rehearsal** takes place on this day
- Students pay remaining balance
- Invitation cards (single-use QR codes) are distributed to each graduate
- Absent student: may send a classmate with an authorization letter + pending balance to collect materials
- No return transport on graduation day (return transport only on Prom day)
- Alcohol and substances are strictly prohibited; Hersa may deny service for violations
- Students who did not attend the original photo shoot (Stage 3) may take their photos on this day

### Stage 5 — Miscellaneous photo day (Toma Fotografía Varios)
An extra photo session held before graduation day, open to all institutions. This session covers three distinct cases:
- Students satisfied with their original photos who want **additional** shots (extra posters, add-ons)
- Students **dissatisfied** with their original photos who request a retake (special cases only, not a general rule)
- Students who **missed both** the original photo shoot (Stage 3) and the Prom session (Stage 4) — this is their last opportunity before graduation
- Date is defined well in advance so students can plan; it is communicated to all institutions

### Stage 6 — Graduation day
- Hersa staff receive graduates at the entrance
- Toga is checked and fitted (same size assigned at photo shoot)
- Any remaining balance is collected on the spot
- Photo packages are delivered
- Family members enter with **single-use QR-code tickets** (invalidated on scan at entry)
- If a student does not graduate, all their tickets are cancelled and no longer valid
- Children under 5 are not admitted; children 5+ require a ticket
- Ceremony starts punctually at the time printed on the cards

---

## Key Business Rules

- Hersa manages the **ceremony**, not the academic graduation. The institution grants the diploma.
- The **contract is between the parent and Hersa**. The educational institution does not sign the contract, but it is the institution that authorizes Hersa's access to students and facilities — without institutional approval, the entire process cannot begin.
- Attending the photo shoot does not guarantee academic graduation.
- **If a student fails the year:**
  - The student (or a representative) uploads proof of non-graduation; the system processes the refund
  - 50% of the amount paid is refunded
  - The photo package and album are delivered to the student
  - Refund and delivery happen **only on graduation day**, through a classmate with an authorization letter and document copies
  - All invitation QR tickets for that student are cancelled and invalidated immediately
- **Invitation cards are single-use QR codes** — scanned and invalidated at the ceremony entrance. If a student does not graduate, all their codes are cancelled
- Leftover invitation cards are given away in full on Prom day — they are never sold
- Buses are shared between groups; they depart at the exact scheduled time
- Alcohol and substances are prohibited at all Hersa activities
- **Event dates (photo shoots, Prom, graduation) can change** — the system must support date updates without data loss
- **Institutions incident log:** Hersa tracks incidents per institution (e.g., high failure rates, service complaints) as a history that informs future contract negotiations

---

## Team Roles

| Role | Qty | Responsibilities                                                        |
|------|-----|-------------------------------------------------------------------------|
| Administrator | 2 | System config, global reports, user management                          |
| Sales rep (Comercial) | 3 | Institution onboarding, student meetings, follow-up                     |
| Photographer | Variable | Photo shoots, retouching, packaging photo orders                        |
| Graduation coordinator | Variable | On-site execution: ceremony, product delivery, graduation-day logistics |

---

## System Modules

1. **Admin** — System configuration, users, roles, global reports, institution incident history
2. **Graduation scheduler** — Educational Institution, contracts, dates (Scheduling → Onboarding → Student meeting → Photo shoot → Prom → Varios → Graduation), venues, packages; supports date changes
3. **Photography** — Student registration (self-registration via QR/link + in-person), payments, toga sizes, add-ons (family photo, companion-group photo, extra posters), photo shoot tracking (by group), retouching and packaging, Varios session management
4. **Graduation day** — Attendance, toga handoff, balance collection, photo delivery, QR ticket scanning and invalidation, cancelled-ticket management for non-graduating students

---

## Users & Access

### Internal (Hersa staff)
- **Administrator:** Full system access
- **Sales rep:** Educational Institution management, meeting records, student data
- **Photographer:** Photo process, payment registration, toga sizes
- **Graduation coordinator:** Graduation-day operations (attendance, deliveries, collections)

### External (no account registration required)
- **Parents and students:** View payment status and graduation progress
- **Institutional representatives (selected students):** View overall graduation progress for their institution

> External access must be protected without requiring user registration. Candidate mechanisms: unique token link, document/student-code + PIN, or phone number + OTP.

---

## Domain-Critical Technical Constraints

- **Simultaneous ceremonies:** Hersa may run multiple graduations on the same day at different venues. Every data model must scope events to a specific institution + shift + date.
- **Groups within a grade:** An institution grade (e.g., grade 11) is subdivided into named groups (e.g., 11A, 11B, 11C), each with its own student count. Photo shoots, meetings, and logistics are organized **by group**, not by grade.
- **Partial payments:** Minimum 50% at photo shoot; remainder at Prom or graduation day. The system must track balance per student at all times.
- **Toga size:** Assigned at photo shoot, must match on graduation day. The system must enforce this link.
- **Physical photo packages:** Packages are physical items that must be assembled and associated to each student for delivery tracking.
- **Variable invitation cards:** Count per student is defined at institution onboarding and stored per student. Cards are **single-use QR codes** invalidated at scan.
- **Ticket cancellation:** If a student does not graduate, all their QR invitation codes must be bulk-cancelled and rendered invalid at the ceremony gate.
- **Partial refunds:** Students who fail the year have a defined refund and delivery workflow; the system must accept proof-of-non-graduation upload to trigger refund processing.
- **Date mutability:** Photo shoot, Prom, Varios, and graduation dates can change after being set. Models must support date updates and cascade notifications.
- **Self-registration:** Students can register their own data via a shared link or QR code. The system must support this asynchronous flow as well as in-person registration.
- **Varios photo session:** A shared cross-institutions photo day that must be modeled as a distinct event type, tracking which students attend and why: add-on (extra shots on top of originals), retake (special-case dissatisfaction), or absent-makeup (missed both Stage 3 and Stage 4 — last chance before graduation).
- **Manager-authorized discounts:** Hersa may grant ad-hoc package discounts (by manager authorization). The system must record discount source and authorization.
- **Education Institution incident log:** The system must maintain a timestamped incident history per institution for use in future contract negotiations.
- **Education Institution shifts:** Diurna (morning), Nocturna (evening), Sabatina (Saturday). Each institution may have multiple graduating shifts.
