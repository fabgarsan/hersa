# ADR-001: Use Django Groups for Tienda role-based access control

**Status:** Accepted
**Date:** 2026-05-04
**Deciders:** Backend lead + Tienda module owner
**TDD reference:** N/A

## Context

The new Tienda module (`apps/tienda/`) is being added to the Hersa Django backend. Tienda allows existing Hersa users to assume roles within the Tienda context (e.g. store manager or sales associate). Access to Tienda endpoints and data visibility must be controlled by role: `tienda_admin` can view monetary values and manage permissions; `tienda_vendedor` can only view item quantities.

Django's authentication framework already provides `django.contrib.auth.models.Group` and `django.contrib.auth.models.Permission`, which integrate natively with Django Admin, the ORM permission API, and Django REST Framework permission classes.

## Decision

Tienda role-based access control is implemented using **Django's native `auth.Group` model**. Two groups are created via data migration: `tienda_admin` and `tienda_vendedor`. Permission classes in `apps/tienda/permissions.py` (`IsTiendaAdmin`, `IsTiendaVendedor`) check group membership via `request.user.groups.filter(name=...).exists()`.

This approach was chosen because it requires no schema changes to `UserProfile`, supports multiple roles per user, integrates with Django Admin and the Django permission framework without custom code, and allows future roles to be added via data migrations without modifying the schema.

## Alternatives considered

| Option | Why rejected |
|--------|-------------|
| Add `rol_tienda = CharField(choices=['admin', 'vendedor', ...], null=True)` to `UserProfile` | Requires schema migration; limits to one role per user; does not integrate with Django Admin or Django's permission framework; adding future roles requires new data migrations and code changes; introduces custom permission logic instead of leveraging framework standards |
| Use a separate `TiendaUserRole` junction table with ForeignKey to User | More complex to query and maintain; introduces another model; does not leverage Django's built-in Group functionality |
| Store roles as JSON field in `UserProfile` | Bypasses Django's permission framework; cannot be indexed or queried efficiently; difficult to audit role changes; breaks Django Admin integration |

## Consequences

**Positive:**
- No schema migration required; no changes to the `UserProfile` model.
- Supports multiple roles per user without schema change.
- Native Django Admin integration: roles can be assigned via the Django admin interface.
- Integrates with Django's permission framework; future permission granularity can be layered on top via `Permission` objects.
- Adding new roles in the future requires only a data migration, not schema changes.
- Follows Django best practices and framework conventions.

**Negative / tradeoffs:**
- Permission checks require a database join to `auth_user_groups`; however, this table is indexed by Django by default, so query impact is minimal.
- Once users are assigned to groups in production, reverting to a field-based approach becomes difficult and requires a backfill migration.
- Changes to group membership logic or group names require careful coordination to avoid breaking existing role assignments in production.

**Follow-up actions required:**
- [ ] Create data migration in `apps/tienda/migrations/` to create `tienda_admin` and `tienda_vendedor` groups with appropriate permissions.
- [ ] Implement permission classes (`IsTiendaAdmin`, `IsTiendaVendedor`) in `apps/tienda/permissions.py`.
- [ ] Add group assignment logic to Tienda onboarding or user management workflow.
- [ ] Document in `.claude/shared/hersa-process.md` how to assign and manage Tienda roles operationally.
- [ ] Update backend `.env.example` with any environment-driven role configuration (if needed).
