# Error Handling — Hersa

> **Agents:** django-developer, react-developer  
> **Load when:** Writing views, serializers, or React components that handle API responses  
> **Summary:** Error handling patterns for DRF views and React Query / mutations

Consistent error handling patterns for both layers. All agents must follow these conventions.

## Django — Backend

### View-level error handling

Use DRF's built-in exception handling. Never catch and swallow exceptions silently.

```python
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class GraduationEventView(APIView):
    def get(self, request: Request, pk: str) -> Response:
        try:
            event = GraduationEvent.objects.get(pk=pk, school=request.user.school)
        except GraduationEvent.DoesNotExist:
            raise NotFound(detail='Graduation event not found.')
        return Response(GraduationEventSerializer(event).data)
```

- Use DRF exception classes (`NotFound`, `ValidationError`, `PermissionDenied`, `AuthenticationFailed`) — they map to the correct HTTP codes automatically
- Never return `Response({'error': '...'}, status=400)` manually for standard cases — let the serializer's `is_valid(raise_exception=True)` do it
- Reserve `try/except` for external integrations (S3, email, payment APIs) — always log the exception before re-raising or returning a safe error response

### Logging errors

```python
import logging
logger = logging.getLogger(__name__)

try:
    send_confirmation_email(event)
except Exception as exc:
    logger.exception('Failed to send confirmation email for event %s', event.id)
    # Decide: re-raise, return 500, or degrade gracefully
```

- `logger.exception()` includes the full traceback automatically
- Never log sensitive data (tokens, passwords, PII)
- Log the resource ID, not the full object

### Serializer validation errors

```python
serializer = GraduationEventSerializer(data=request.data)
serializer.is_valid(raise_exception=True)  # returns 400 with field errors automatically
```

The DRF default handler will return:
```json
{ "field_name": ["Error message"] }
```

This is the format the frontend expects. Never override it unless adding cross-field errors in `validate()`.

## React — Frontend

### React Query error handling

```typescript
const { data, isLoading, error } = getEventsQuery();

if (isLoading) return <EventListSkeleton />;
if (error) return <ErrorAlert message="Failed to load events." />;
```

- Always handle `isLoading` and `error` states — never render data without checking them
- Use `ErrorAlert` from `src/shared/components/` for inline errors
- Use `Snackbar` + `Alert` for global/toast errors

### Axios interceptor — global 401 handling

The axios interceptor in `src/api/axiosInstance.ts` handles token refresh on 401. Never implement silent refresh logic in individual components.

```typescript
// Already handled in axiosInstance.ts:
// - 401 → attempt refresh → retry original request
// - Refresh fails → clear tokens → redirect to /login
```

### Mutation error handling

```typescript
const mutation = createEventMutation();

const handleSubmit = async (data: CreateEventInput) => {
  try {
    await mutation.mutateAsync(data);
    showSuccessSnackbar('Event created successfully.');
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 400) {
      // Map field errors from the server to RHF fields
      Object.entries(error.response.data).forEach(([field, messages]) => {
        form.setError(field as keyof CreateEventInput, {
          message: (messages as string[])[0],
        });
      });
    } else {
      showErrorSnackbar('Something went wrong. Please try again.');
    }
  }
};
```

### Error boundaries

Every top-level route must be wrapped in an `ErrorBoundary`:

```tsx
// router/index.tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Outlet />
</ErrorBoundary>
```

- `ErrorBoundary` catches render-phase errors — it does not catch async errors
- Async errors are handled by React Query's `error` state

### User-facing error messages

| Scenario | Message style |
|----------|---------------|
| 400 validation error | Inline on the field (via RHF `setError`) |
| 401 session expired | Redirect to login with a toast notification |
| 403 forbidden | Inline page message explaining the restriction |
| 404 not found | Dedicated empty-state component, not a full error page |
| 500 / network error | Toast: "Something went wrong. Please try again." |

- Never expose raw server error messages to the user
- Never show stack traces or technical details in the UI
