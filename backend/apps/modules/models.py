from __future__ import annotations

from django.db import models


class AppModule(models.Model):
    class Meta:
        managed = False
        default_permissions = ()
        permissions = [
            ("access_tienda", "Puede acceder al módulo Tienda"),
            ("access_programador", "Puede acceder al módulo Programador"),
        ]
