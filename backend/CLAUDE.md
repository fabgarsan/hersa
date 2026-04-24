# backend/

Django REST API. Loaded only when Claude works on files inside this directory.

## Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Framework  | Django (latest stable) + Django REST Framework   |
| Auth       | SimpleJWT                                        |
| Database   | PostgreSQL (AWS RDS) + psycopg2-binary           |
| Deployment | AWS Elastic Beanstalk + Gunicorn                 |
| Deps       | Pipenv (Pipfile + Pipfile.lock in this folder)   |
| Config     | python-decouple                                  |
| Testing    | pytest, pytest-django, factory_boy, Faker, parameterized |
| Linting    | ruff, mypy                                       |

## Internal Structure

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py / wsgi.py / asgi.py
├── apps/                  # one folder per business domain
│   └── <app>/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── helpers.py     # business logic (domain-specific): calculate_toga_price(), get_eligible_students()
│       ├── utils.py       # code utilities (generic): parse_date_range(), format_uuid()
│       └── tests/
├── tests/
│   ├── unit/              # pure logic — no DB or HTTP
│   └── integration/       # views, serializers, DB queries
├── .ebextensions/         # Elastic Beanstalk hooks
├── .platform/             # nginx config for EB
├── Pipfile
└── manage.py
```

## Naming Conventions

| Element      | Convention           | Example                             |
|--------------|----------------------|-------------------------------------|
| Models       | `PascalCase`         | `BookingRequest`, `UserProfile`     |
| Vars / fns   | `snake_case`         | `get_active_rooms`, `user_id`       |
| Serializers  | `<Model>Serializer`  | `RoomSerializer`                    |
| Views        | `<Resource>View`     | `RoomView`, `BookingListView`       |
| URL patterns | `kebab-case`         | `/api/booking-requests/`            |

## Mandatory Rules

- **Django Admin UI must be in Spanish**: `verbose_name`, `verbose_name_plural`, `fieldsets` labels, `list_display` headers, `short_description`, and any other user-visible Admin string must be written in Spanish. The end users speak Spanish.
- Always use **CBV** — never function-based views.
- All PKs must be **UUID4** — never auto-increment integers.
- **Type hints** on all functions, methods, and variables.
- Default permission: `IsAuthenticated`. Only override to `AllowAny` explicitly on public endpoints.
- Never use `fields = '__all__'` in serializers — always list fields explicitly.
- Always include `id` as the first field in every serializer.

## Helpers vs Utils

Every app has two files for auxiliary logic. The distinction is mandatory:

| File | Contains | Rule |
|------|----------|------|
| `helpers.py` | **Business logic** — Hersa domain rules | If it references a model, a business concept, or Hersa-specific logic, it goes here |
| `utils.py` | **Code utilities** — generic, reusable anywhere | If it could be copy-pasted to another project unchanged, it goes here |

```python
# helpers.py — knows about the Hersa domain
def calculate_toga_price(student_height: int, rental_days: int) -> Decimal: ...
def get_eligible_students(event: GraduationEvent) -> QuerySet: ...
def build_package_summary(booking: Booking) -> dict: ...

# utils.py — generic, domain-agnostic
def parse_date_range(raw: str) -> tuple[date, date]: ...
def sanitize_filename(name: str) -> str: ...
def chunk_list(lst: list, size: int) -> list[list]: ...
```

- Views call helpers; helpers may call utils — never the reverse
- Neither file should import from `views.py` or `serializers.py`

## Code Patterns

### Base Model

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

- `verbose_name` and `verbose_name_plural` in every `Meta`
- `__str__` always present with a domain-identifiable value
- `is_active` for soft-delete where applicable
- Explicit `db_index=True` on fields used in frequent filters

### Base View

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

- Business logic in `helpers.py` — never inside the View method

### Base Serializer

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

- Use separate serializers for read and write when they differ significantly
- Business validations in `validate_<field>()` or `validate()`
- Never expose sensitive fields (passwords, internal tokens, payment data)

### DRF Default Settings

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
}
```

## Query Optimization

- `select_related()` for FK / OneToOne.
- `prefetch_related()` for ManyToMany / reverse FK.
- `only()` or `values()` when not all fields are needed.
- `exists()` instead of `count() > 0`.
- `bulk_create()` / `bulk_update()` for batch operations.
- `annotate()` and `aggregate()` for database-side computations — never in Python.
- Never call `.all()` inside loops — N+1 is a critical error.

## Testing

- Use `factory_boy` + `Faker` — never use `Model.objects.create()` directly in tests.
- Use `parameterized` to avoid duplicating test cases with different inputs.
- Reuse setup logic via `pytest` fixtures in `conftest.py`.
- File naming: `test_<module>.py`. Function naming: `test_<behavior>_<condition>`.

## API contract

URL conventions, base paths per domain resource, HTTP response codes, pagination, and response/error shapes are defined in `.claude/skills/api-contract.md` (shared between backend and frontend). Django-side specifics only:

- Namespace per app: `app_name = 'events'` in each `urls.py`
- Use `include()` to group URLs by app in the root `urls.py`

## Settings & Environment Variables

- `DJANGO_SETTINGS_MODULE=config.settings.development` in `.env.local`.
- `DJANGO_SETTINGS_MODULE=config.settings.production` in EB environment properties.
- Always use `decouple.config('VAR')` — never hardcode secrets.
- Never `print()` — always `import logging; logger = logging.getLogger(__name__)`.

| File               | Purpose                                     |
|--------------------|---------------------------------------------|
| `.env.local`       | Local development overrides                 |
| `.env.production`  | Production values (never commit)            |
| `.env.example`     | Committed template with all keys, no values |

## Migrations

- Never modify an existing migration — always create a new one with `makemigrations`.
- Describe the intent in the migration name when it is not obvious from the auto-generated name.

## Signals

- Defined in a dedicated `signals.py` file per app.
- Registered in `AppConfig.ready()` of the corresponding app — never at module level.

## Development Commands

```bash
# Always run inside the container
docker compose exec backend pipenv run python manage.py <cmd>
docker compose exec backend pipenv run python manage.py makemigrations
docker compose exec backend pipenv run python manage.py migrate
docker compose exec backend pipenv run pytest
docker compose exec backend pipenv run pytest apps/users/tests/

# Install a new dependency (run on HOST inside backend/)
pipenv install <package>
docker compose build backend   # rebuild image after Pipfile changes
```

## Elastic Beanstalk

- Entry point: `config.wsgi:application`.
- The `Dockerfile` in this folder is the one EB uses.
- Migrations on deploy: configure in `.ebextensions/db-migrate.config`.

## ✅ Do / ❌ Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Class-Based Views | Function-based views |
| UUID4 for all PKs | Auto-increment integer IDs |
| Type hints everywhere | Untyped functions |
| Optimize queries eagerly | Leave N+1 queries in place |
| `ModelSerializer` with explicit fields | `fields = '__all__'` |
| `id` first in serializer fields | Omit `id` from serializer |
| Default permission `IsAuthenticated` | Default `AllowAny` |
| `factory_boy` + `Faker` in tests | `Model.objects.create()` directly |
| Separate unit and integration tests | Mix them together |
| Secrets only in `.env` files | Hardcode or commit secrets |
| Django Admin strings in Spanish | Admin labels, `verbose_name`, `short_description` in English |
