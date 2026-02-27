# API Documentation – ReUseITESO

## Overview

This directory contains the API documentation for each module of the ReUseITESO backend. Every module exposes its endpoints through Django REST Framework and is documented using **drf-spectacular** (OpenAPI 3.0 / Swagger).

All endpoints must follow the conventions defined in [`docs_infraestructure/architecture/contracts.md`](../../docs_infraestructure/architecture/contracts.md):

- **URLs:** English, plural, trailing slash (`/api/{module}/{resource}/`)
- **Responses:** Always JSON. Collections always paginated (`count`, `next`, `previous`, `results`)
- **Prices:** String with 2 decimals (`"350.00"`)
- **IDs:** Always integer
- **Errors:** Standard format `{ "error": { "code", "message", "details" } }`
- **Auth:** JWT Bearer token (`Authorization: Bearer <token>`)

## Interactive Documentation

When the backend server is running, you can access the interactive API docs at:

| Tool | URL | Description |
|------|-----|-------------|
| **Swagger UI** | [`/api/docs/`](http://localhost:8000/api/docs/) | Interactive explorer – try endpoints directly from the browser |
| **ReDoc** | [`/api/docs/redoc/`](http://localhost:8000/api/docs/redoc/) | Clean, readable reference documentation |
| **OpenAPI Schema** (JSON) | [`/api/schema/`](http://localhost:8000/api/schema/) | Raw OpenAPI 3.0 schema (for code generators, Postman import, etc.) |

## Module Documentation

Each module has its own folder with detailed API docs:

| Module | Path | Status |
|--------|------|--------|
| **Marketplace** | [`marketplace/`](marketplace/) | ✅ Available |
| **Core** | [`core/`](core/) | 🔜 Pending — Auth, Users, Roles |
| **Gamification** | [`gamification/`](gamification/) | 🔜 Pending — Points, Badges, Rankings |

> **Note to developers:** When you implement a new module's API, create a folder under `docs/api/<module>/` and add your endpoint documentation following the same structure used in `marketplace/`.

---

## How to Add Documentation for a New Module

1. **Create the folder:**
   ```
   docs/api/<module-name>/
   ```

2. **Add a `swagger-guide.md`** describing:
   - Available endpoints (method, path, description)
   - Request/response examples
   - Query parameters, filters, pagination
   - Error responses

3. **Add `@extend_schema` decorators** to your ViewSets in the backend code (see `marketplace/views/` for examples).

4. **Register your tag** in `backend/config/settings.py` → `SPECTACULAR_SETTINGS["TAGS"]` so endpoints are grouped properly in Swagger UI.

5. **Update this README** to change the module status from 🔜 to ✅.

---

## Schema Generation

To export the OpenAPI schema as a file (useful for CI or external tools):

```bash
cd backend
python manage.py spectacular --color --file schema.yml
```

This generates a `schema.yml` that can be imported into Postman, Insomnia, or any OpenAPI-compatible tool.
