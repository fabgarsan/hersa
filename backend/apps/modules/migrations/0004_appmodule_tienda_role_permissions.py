from __future__ import annotations

from django.db import migrations


class Migration(migrations.Migration):
    """Adds access_tienda_admin and access_tienda_vendedor permissions to AppModule."""

    dependencies = [
        ("modules", "0003_alter_appmodule_options"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="appmodule",
            options={
                "default_permissions": (),
                "managed": False,
                "permissions": [
                    ("access_tienda", "Puede acceder al módulo Tienda"),
                    ("access_tienda_admin", "Puede acceder con rol administrador de Tienda"),
                    ("access_tienda_vendedor", "Puede acceder con rol vendedor de Tienda"),
                    ("access_programador", "Puede acceder al módulo Programador"),
                    ("access_admin", "Puede acceder al módulo Admin"),
                ],
            },
        ),
    ]
