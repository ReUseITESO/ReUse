# Contratos entre Capas – ReUseITESO

## Propósito

Este documento define las reglas y convenciones que rigen la comunicación entre las capas del sistema: **Backend (API)**, **Frontend (SPA)** y **Base de Datos**. Todo el equipo debe respetar estos contratos para mantener coherencia y evitar fricción entre quienes trabajan en distintas partes del sistema.

---

## 1. Contratos del Backend (API REST)

### 1.1 Convenciones de Endpoints

**Base URL:** `/api/`

**Estructura de URLs:**
```
/api/{módulo}/{recurso}/              → colección
/api/{módulo}/{recurso}/{id}/         → recurso individual
/api/{módulo}/{recurso}/{id}/{acción}/ → acción específica
```

**Ejemplos:**
```
GET    /api/products/                  → listar productos
POST   /api/products/                  → crear producto
GET    /api/products/15/               → detalle producto 15
PATCH  /api/products/15/               → editar producto 15
DELETE /api/products/15/               → eliminar producto 15
PATCH  /api/products/15/status/        → cambiar estado
GET    /api/gamification/ranking/      → ranking global
```

**Reglas:**
- URLs siempre en **inglés** y **plural** (products, transactions, messages)
- Siempre terminan con `/` (trailing slash, convención Django)
- Usar `kebab-case` si el recurso tiene más de una palabra: `/api/gamification/point-transactions/`
- No anidar más de 2 niveles: `/api/products/{id}/images/` es el máximo
- Verbos HTTP definen la acción, no la URL (no hacer `/api/products/create/`)

### 1.2 Métodos HTTP

| Método | Uso | Idempotente |
|--------|-----|-------------|
| GET | Obtener recursos (sin efectos secundarios) | Sí |
| POST | Crear recursos nuevos | No |
| PATCH | Actualizar parcialmente un recurso | Sí |
| DELETE | Eliminar un recurso | Sí |

> No se usa PUT. Todas las actualizaciones son parciales con PATCH.

### 1.3 Formato de Respuestas Exitosas

**Recurso individual:**
```json
{
  "id": 1,
  "title": "MacBook Air 2020",
  "price": "8500.00",
  "status": "published",
  "seller": {
    "id": 12,
    "name": "Juan Pérez"
  },
  "created_at": "2025-02-10T14:30:00Z",
  "updated_at": "2025-02-10T14:30:00Z"
}
```

**Colección (con paginación):**
```json
{
  "count": 45,
  "next": "/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "MacBook Air 2020",
      "price": "8500.00",
      "status": "published"
    }
  ]
}
```

**Reglas de respuestas:**
- Siempre JSON
- Fechas en formato **ISO 8601** con timezone UTC: `2025-02-10T14:30:00Z`
- Precios como **string** con 2 decimales: `"8500.00"` (evita problemas de precisión float)
- IDs siempre como **integer**
- Colecciones siempre paginadas (por defecto 20 elementos por página)
- Objetos relacionados se incluyen como objetos anidados simples (id + campos básicos), no como IDs sueltos

### 1.4 Formato de Errores

Todas las respuestas de error siguen la misma estructura:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No se pudo crear el producto.",
    "details": {
      "title": ["Este campo es requerido."],
      "price": ["El precio debe ser mayor a 0."]
    }
  }
}
```

**Códigos HTTP usados:**

| Código | Significado | Cuándo se usa |
|--------|------------|---------------|
| 200 | OK | GET exitoso, PATCH exitoso |
| 201 | Created | POST exitoso |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Validación fallida, datos inválidos |
| 401 | Unauthorized | Token ausente o expirado |
| 403 | Forbidden | Token válido pero sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto de estado (ej. producto ya vendido) |
| 500 | Internal Server Error | Error inesperado del servidor |

**Códigos de error internos** (campo `code`):

| Código interno | Significado |
|---------------|-------------|
| `VALIDATION_ERROR` | Campos inválidos o faltantes |
| `AUTHENTICATION_ERROR` | Problema con el token |
| `PERMISSION_DENIED` | Sin permisos para esta acción |
| `NOT_FOUND` | Recurso no encontrado |
| `STATE_CONFLICT` | Transición de estado inválida |
| `SERVER_ERROR` | Error interno inesperado |

### 1.5 Autenticación

- Se usa **JWT** (JSON Web Token) via `djangorestframework-simplejwt`
- El frontend envía el token en el header `Authorization`:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  ```
- **Access token:** duración corta (30 minutos)
- **Refresh token:** duración larga (7 días)
- Endpoints públicos (no requieren token): registro, login, listado de productos, detalle de producto, categorías
- Todo lo demás requiere token válido

### 1.6 Versionado

- **No se versiona la API en el MVP.** La base URL es `/api/` directamente.
- Si durante el semestre se necesita un breaking change, se discute como ADR y se evalúa agregar `/api/v2/` solo para los endpoints afectados.

### 1.7 Filtros y Búsqueda

Los filtros se pasan como **query parameters**:

```
GET /api/products/?category=electronics&status=published&search=macbook&ordering=-created_at&page=2
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Búsqueda por texto en título y descripción |
| `category` | string | Filtrar por slug de categoría |
| `status` | string | Filtrar por estado (published, reserved, sold) |
| `min_price` | decimal | Precio mínimo |
| `max_price` | decimal | Precio máximo |
| `ordering` | string | Ordenamiento (prefijo `-` para descendente) |
| `page` | integer | Número de página |

---

## 2. Contratos del Frontend

### 2.1 Consumo de la API

- El frontend consume **exclusivamente** la API REST del backend. No hay acceso directo a base de datos ni lógica de negocio en el frontend.
- Se usa un **cliente HTTP centralizado** (`src/lib/api.ts`) que maneja:
  - Base URL del backend
  - Inyección automática del token JWT en headers
  - Refresh automático del token cuando expira
  - Parseo de errores al formato estándar

**Ejemplo del cliente:**
```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error);
  }

  return response.json();
}
```

### 2.2 Manejo de Estados de UI

Toda vista que consuma datos de la API debe manejar **4 estados**:

| Estado | Descripción | Qué muestra |
|--------|-------------|-------------|
| **Loading** | La petición está en curso | Skeleton o spinner |
| **Success** | Datos recibidos correctamente | El contenido normal |
| **Empty** | Respuesta exitosa pero sin datos | Mensaje "No hay productos" con CTA |
| **Error** | La petición falló | Mensaje de error con opción de reintentar |

**Regla:** Ninguna vista puede quedarse en blanco. Siempre debe haber feedback visual al usuario.

### 2.3 Separación de Responsabilidades

```
src/
├── app/                    # Páginas (App Router de Next.js)
│   ├── (auth)/             # Páginas de login/registro
│   ├── products/           # Páginas de productos
│   ├── profile/            # Páginas de perfil
│   └── layout.tsx          # Layout principal
├── components/             # Componentes reutilizables de UI
│   ├── ui/                 # Componentes base (Button, Input, Card)
│   ├── products/           # Componentes de productos
│   └── layout/             # Header, Footer, Sidebar
├── lib/                    # Lógica y utilidades
│   ├── api.ts              # Cliente HTTP centralizado
│   ├── auth.ts             # Manejo de tokens JWT
│   └── utils.ts            # Funciones helper
├── hooks/                  # Custom hooks
│   ├── useProducts.ts      # Hook para productos
│   └── useAuth.ts          # Hook para autenticación
└── types/                  # Tipos TypeScript
    ├── product.ts          # Tipos de producto
    ├── user.ts             # Tipos de usuario
    └── api.ts              # Tipos de respuestas API
```

**Reglas:**
- **Pages (`app/`)**: solo composición de componentes y llamadas a hooks. Cero lógica de negocio.
- **Components (`components/`)**: UI pura. Reciben datos por props, no hacen fetch directo.
- **Hooks (`hooks/`)**: encapsulan el consumo de API y manejo de estado. Son el puente entre components y la API.
- **Lib (`lib/`)**: funciones utilitarias puras. Sin estado, sin side effects.
- **Types (`types/`)**: tipos TypeScript que reflejan los modelos del backend.

### 2.4 Tipos TypeScript

Los tipos del frontend deben reflejar las respuestas de la API:

```typescript
// types/product.ts
export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;           // string porque el backend lo envía así
  status: 'published' | 'reserved' | 'sold' | 'cancelled';
  category: Category;
  seller: UserSummary;
  images: ProductImage[];
  created_at: string;      // ISO 8601
  updated_at: string;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
```

**Regla:** Si el backend cambia un contrato de respuesta, el tipo TypeScript correspondiente debe actualizarse en el mismo PR.

---

## 3. Contratos de Base de Datos

### 3.1 Ownership de Tablas por Módulo

Cada módulo es **dueño** de sus tablas. Solo el módulo dueño puede escribir en sus tablas. Otros módulos pueden leer a través de foreign keys o del servicio del módulo dueño.

| Módulo | Tablas que posee |
|--------|-----------------|
| Core | `users`, `profiles`, `roles` |
| Marketplace | `categories`, `products`, `product_images`, `transactions`, `messages`, `comments` |
| Gamificación | `point_transactions`, `badges`, `user_badges`, `challenges`, `user_challenges` |

### 3.2 Foreign Keys entre Módulos

Se permiten foreign keys entre módulos **solo hacia Core**:

```
marketplace_products.seller_id       → core_users.id        ✅
marketplace_transactions.buyer_id    → core_users.id        ✅
gamification_point_transactions.user_id → core_users.id     ✅
gamification_user_badges.user_id     → core_users.id        ✅
```

Gamificación **no tiene FK directa** a tablas de Marketplace. La integración se hace mediante signals (ver `modules.md`).

### 3.3 Convenciones de Nombres

- Tablas: `{módulo}_{modelo}` en snake_case plural (Django lo hace automático con `app_label`)
  - `core_user`, `marketplace_product`, `gamification_badge`
- Columnas: `snake_case`
- Foreign keys: `{relación}_id` (ej. `seller_id`, `buyer_id`, `category_id`)
- Timestamps: toda tabla debe tener `created_at` y `updated_at`
- Soft delete: se usa campo `is_active` (boolean) en lugar de borrar registros. Solo se aplica a productos y usuarios.

### 3.4 Migraciones

- Cada módulo maneja sus propias migraciones (Django `makemigrations {app}`)
- **Prohibido** editar migraciones que ya fueron aplicadas en staging o producción
- Las migraciones se versionan en Git junto con el código
- Cambios al modelo de datos que afecten a otro módulo requieren revisión del Arquitecto y del DBA

### 3.5 Índices Requeridos

Como mínimo, las siguientes consultas deben estar optimizadas con índices:

| Tabla | Columna(s) | Razón |
|-------|-----------|-------|
| `products` | `status`, `created_at` | Listado de productos activos ordenados por fecha |
| `products` | `category_id` | Filtro por categoría |
| `products` | `seller_id` | Productos de un vendedor |
| `transactions` | `buyer_id`, `seller_id` | Historial de transacciones |
| `point_transactions` | `user_id` | Puntos de un usuario |

---

## 4. Reglas Generales

### 4.1 Contrato de Comunicación

```
Frontend ──HTTP/JSON──► Backend ──ORM──► PostgreSQL
   ▲                      │
   └──────JSON─────────────┘
```

- La **única** forma de comunicación entre frontend y backend es la API REST vía HTTP/JSON.
- El frontend **nunca** accede a la base de datos directamente.
- El backend **nunca** retorna HTML al frontend (no se usan Django templates).
- Las respuestas del backend son **siempre** JSON.

### 4.2 Quién Puede Cambiar un Contrato

| Cambio | Requiere aprobación de |
|--------|----------------------|
| Nuevo endpoint | Arquitecto |
| Cambio en estructura de respuesta | Arquitecto + Frontend Lead |
| Nuevo modelo o tabla | Arquitecto + DBA |
| Cambio en foreign key entre módulos | Arquitecto |
| Nuevo query parameter de filtro | Dueño del módulo |

### 4.3 Versionado de Contratos

- Los contratos se documentan en este archivo y se actualizan vía PR.
- Todo cambio de contrato debe reflejarse en el PR que lo implementa.
- Si un cambio de backend rompe el frontend, el PR debe incluir los cambios en ambos lados.