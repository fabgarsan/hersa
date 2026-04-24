# Hersa — Business Domain Reference

Hersa manages end-to-end graduation ceremonies for schools in Cali, Colombia. This file is the authoritative domain reference for implementing features. Read it when designing data models, writing business logic, or implementing any feature across the four system modules.

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

### Stage 1 — School onboarding
A Hersa sales rep meets with parent representatives and student delegates. If Hersa is selected:
- Collect contacts: parent rep + student rep
- Define: photo shoot dates, Prom date, graduation venue, invitation card count per student, package price per student
- Create a WhatsApp group with parents for ongoing communication

### Stage 2 — Student meeting at school
Sales rep meets with all graduates at school to finalize group preferences: border colors, stoles, and ceremony details.

### Stage 3 — Photo shoot
Held at Casa Campestre on the agreed date.
- Register each student: full name, institution, package total, amount paid (≥50% in cash on the day), balance due, toga size, phone, document number
- Photos are taken, sent for retouching, then packaged per student for delivery on graduation day
- If student is absent: $10,000 COP discount applied
- The 50×70 poster can be taken in toga or in personal attire (student brings their own outfit)
- Buses depart at the exact scheduled time — no exceptions

### Stage 4 — Prom activity
- Students pay remaining balance
- Invitation cards are distributed to each graduate
- Absent student: may send a classmate with an authorization letter + pending balance to collect materials
- No return transport on graduation day (return transport only on Prom day)
- Alcohol and substances are strictly prohibited; Hersa may deny service for violations

### Stage 5 — Graduation day
- Hersa staff receive graduates at the entrance
- Toga is checked and fitted (same size assigned at photo shoot)
- Any remaining balance is collected on the spot
- Photo packages are delivered
- Family members enter with their invitation cards/tickets
- Children under 5 are not admitted; children 5+ require a ticket
- Ceremony starts punctually at the time printed on the cards

---

## Key Business Rules

- Hersa manages the **ceremony**, not the academic graduation. The institution grants the diploma.
- The **contract is between the parent and Hersa** — not between the school and Hersa.
- Attending the photo shoot does not guarantee academic graduation.
- **If a student fails the year:**
  - 50% of the amount paid is refunded
  - The photo package and album are delivered to the student
  - Refund and delivery happen **only on graduation day**, through a classmate with an authorization letter and document copies
  - Student must return the invitation cards
- Leftover invitation cards are given away in full on Prom day — they are never sold
- Buses are shared between groups; they depart at the exact scheduled time
- Alcohol and substances are prohibited at all Hersa activities

---

## Team Roles

| Role | Qty | Responsibilities |
|------|-----|-----------------|
| Administrator | 2 | System config, global reports, user management |
| Sales rep (Comercial) | 3 | School onboarding, student meetings, follow-up |
| Photographer | Variable | Photo shoots, retouching, packaging photo orders |
| Graduation coordinator | Variable | On-site execution: ceremony, product delivery, graduation-day logistics |

---

## System Modules

1. **Admin** — System configuration, users, roles, global reports
2. **Graduation scheduler** — Schools, contracts, dates (photo shoot / Prom / graduation), venues, packages
3. **Photography** — Student registration, payments, toga sizes, photo shoot tracking, retouching and packaging
4. **Graduation day** — Attendance, toga handoff, balance collection, photo delivery, ticket management

---

## Users & Access

### Internal (Hersa staff)
- **Administrator:** Full system access
- **Sales rep:** School management, meeting records, student data
- **Photographer:** Photo process, payment registration, toga sizes
- **Graduation coordinator:** Graduation-day operations (attendance, deliveries, collections)

### External (no account registration required)
- **Parents:** View payment status and graduation progress for their child
- **School representatives:** View overall graduation progress for their institution

> External access must be protected without requiring user registration. Candidate mechanisms: unique token link, document/student-code + PIN, or phone number + OTP.

---

## Domain-Critical Technical Constraints

- **Simultaneous ceremonies:** Hersa may run multiple graduations on the same day at different venues. Every data model must scope events to a specific school + shift + date.
- **Partial payments:** Minimum 50% at photo shoot; remainder at Prom or graduation day. The system must track balance per student at all times.
- **Toga size:** Assigned at photo shoot, must match on graduation day. The system must enforce this link.
- **Physical photo packages:** Packages are physical items that must be assembled and associated to each student for delivery tracking.
- **Variable invitation cards:** Count per student is defined at contract time and stored per student.
- **Partial refunds:** Students who fail the year have a defined refund and delivery workflow that the system must support.
- **School shifts:** Diurna (morning), Nocturna (evening), Sabatina (Saturday). Each school may have multiple graduating shifts.
