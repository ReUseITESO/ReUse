# Community Marketplace API Endpoints (HU-MKT-14)

**Feature:** Community-exclusive marketplace with member-only access  
**Status:** ✅ Implemented  
**Authentication:** Required (JWT Bearer token)  

---

## Overview

Community marketplace allows users to publish items scoped to specific communities with member-only access control. These endpoints extend the general marketplace functionality with community filtering and admin controls.

---

## Endpoints

### 1. List Products with Community Filtering

**Endpoint:** `GET /api/marketplace/products/`

**Description:** List marketplace products with optional community filtering. Filters by scope or specific community.

**Authentication:** Required (JWT)

**Query Parameters:**

| Parameter | Type | Value | Description |
|-----------|------|-------|-------------|
| `scope` | string | `communities` | Show items from all user's joined communities (excludes public items) |
| `community` | integer | `{id}` | Filter items from specific community ID (requires membership) |
| `page` | integer | `{num}` | Pagination page number (default: 1) |
| `search` | string | `keyword` | Search by title, description, or category |
| `category` | integer | `{id}` | Filter by category ID |
| `condition` | string | See below | Filter by condition |
| `transaction_type` | string | See below | Filter by transaction type |
| `ordering` | string | See below | Sort results |

**Condition Values:** `nuevo`, `como_nuevo`, `buen_estado`, `usado`

**Transaction Type Values:** `donation`, `sale`, `swap`

**Ordering Values:** `created_at`, `-created_at`, `price`, `-price`, `title`, `-title`, `-likes_count`

#### Example Requests

```bash
# List items from all joined communities
GET /api/marketplace/products/?scope=communities

# List items from specific community (user must be member)
GET /api/marketplace/products/?community=1

# Combine filters
GET /api/marketplace/products/?scope=communities&search=books&category=2

# Public items only (default, no scope or community parameter)
GET /api/marketplace/products/
```

#### Success Response (200 OK)

```json
{
  "count": 15,
  "next": "http://localhost:8000/api/marketplace/products/?scope=communities&page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Programming Book",
      "description": "Learn Django",
      "price": "150.00",
      "condition": "buen_estado",
      "transaction_type": "sale",
      "status": "disponible",
      "created_at": "2026-04-10T12:30:00Z",
      "seller": {
        "id": 5,
        "email": "user@iteso.mx",
        "first_name": "John"
      },
      "category": {
        "id": 2,
        "name": "Libros"
      },
      "community": {
        "id": 1,
        "name": "Programming Community"
      },
      "images": []
    }
  ]
}
```

#### Error Responses

**401 Unauthorized** (unauthenticated)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden** (non-member accessing community items)
```json
{
  "detail": "You must be a member of this community to view its marketplace items."
}
```

**404 Not Found** (community doesn't exist)
```json
{
  "detail": "Not found."
}
```

---

### 2. List Community Marketplace Items

**Endpoint:** `GET /api/social/communities/{id}/products/`

**Description:** Get all marketplace items published in a specific community. Only members can access.

**Authentication:** Required (JWT)

**Parameters:**

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `id` | integer | URL path | Community ID |
| `page` | integer | Query | Pagination page number (default: 1) |

#### Example Requests

```bash
# Get items from community 1
GET /api/social/communities/1/products/

# Paginate
GET /api/social/communities/1/products/?page=2
```

#### Success Response (200 OK)

```json
{
  "count": 5,
  "pages": 1,
  "current_page": 1,
  "results": [
    {
      "id": 1,
      "title": "Community Item 1",
      "description": "Published in community",
      "price": "100.00",
      "condition": "buen_estado",
      "transaction_type": "sale",
      "status": "disponible",
      "created_at": "2026-04-10T10:00:00Z",
      "seller": {
        "id": 5,
        "email": "user@iteso.mx",
        "first_name": "John"
      },
      "category": {
        "id": 2,
        "name": "Libros"
      },
      "images": []
    }
  ]
}
```

#### Error Responses

**401 Unauthorized** (unauthenticated)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden** (non-member)
```json
{
  "detail": "You must be a member of this community to view its marketplace items."
}
```

**404 Not Found** (community doesn't exist)
```json
{
  "detail": "Not found."
}
```

---

### 3. Admin Remove Product from Community

**Endpoint:** `DELETE /api/social/communities/{id}/products/{product_id}/`

**Description:** Community admin/moderator can remove a product from the community marketplace.

**Authentication:** Required (JWT)  
**Role Required:** Community admin or moderator

**Parameters:**

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `id` | integer | URL path | Community ID |
| `product_id` | integer | URL path | Product ID to remove |

#### Example Request

```bash
# Remove product 42 from community 1
DELETE /api/social/communities/1/products/42/
```

#### Success Response (204 No Content)

```
(Empty response body)
```

#### Error Responses

**401 Unauthorized** (unauthenticated)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden** (not admin/moderator)
```json
{
  "detail": "Only community admins or moderators can remove items."
}
```

**404 Not Found** (product not in community or doesn't exist)
```json
{
  "detail": "Product not found in this community."
}
```

---

### 4. List User's Joined Communities

**Endpoint:** `GET /api/social/communities/?scope=joined`

**Description:** Get all communities that the authenticated user is a member of.

**Authentication:** Required (JWT)

**Query Parameters:**

| Parameter | Type | Value | Description |
|-----------|------|-------|-------------|
| `scope` | string | `joined` | Filter to only user's joined communities |
| `page` | integer | `{num}` | Pagination page number (default: 1) |
| `search` | string | `keyword` | Search by community name or description |
| `ordering` | string | See below | Sort results |

**Ordering Values:** `created_at`, `-created_at`, `name`, `-name`

#### Example Requests

```bash
# Get all joined communities
GET /api/social/communities/?scope=joined

# Search within joined communities
GET /api/social/communities/?scope=joined&search=programming

# Paginate
GET /api/social/communities/?scope=joined&page=2
```

#### Success Response (200 OK)

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Programming Community",
      "description": "For developers",
      "creator": {
        "id": 2,
        "email": "admin@iteso.mx",
        "first_name": "Admin"
      },
      "created_at": "2026-03-01T10:00:00Z",
      "is_private": false,
      "member_count": 15,
      "my_role": "admin"
    },
    {
      "id": 2,
      "name": "Book Club",
      "description": "Share your favorite books",
      "creator": {
        "id": 3,
        "email": "creator@iteso.mx",
        "first_name": "Jane"
      },
      "created_at": "2026-02-15T08:30:00Z",
      "is_private": false,
      "member_count": 8,
      "my_role": "member"
    }
  ]
}
```

#### Error Responses

**401 Unauthorized** (unauthenticated)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## Publishing Items to Communities

**Endpoint:** `POST /api/marketplace/products/`

**Modified Request Format:** Now accepts optional `community` parameter

**Request Body:**

```json
{
  "title": "Programming Book",
  "description": "Learn Django REST Framework",
  "category": 2,
  "condition": "buen_estado",
  "transaction_type": "sale",
  "price": "150.00",
  "community": 1,
  "images": []
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Product title |
| `description` | string | Yes | Product description |
| `category` | integer | Yes | Category ID |
| `condition` | string | Yes | Condition: `nuevo`, `como_nuevo`, `buen_estado`, `usado` |
| `transaction_type` | string | Yes | Type: `donation`, `sale`, `swap` |
| `price` | string | No* | Price (required if `transaction_type` is `sale`) |
| `community` | integer | No | Community ID (requires membership) |
| `images` | array | No | Array of image objects |

#### Validation Rules

- ✅ If `community` is provided, user must be a member (returns 403 if not)
- ✅ If `community` is null/omitted, item is published to general marketplace
- ✅ User must be authenticated (returns 401 if not)

#### Success Response (201 Created)

```json
{
  "id": 123,
  "title": "Programming Book",
  "description": "Learn Django REST Framework",
  "status": "disponible",
  "created_at": "2026-04-10T12:30:00Z",
  "seller": {
    "id": 5,
    "email": "user@iteso.mx"
  },
  "category": {
    "id": 2,
    "name": "Libros"
  },
  "community": {
    "id": 1,
    "name": "Programming Community"
  }
}
```

#### Error Responses

**401 Unauthorized** (unauthenticated)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden** (not member of specified community)
```json
{
  "detail": "You must be a member of the community to publish items there."
}
```

**400 Bad Request** (invalid data)
```json
{
  "title": ["This field may not be blank."],
  "category": ["Invalid pk \"999\" - object does not exist."]
}
```

---

## Permission Rules

### Viewing Community Items

| User Type | Can View |
|-----------|----------|
| **Community member (any role)** | ✅ Yes |
| **Community non-member** | ❌ No (403 Forbidden) |
| **Unauthenticated** | ❌ No (401 Unauthorized) |

### Publishing to Community

| User Type | Can Publish |
|-----------|------------|
| **Community member** | ✅ Yes |
| **Community non-member** | ❌ No (403 Forbidden) |
| **Unauthenticated** | ❌ No (401 Unauthorized) |

### Removing Items from Community

| User Type | Can Remove |
|-----------|-----------|
| **Community admin/moderator** | ✅ Yes |
| **Community member (regular)** | ❌ No (403 Forbidden) |
| **Community non-member** | ❌ No (403 Forbidden) |
| **Unauthenticated** | ❌ No (401 Unauthorized) |

---

## Authentication

All community marketplace endpoints require **JWT Bearer token** authentication:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     http://localhost:8000/api/marketplace/products/?scope=communities
```

**Token Lifetime:**
- Access token: 30 minutes
- Refresh token: 7 days

---

## Rate Limiting

Community marketplace endpoints follow standard ReUse API rate limiting:
- Authenticated users: 1000 requests/hour
- Search queries: 100 requests/hour

---

## Related Documentation

- [Testing Guide](../../testing/community-marketplace-testing.md) - Comprehensive test suite
- [Marketplace Guide](marketplace-guide.md) - General marketplace documentation
- [Architecture](../../../architecture/Architecture%20overview.md) - System design
