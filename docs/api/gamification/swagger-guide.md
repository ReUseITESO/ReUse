# Gamification API – Swagger Documentation

> **Status:** Pending implementation

This folder will contain the API documentation for the **Gamification** module once its endpoints are implemented.

## Planned Endpoints (examples - not oficial)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gamification/points/` | Get the authenticated user's points |
| `GET` | `/api/gamification/badges/` | List all available badges |
| `GET` | `/api/gamification/badges/me/` | List badges earned by the authenticated user |
| `GET` | `/api/gamification/rankings/` | Get the leaderboard / rankings |

## How to Document

When implementing Gamification endpoints:

1. Add `@extend_schema` decorators to your ViewSets (see `marketplace/views/` for reference).
2. Register Gamification tags in `backend/config/settings.py` → `SPECTACULAR_SETTINGS["TAGS"]` — the entries are already commented out, just uncomment them.
3. Write the full endpoint documentation in this folder as `swagger-guide.md`.
4. Update [`docs/api/README.md`](../README.md) to mark Gamification as Available.
