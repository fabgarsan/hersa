from __future__ import annotations

from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor
from django.db.migrations.state import StateApps


def create_seed_data(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    """Seed initial Location rows and tienda auth Groups with their permissions.

    Idempotent via get_or_create — safe to re-run.
    """
    Location = apps.get_model("tienda", "Location")
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    # Seed locations
    Location.objects.get_or_create(
        name="CENTRAL",
        defaults={"location_type": "central"},
    )
    Location.objects.get_or_create(
        name="Tienda",
        defaults={"location_type": "pos"},
    )

    # Seed groups
    admin_group, _ = Group.objects.get_or_create(name="tienda_admin")
    vendedor_group, _ = Group.objects.get_or_create(name="tienda_vendedor")

    # Assign AppModule permissions to the groups
    try:
        parent_perm = Permission.objects.get(codename="access_tienda")
        admin_perm = Permission.objects.get(codename="access_tienda_admin")
        vendedor_perm = Permission.objects.get(codename="access_tienda_vendedor")

        admin_group.permissions.add(parent_perm, admin_perm)
        vendedor_group.permissions.add(parent_perm, vendedor_perm)
    except Permission.DoesNotExist:
        # Permissions may not exist yet in test environments without running
        # the full modules migration chain; the wiring is non-blocking.
        pass


def reverse_seed_data(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    """Remove seed data created by the forward migration."""
    Location = apps.get_model("tienda", "Location")
    Group = apps.get_model("auth", "Group")

    Location.objects.filter(name__in=["CENTRAL", "Tienda"]).delete()
    Group.objects.filter(name__in=["tienda_admin", "tienda_vendedor"]).delete()


class Migration(migrations.Migration):
    """Data migration: seed Location rows and tienda auth Groups."""

    dependencies = [
        ("tienda", "0001_initial"),
        ("modules", "0004_appmodule_tienda_role_permissions"),
    ]

    operations = [
        migrations.RunPython(create_seed_data, reverse_code=reverse_seed_data),
    ]
