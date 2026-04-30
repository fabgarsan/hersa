---
paths:
  - "backend/apps/**/models.py"
  - "backend/apps/**/views.py"
  - "backend/apps/**/serializers.py"
  - "backend/apps/**/admin.py"
  - "backend/apps/**/tests/**/*.py"
  - "backend/apps/**/tests.py"
---

# Backend Conventions — Hersa

## Base model

```python
import uuid
from django.db import models

class GraduationEvent(models.Model):
    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    event_date: models.DateField = models.DateField(db_index=True)
    is_active: models.BooleanField = models.BooleanField(default=True)  # soft-delete

    class Meta:
        verbose_name = 'Evento de graduación'
        verbose_name_plural = 'Eventos de graduación'

    def __str__(self) -> str:
        return f'{self.name} — {self.event_date}'
```

- `verbose_name` and `verbose_name_plural` in Spanish in every `Meta`.
- `__str__` always present with a domain-identifiable value.
- `is_active` for soft-delete where applicable.
- Explicit `db_index=True` on fields used in frequent filters.

## Base view

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated

class MyResourceView(APIView):
    permission_classes = [IsAuthenticated]  # always explicit, never rely on global default

    def get(self, request: Request, pk: str) -> Response:
        ...
```

- Business logic in `helpers.py` — never inside the View method.

## Base serializer

```python
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'capacity', 'is_active', 'created_at']

    def validate_capacity(self, value: int) -> int:
        if value < 1:
            raise serializers.ValidationError('Capacity must be at least 1.')
        return value
```

- `id` must always be the first field.
- Use separate serializers for read and write when they differ significantly.
- Business validations in `validate_<field>()` or `validate()`.
- Never expose sensitive fields (passwords, internal tokens, payment data).
- Never use `fields = '__all__'`.

## DRF default settings

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
}
```

## Query optimization

- `select_related()` for FK / OneToOne.
- `prefetch_related()` for ManyToMany / reverse FK.
- `only()` or `values()` when not all fields are needed.
- `exists()` instead of `count() > 0`.
- `bulk_create()` / `bulk_update()` for batch operations.
- `annotate()` and `aggregate()` for database-side computations — never in Python.
- Never call `.all()` inside loops — N+1 is a critical error.

## Testing patterns

```python
# conftest.py
import pytest
from apps.schools.tests.factories import SchoolFactory

@pytest.fixture
def school():
    return SchoolFactory()

# test_views.py
from parameterized import parameterized

class SchoolViewTests(APITestCase):
    @parameterized.expand([
        ('active',   True,  200),
        ('inactive', False, 404),
    ])
    def test_get_school_when_active_status(self, _, is_active, expected_status):
        school = SchoolFactory(is_active=is_active)
        response = self.client.get(f'/api/v1/schools/{school.id}/')
        self.assertEqual(response.status_code, expected_status)
```

- Use `factory_boy` + `Faker` — never `Model.objects.create()` directly.
- Use `parameterized` to avoid duplicating test cases.
- Reuse setup via `pytest` fixtures in `conftest.py`.
- File naming: `test_<module>.py`. Function naming: `test_<behavior>_<condition>`.
