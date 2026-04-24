from __future__ import annotations

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("modules", "0001_initial"),
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.DeleteModel(name="UserModulePermission"),
        migrations.DeleteModel(name="Module"),
        migrations.CreateModel(
            name="AppModule",
            fields=[],
            options={
                "managed": False,
                "default_permissions": (),
                "permissions": [
                    ("access_tienda", "Puede acceder al módulo Tienda"),
                    ("access_programador", "Puede acceder al módulo Programador"),
                ],
            },
        ),
    ]
