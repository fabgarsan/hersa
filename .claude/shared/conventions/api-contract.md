# API Contract — Hersa

> **Agents:** django-developer, react-developer, tdd-writer  
> **Load when:** Implementing or reviewing any API endpoint  
> **Summary:** Shared API contract — base URL, response format, casing, HTTP codes, domain resources

Shared contract between the Django backend and the React frontend. Any deviation must be agreed upon and reflected here.

## Base URL

```
/api/v1/
```

Always versioned. Never endpoints without the `/api/v1/` prefix.

## Authentication

- JWT with `accessToken` (15 min) and `refreshToken` (7 days)
- Access token in header: `Authorization: Bearer <token>`
- Tokens stored in `localStorage` (existing project decision)
- Provider: SimpleJWT
- Endpoints:
  - `POST /api/v1/auth/token/` — obtain token pair
  - `POST /api/v1/auth/token/refresh/` — renew access token using refresh token
  - `POST /api/v1/auth/token/verify/` — verify token validity

## Successful response format

```json
{
  "data": { ... }
}
```

For paginated lists:
```json
{
  "count": 100,
  "next": "http://api/v1/resource/?page=3",
  "previous": "http://api/v1/resource/?page=1",
  "results": [ ... ]
}
```

## Error response format

```json
{
  "detail": "Human-readable error description"
}
```

For validation errors (400):
```json
{
  "field_name": ["Error on this field"],
  "other_field": ["This field is required"]
}
```

## Casing transformation

- **Backend** produces and consumes `snake_case`
- **Frontend** works in `camelCase`
- The Axios interceptor converts automatically in both directions
- Never perform the conversion manually in components or serializers

## Endpoint conventions

- Resources in plural: `/api/v1/graduation-events/`, `/api/v1/schools/`
- Kebab-case in URLs: `/api/v1/toga-rentals/`
- Non-CRUD actions as sub-resources: `POST /api/v1/events/{id}/confirm/`
- Filters as query params: `?school=<uuid>&status=active&ordering=-event_date`
- Search: `?search=term`
- UUID in all path params: `/api/v1/events/{uuid}/`

## HTTP response codes

| Code | When to use |
|------|-------------|
| 200 | Success with data (GET, PATCH, PUT) |
| 201 | Successful creation (POST) |
| 204 | Success without data (DELETE) |
| 400 | Validation error |
| 401 | Unauthenticated (token missing or expired) |
| 403 | Unauthorized (no permission for the resource) |
| 404 | Resource not found |
| 500 | Internal server error |

## Pagination

- `PageNumberPagination` with `page_size=20`
- Query params: `?page=2&page_size=50`
- The frontend uses `next` for infinite scroll or `count` for classic pagination

## Business domain resources

| Resource | Base URL |
|----------|----------|
| Schools / Institutions | `/api/v1/schools/` |
| Graduation events | `/api/v1/graduation-events/` |
| Academic gown rentals | `/api/v1/toga-rentals/` |
| Auditorium bookings | `/api/v1/auditorium-bookings/` |
| Photography packages | `/api/v1/photo-packages/` |
| Users | `/api/v1/users/` |
| Auth | `/api/v1/auth/` |
