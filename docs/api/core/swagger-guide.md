# Core API – Swagger Documentation

> **Status:** Pending implementation

This folder will contain the API documentation for the **Core** module once its endpoints are implemented.

## Planned Endpoints - (examples - not official)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Register a new user with `@iteso.mx` email |
| `POST` | `/api/auth/login/` | Login – returns JWT access and refresh tokens |
| `POST` | `/api/auth/refresh/` | Refresh an expired access token |
| `GET` | `/api/users/me/` | Get the authenticated user's profile |
| `PATCH` | `/api/users/me/` | Update the authenticated user's profile |
| `GET` | `/api/users/{id}/` | Get a user's public profile |

## How to Document

When implementing Core endpoints:

1. Add `@extend_schema` decorators to your ViewSets (see `marketplace/views/` for reference).
2. Register Core tags in `backend/config/settings.py` → `SPECTACULAR_SETTINGS["TAGS"]` — the entries are already commented out, just uncomment them.
3. Write the full endpoint documentation in this folder as `swagger-guide.md`.
4. Update [`docs/api/README.md`](../README.md) to mark Core as Available.
