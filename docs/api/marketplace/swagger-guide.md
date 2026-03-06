# Marketplace API – Swagger Documentation

**Module:** Marketplace  
**Base path:** `/api/marketplace/`  
**Version:** 1.0  

> All endpoints in this document follow the conventions defined in the **Contratos entre Capas** document. Any future changes to response structure, error format, or authentication must be reflected here and approved per contract rules.

---

## Interactive Docs

When the backend is running, open the Swagger UI to explore these endpoints interactively:

- **Swagger UI:** [api/docs/](http://localhost:8000/api/docs/)
- **ReDoc:** [api/docs/redoc/](http://localhost:8000/api/docs/redoc/)

Filter by tag **"Marketplace > Products"** or **"Marketplace > Categories"** in the Swagger UI to see only marketplace endpoints.

---

## Authentication

These endpoints are **public** (no token required). They are listed as public in the contract:

> _"Endpoints públicos (no requieren token): registro, login, listado de productos, detalle de producto, categorías"_
[contracts.md](https://github.com/ReUseITESO/infrastucture/blob/Documentation/docs/architecture/contracts.md)

For endpoints that require authentication (future CRUD operations), the API uses **JWT** (JSON Web Token):

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

| Token | Duration | Description |
|-------|----------|-------------|
| Access token | 30 min | Short-lived, sent in every request |
| Refresh token | 7 days | Used to obtain a new access token |

---

## Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/marketplace/products/` | List all available products (paginated) |
| `GET` | `/api/marketplace/products/{id}/` | Retrieve a single product by ID |

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | `integer` | Filter by category ID |
| `condition` | `string` | Filter by condition: `nuevo`, `como_nuevo`, `buen_estado`, `usado` |
| `transaction_type` | `string` | Filter by type: `donation`, `sale`, `swap` |
| `search` | `string` | Search in title, description, and category name |
| `ordering` | `string` | Sort field. Prefix `-` for descending: `created_at`, `-created_at`, `price`, `-price`, `title`, `-title` |
| `page` | `integer` | Page number (default page size: 20) |

#### Example Request

```
GET /api/marketplace/products/?category=1&condition=usado&ordering=-price&page=1
```

#### Example Response — List `200 OK`

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 4,
      "title": "Química Orgánica - McMurry",
      "description": "Libro de Química Orgánica de John McMurry, 9na edición. Con subrayados pero legible.",
      "condition": "usado",
      "transaction_type": "donation",
      "status": "disponible",
      "price": null,
      "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
      "category": {
        "id": 1,
        "name": "Libros",
        "icon": "book"
      },
      "seller_name": "María García Pérez",
      "created_at": "2026-02-06T03:15:00-06:00"
    }
  ]
}
```

#### Example Response — Detail `200 OK`

```json
{
  "id": 4,
  "title": "Química Orgánica - McMurry",
  "description": "Libro de Química Orgánica de John McMurry, 9na edición. Con subrayados pero legible.",
  "condition": "usado",
  "transaction_type": "donation",
  "status": "disponible",
  "price": null,
  "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
  "category": {
    "id": 1,
    "name": "Libros",
    "icon": "book"
  },
  "seller_name": "María García Pérez",
  "seller_email": "maria.garcia@iteso.mx",
  "images": [
    {
      "id": 1,
      "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
      "order_number": 0
    },
    {
      "id": 2,
      "image_url": "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500",
      "order_number": 1
    }
  ],
  "created_at": "2026-02-06T03:15:00-06:00"
}
```

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/marketplace/categories/` | List all categories (paginated) |
| `GET` | `/api/marketplace/categories/{id}/` | Retrieve a single category by ID |

#### Example Request

```
GET /api/marketplace/categories/
```

#### Example Response — List `200 OK`

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Books",
      "icon": "📚"
    },
    {
      "id": 2,
      "name": "Electronics",
      "icon": "💻"
    },
    {
      "id": 3,
      "name": "Clothing",
      "icon": "👕"
    }
  ]
}
```

#### Example Response — Detail `200 OK`

```json
{
  "id": 1,
  "name": "Books",
  "icon": "📚"
}
```

---

## Data Models

### Product

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `id` | `integer` | Unique identifier | |
| `title` | `string` | Product title (max 255 chars) | |
| `description` | `string` | Full text description | |
| `condition` | `string` | One of: `nuevo`, `como_nuevo`, `buen_estado`, `usado` | |
| `transaction_type` | `string` | One of: `donation`, `sale`, `swap` | |
| `status` | `string` | One of: `disponible`, `en_proceso`, `completado`, `cancelado` | |
| `price` | `string` | Price with 2 decimals (e.g. `"350.00"`). `null` for donations | |
| `image_url` | `string` | URL to product image. `null` if not provided | List endpoint only |
| `category` | `object` | Nested category (`id` + basic fields) | |
| `seller_name` | `string` | Seller display name | |
| `seller_email` | `string` | Seller email address | Detail endpoint only |
| `images` | `array` | Array of product images with order | Detail endpoint only |
| `created_at` | `string` | ISO 8601 datetime in UTC (e.g. `"2026-02-18T20:30:00Z"`) | |

### Category

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Unique identifier |
| `name` | `string` | Category name (max 100 chars) |
| `icon` | `string` | Icon or emoji. `null` if not provided |

### ProductImage

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Unique identifier |
| `image_url` | `string` | URL to the image |
| `order_number` | `integer` | Display order (0-indexed). Used to sort images in galleries |

---

## Pagination

All list endpoints return paginated responses (contract rule: **collections always paginated, 20 items per page**):

```json
{
  "count": 42,
  "next": "/api/marketplace/products/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `count` | `integer` | Total number of items across all pages |
| `next` | `string \| null` | Relative URL to the next page (`null` if last page) |
| `previous` | `string \| null` | Relative URL to the previous page (`null` if first page) |
| `results` | `array` | Array of items for the current page |

Default page size: **20 items**.

---

## Error Responses

All errors follow the standard error format defined in the contract:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of what went wrong.",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Meaning | When used |
|------|---------|-----------|
| `200` | OK | Successful GET request |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation failed, invalid data |
| `401` | Unauthorized | Missing or expired token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | State conflict (e.g. product already sold) |
| `500` | Internal Server Error | Unexpected server error |

### Internal Error Codes

| `code` field | Meaning |
|-------------|---------|
| `VALIDATION_ERROR` | Invalid or missing fields |
| `AUTHENTICATION_ERROR` | Problem with the JWT token |
| `PERMISSION_DENIED` | Authenticated but not authorized |
| `NOT_FOUND` | Resource not found |
| `STATE_CONFLICT` | Invalid state transition |
| `SERVER_ERROR` | Unexpected internal error |

### Example Error — `404 Not Found`

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Not found.",
    "details": {}
  }
}
```

### Example Error — `400 Validation Error`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {
      "title": ["This field is required."],
      "price": ["Price must be greater than 0."]
    }
  }
}
```

---

## Contract Conventions Summary

These endpoints comply with the following contract rules:

| Rule | Implementation |
|------|---------------|
| URL structure | `/api/{module}/{resource}/` — English, plural, trailing slash |
| HTTP verbs | `GET` only (read-only ViewSets) — verbs define action, not the URL |
| Response format | JSON always. Collections paginated (`count`, `next`, `previous`, `results`) |
| Dates | ISO 8601 with UTC timezone: `2026-02-18T20:30:00Z` |
| Prices | String with 2 decimals: `"350.00"` |
| IDs | Always integer |
| Related objects | Nested objects with `id` + basic fields |
| Error format | `{ "error": { "code", "message", "details" } }` |
| Auth | JWT Bearer token (these endpoints are public, no token required) |
| Versioning | No versioning in MVP — base URL is `/api/` directly |
