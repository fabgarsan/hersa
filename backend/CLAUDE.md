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

## Skills — load on demand

| When you are... | Load |
|-----------------|------|
| Creating models, views, serializers, or scaffolding a new app | `.claude/skills/backend-conventions.md` |
| Implementing or reviewing any API endpoint | `.claude/skills/api-contract.md` |
| Writing views or serializers that handle errors | `.claude/skills/error-handling.md` |
| Touching auth or sensitive data | `.claude/skills/security-checklist.md` |

## Internal structure

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

## Naming conventions

| Element      | Convention           | Example                             |
|--------------|----------------------|-------------------------------------|
| Models       | `PascalCase`         | `BookingRequest`, `UserProfile`     |
| Vars / fns   | `snake_case`         | `get_active_rooms`, `user_id`       |
| Serializers  | `<Model>Serializer`  | `RoomSerializer`                    |
| Views        | `<Resource>View`     | `RoomView`, `BookingListView`       |
| URL patterns | `kebab-case`         | `/api/booking-requests/`            |

## Mandatory rules

- **Django Admin UI must be in Spanish**: `verbose_name`, `verbose_name_plural`, `fieldsets` labels, `list_display` headers, `short_description`, and any other user-visible Admin string must be written in Spanish.
- Always use **CBV** — never function-based views.
- All PKs must be **UUID4** — never auto-increment integers.
- **Type hints** on all functions, methods, and variables.
- Default permission: `IsAuthenticated`. Only override to `AllowAny` explicitly on public endpoints.
- Never use `fields = '__all__'` in serializers — always list fields explicitly.
- Always include `id` as the first field in every serializer.
- Never `print()` — always `import logging; logger = logging.getLogger(__name__)`.
- Never hardcode secrets — always `decouple.config('VAR')`.

## Helpers vs utils

Every app has two files for auxiliary logic. The distinction is mandatory:

| File | Contains | Rule |
|------|----------|------|
| `helpers.py` | **Business logic** — Hersa domain rules | References a model, a business concept, or Hersa-specific logic |
| `utils.py` | **Code utilities** — generic, reusable anywhere | Could be copy-pasted to another project unchanged |

- Views call helpers; helpers may call utils — never the reverse.
- Neither file should import from `views.py` or `serializers.py`.

## API contract

URL conventions, base paths per domain resource, HTTP response codes, pagination, and response/error shapes are defined in `.claude/skills/api-contract.md` (shared between backend and frontend). Django-side specifics:

- Namespace per app: `app_name = 'events'` in each `urls.py`.
- Use `include()` to group URLs by app in the root `urls.py`.

## Settings & environment variables

- `DJANGO_SETTINGS_MODULE=config.settings.development` in `.env.local`.
- `DJANGO_SETTINGS_MODULE=config.settings.production` in EB environment properties.

| File               | Purpose                                     |
|--------------------|---------------------------------------------|
| `.env.local`       | Local development overrides                 |
| `.env.production`  | Production values (never commit)            |
| `.env.example`     | Committed template with all keys, no values |

## Migrations

- Never modify an existing migration — always create a new one with `makemigrations`.
- Describe the intent in the migration name when it is not obvious from the auto-generated name.
- Always create `migrations/__init__.py` when scaffolding a new app — `makemigrations` fails without it.

## Signals

- Defined in a dedicated `signals.py` file per app.
- Registered in `AppConfig.ready()` of the corresponding app — never at module level.

## Development commands

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
