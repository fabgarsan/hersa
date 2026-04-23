# Django Conventions — Hersa

## Models

- All PKs are `UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`
- Never use auto-increment integers as PK
- Type hint on the field declaration: `id: models.UUIDField = models.UUIDField(...)`
- `verbose_name` and `verbose_name_plural` in `Meta`
- `__str__` always present with a domain-identifiable value
- Explicit indexes on fields used in frequent filters (`db_index=True` or `indexes` in Meta)
- `is_active` for soft-delete where applicable

```python
import uuid
from django.db import models

class GraduationEvent(models.Model):
    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    name: models.CharField = models.CharField(max_length=255)
    school: models.ForeignKey = models.ForeignKey(
        'schools.School', on_delete=models.CASCADE, related_name='events'
    )
    event_date: models.DateField = models.DateField(db_index=True)
    is_active: models.BooleanField = models.BooleanField(default=True)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Graduation Event'
        verbose_name_plural = 'Graduation Events'

    def __str__(self) -> str:
        return f'{self.name} — {self.event_date}'
```

## Views (CBV — always APIView)

- Never function-based views
- Permissions always explicit: `permission_classes = [IsAuthenticated]`
- Never rely on DRF global defaults without declaring them in the View
- Type hints on all methods: `def get(self, request: Request, pk: str) -> Response`
- Business logic in services or managers, not in the View

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class GraduationEventView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, pk: str) -> Response:
        ...

    def patch(self, request: Request, pk: str) -> Response:
        ...
```

## Serializers

- Always `ModelSerializer` with explicit fields — never `fields = '__all__'`
- `id` always the first field
- Use separate serializers for read and write when they differ significantly
- Business validations in `validate_<field>()` or `validate()`
- Never expose sensitive fields (passwords, internal tokens, payment data)

```python
class GraduationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraduationEvent
        fields = ['id', 'name', 'school', 'event_date', 'is_active', 'created_at']
```

## URLs

- Kebab-case URLs: `/api/v1/graduation-events/`
- Namespace per app: `app_name = 'events'`
- Version always at the root prefix: `/api/v1/`
- Use `include()` to group URLs by app

## Queries — Optimization

- `select_related()` for FK and OneToOne
- `prefetch_related()` for ManyToMany and reverse FK
- `only()` or `values()` when not all fields are needed
- `exists()` instead of `count() > 0`
- `bulk_create()` / `bulk_update()` for batch operations
- **Never queries inside loops** — N+1 is a critical error
- Use `annotate()` and `aggregate()` for database-side computations

## Settings and Environment

- Never hardcode values — always use `decouple.config('VAR_NAME')`
- Split settings: `config/settings/base.py`, `development.py`, `production.py`
- `DJANGO_SETTINGS_MODULE=config.settings.development` in `.env.local`
- Never `print()` — always `import logging; logger = logging.getLogger(__name__)`

## Migrations

- Never modify existing migrations
- Always create a new one with `makemigrations`
- Describe changes in the migration name when the intent is not obvious

## Helpers vs Utils

Every app has two files for auxiliary logic outside models, views, and serializers:

| File | Contains | Rule |
|------|----------|------|
| `helpers.py` | **Business logic** — Hersa domain rules | References a model, a business concept, or Hersa-specific logic |
| `utils.py` | **Code utilities** — generic, reusable anywhere | Could be copy-pasted to any other project unchanged |

```python
# helpers.py — knows the Hersa domain
def calculate_toga_price(student_height: int, rental_days: int) -> Decimal: ...
def get_eligible_students(event: GraduationEvent) -> QuerySet: ...
def build_package_summary(booking: Booking) -> dict: ...

# utils.py — generic, domain-agnostic
def parse_date_range(raw: str) -> tuple[date, date]: ...
def sanitize_filename(name: str) -> str: ...
def chunk_list(lst: list, size: int) -> list[list]: ...
```

- Views call helpers; helpers may call utils — never the reverse
- Neither file imports from `views.py` or `serializers.py`
- If a helper grows large, split into a `helpers/` package with modules by sub-domain

## Signals

- In a separate `signals.py` file per app
- Register in `AppConfig.ready()` of the corresponding app
