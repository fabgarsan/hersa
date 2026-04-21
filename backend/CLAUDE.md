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
│       └── tests/
├── tests/
│   ├── unit/              # pure logic — no DB or HTTP
│   └── integration/       # views, serializers, DB queries
├── .ebextensions/         # Elastic Beanstalk hooks
├── .platform/             # nginx config for EB
├── Pipfile
└── manage.py
```

## Mandatory Rules

- Always use **CBV** — never function-based views.
- All PKs must be **UUID4** — never auto-increment integers.
- **Type hints** on all functions, methods, and variables.
- Default permission: `IsAuthenticated`. Only override to `AllowAny` explicitly on public endpoints.
- Never use `fields = '__all__'` in serializers — always list fields explicitly.
- Always include `id` as the first field in every serializer.

## Code Patterns

### Base Model

```python
import uuid
from django.db import models

class MyModel(models.Model):
    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
```

### Base View

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request

class MyResourceView(APIView):
    def get(self, request: Request, pk: str) -> Response:
        ...
```

### Base Serializer

```python
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'capacity', 'is_active', 'created_at']
```

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
- Never call `.all()` inside loops.

## Testing

- Use `factory_boy` + `Faker` — never use `Model.objects.create()` directly in tests.
- Use `parameterized` to avoid duplicating test cases with different inputs.
- Reuse setup logic via `pytest` fixtures in `conftest.py`.
- File naming: `test_<module>.py`. Function naming: `test_<behavior>_<condition>`.

## Settings & Environment Variables

- `DJANGO_SETTINGS_MODULE=config.settings.development` in `.env.local`.
- `DJANGO_SETTINGS_MODULE=config.settings.production` in EB environment properties.
- Always use `decouple.config('VAR')` — never hardcode secrets.

| File               | Purpose                                     |
|--------------------|---------------------------------------------|
| `.env.local`       | Local development overrides                 |
| `.env.production`  | Production values (never commit)            |
| `.env.example`     | Committed template with all keys, no values |

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
