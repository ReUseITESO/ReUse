# Marketplace – Guía de Configuración y API

**Módulo:** Marketplace - Buscar productos  
**Responsable:** @victortelles
**Fecha:** 20 de febrero de 2026  
**Versión:** 1.0

---

## Tabla de contenidos

- [Backend](#backend)
  - [Pre-requisitos](#pre-requisitos-backend)
  - [Docker + Base de datos](#docker--base-de-datos)
  - [Acceso directo a la Base de Datos](#acceso-directo-a-la-base-de-datos)
  - [Entorno virtual y dependencias](#entorno-virtual-y-dependencias)
  - [Variables de entorno](#variables-de-entorno-backend)
  - [Ejecutar el servidor](#ejecutar-el-servidor-backend)
  - [API Reference — `api/marketplace/*`](#api-reference--apimarketplace)
    - [Products](#products)
    - [Categories](#categories)
    - [Parámetros de búsqueda y filtros](#parámetros-de-búsqueda-y-filtros)
    - [Formato de respuesta](#formato-de-respuesta)
- [Frontend](#frontend)
  - [Pre-requisitos](#pre-requisitos-frontend)
  - [Conexión Backend + Base de datos](#conexión-backend--base-de-datos)
  - [Variables de entorno](#variables-de-entorno-frontend)
  - [Ejecutar el servidor](#ejecutar-el-servidor-frontend)
  - [Rutas disponibles](#rutas-disponibles)
- [Errores típicos](#errores-típicos)
  - [Base de datos no levantada](#base-de-datos-no-levantada)
  - [Backend no arranca](#backend-no-arranca)
  - [Frontend no conecta al backend](#frontend-no-conecta-al-backend)

---

## Backend

### Pre-requisitos (Backend)

| Requisito | Versión mínima |
|-----------|----------------|
| Python | 3.11+ |
| pip | Última estable |
| Docker Desktop | Última estable |
| PostgreSQL (via Docker) | 15+ |
| Git | Última estable |

---

### Docker + Base de datos

La base de datos PostgreSQL corre dentro de un contenedor Docker. **Docker Desktop debe estar instalado y corriendo** antes de cualquier otro paso.

#### 1. Levantar PostgreSQL

Desde la **raíz del proyecto**:

```bash
docker-compose up -d db
```

#### 2. Verificar que el contenedor esté activo

```bash
# Ver status de los servicios
docker-compose ps
# reuse_iteso_db debe estar "Up"

# Verificar los logs para confirmar que acepta conexiones
docker-compose logs db | tail -20
# Debes ver: "database system is ready to accept connections"
```

#### 3. Verificar conectividad a la BD

```bash
# Entrar al container de PostgreSQL y ejecutar un query de prueba
docker exec -it reuse_iteso_db psql -U reuse_dev -d reuse_iteso_dev -c "SELECT 1;"
```

Si devuelve `1`, la base de datos está lista.

#### Comandos útiles de Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f db

# Detener servicios
docker-compose down

# Reset completo ( BORRA TODOS LOS DATOS)
docker-compose down -v
docker-compose up -d db
sleep 10
cd backend
python manage.py migrate
python manage.py loaddata seeds/seed_v1.json
```

---

### Acceso directo a la Base de Datos

#### Opción 1: Adminer (GUI Web)

Adminer es una interfaz web ligera para administrar la base de datos. Viene incluido en el `docker-compose.yml`.

```bash
# Levantar Adminer
docker-compose up -d adminer
```

**Acceder:** http://localhost:8080

**Credenciales:**

| Campo | Valor |
|-------|-------|
| System | `PostgreSQL` |
| Server | `db` |
| Username | `reuse_dev` |
| Password | `local_dev_password` |
| Database | `reuse_iteso_dev` |

> Adminer permite ejecutar queries SQL, ver estructura de tablas, exportar datos y más, todo desde el navegador.

#### Opción 2: psql (Terminal)

```bash
# Entrar al container
docker exec -it reuse_iteso_db psql -U reuse_dev -d reuse_iteso_dev

# Comandos útiles en psql:
\dt                    # Listar tablas
\d users              # Describir tabla users
\d+ products          # Describir tabla products con detalles
SELECT * FROM users;  # Query
\q                    # Salir
```

#### Opción 3: Django dbshell

```bash
cd backend
python manage.py dbshell

# Ahora estás en psql
\dt
```

---

### Entorno virtual y dependencias

#### 1. Navegar a la carpeta backend

```bash
cd backend
```

#### 2. Crear y activar el entorno virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```
#### 4. Ejecutar migraciones

```bash
python manage.py migrate
```

---

### Variables de entorno (Backend)

Crear un archivo `.env` dentro de `backend/`:

```dotenv
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
DB_NAME=reuse_iteso_dev
DB_USER=reuse_dev
DB_PASSWORD=local_dev_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ALLOWED_HOSTS=localhost,127.0.0.1
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DEBUG` | Modo debug | `True` |
| `SECRET_KEY` | Clave secreta de Django | dev key (cambiar en prod) |
| `DB_NAME` | Nombre de la base de datos | `reuseiteso` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos (separados por coma) | `http://localhost:3000` |
| `ALLOWED_HOSTS` | Hosts permitidos (separados por coma) | `localhost,127.0.0.1` |

> **⚠️ Importante:** Las credenciales del `.env` deben coincidir con las definidas en `docker-compose.yml`.

---

### Ejecutar el servidor (Backend)

```bash
python manage.py runserver 8000
```

La API estará disponible en: `http://localhost:8000/api/marketplace/`

> En modo `DEBUG=True`, Django REST Framework proporciona una interfaz web navegable.

---

### API Reference — `api/marketplace/*`

**Base URL:** `http://localhost:8000/api/marketplace/`

La autenticación está deshabilitada por ahora (`AllowAny`). Se habilitará JWT cuando el módulo Core esté listo.  
La paginación está configurada a **20 elementos por página**.

---

#### Products

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/marketplace/products/` | Lista todos los productos disponibles (paginado) |
| `GET` | `/api/marketplace/products/{id}/` | Detalle de un producto específico |
| `GET` | `/api/marketplace/products/?search=keyword` | Busca productos por palabra clave |
| `GET` | `/api/marketplace/products/?category={id}` | Filtra productos por categoría |
| `GET` | `/api/marketplace/products/?condition={valor}` | Filtra por condición |
| `GET` | `/api/marketplace/products/?transaction_type={tipo}` | Filtra por tipo de transacción |
| `GET` | `/api/marketplace/products/?ordering={campo}` | Ordena resultados |
| `GET` | `/api/marketplace/products/?page={num}` | Paginación |

> **Nota:** Solo se listan productos con `status = "disponible"`.

---

#### Categories

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/marketplace/categories/` | Lista todas las categorías |
| `GET` | `/api/marketplace/categories/{id}/` | Detalle de una categoría |

---

#### Parámetros de búsqueda y filtros

##### `search` — Búsqueda por palabra clave

Busca coincidencias parciales (case-insensitive) en:
- Título del producto (`title`)
- Descripción del producto (`description`)
- Nombre de la categoría (`category__name`)

```
GET /api/marketplace/products/?search=calculadora
GET /api/marketplace/products/?search=libro
```

##### `category` — Filtrar por ID de categoría

```
GET /api/marketplace/products/?category=1
```

##### `condition` — Filtrar por condición del producto

Valores posibles: `nuevo`, `como_nuevo`, `buen_estado`, `usado`

```
GET /api/marketplace/products/?condition=buen_estado
```

##### `transaction_type` — Filtrar por tipo de transacción

Valores posibles: `donation`, `sale`, `swap`

```
GET /api/marketplace/products/?transaction_type=sale
```

##### `ordering` — Ordenar resultados

Campos disponibles: `created_at`, `price`, `title`  
Prefijo `-` para orden descendente.

```
GET /api/marketplace/products/?ordering=price          # Más barato primero
GET /api/marketplace/products/?ordering=-price         # Más caro primero
GET /api/marketplace/products/?ordering=-created_at    # Más reciente primero (default)
GET /api/marketplace/products/?ordering=title          # Alfabético
```

##### Combinación de filtros

Los parámetros se pueden combinar libremente:

```
GET /api/marketplace/products/?search=libro&category=1&ordering=price
GET /api/marketplace/products/?condition=nuevo&transaction_type=donation
GET /api/marketplace/products/?category=2&ordering=-created_at&page=2
```

---

#### Formato de respuesta

##### Lista de productos (paginada)

```json
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Cálculo Diferencial - Stewart 8va Edición",
      "description": "Libro de Cálculo en excelente estado...",
      "condition": "buen_estado",
      "transaction_type": "sale",
      "status": "disponible",
      "price": "350.00",
      "image_url": "https://images.unsplash.com/...",
      "category": {
        "id": 1,
        "name": "Libros",
        "icon": "book"
      },
      "seller_name": "María García Pérez",
      "created_at": "2026-02-01T04:00:00-06:00"
    }
  ]
}
```

##### Detalle de producto

```json
{
  "id": 1,
  "title": "Cálculo Diferencial - Stewart 8va Edición",
  "description": "Libro de Cálculo en excelente estado, con notas y ejercicios resueltos. Ideal para matemáticas I.",
  "condition": "buen_estado",
  "transaction_type": "sale",
  "status": "disponible",
  "price": "350.00",
  "image_url": "https://images.unsplash.com/...",
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
      "image_url": "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500",
      "order_number": 0
    },
    {
      "id": 2,
      "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
      "order_number": 1
    }
  ],
  "created_at": "2026-02-01T04:00:00-06:00"
}
```

##### Lista de categorías

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Libros",
      "icon": "book"
    }
  ]
}
```

##### Formato de error

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No encontrado.",
    "details": {}
  }
}
```

##### Verificación rápida con `curl`

```bash
# Listar todos los productos
curl http://localhost:8000/api/marketplace/products/

# Buscar "calculadora"
curl "http://localhost:8000/api/marketplace/products/?search=calculadora"

# Listar categorías
curl http://localhost:8000/api/marketplace/categories/

# Filtrar por categoría + ordenar por precio
curl "http://localhost:8000/api/marketplace/products/?category=1&ordering=price"
```

---

## Frontend

### Pre-requisitos (Frontend)

| Requisito | Versión mínima |
|-----------|----------------|
| Node.js | 18+ |
| npm (o pnpm) | Última estable |
| Backend corriendo | `http://localhost:8000` |
| Base de datos corriendo | PostgreSQL via Docker |

> **El frontend depende del backend y la base de datos.** Antes de iniciar el frontend, asegúrate de que:
> 1. Docker Desktop esté corriendo con el contenedor de PostgreSQL activo.
> 2. El servidor backend esté levantado en `http://localhost:8000`.

---

### Conexión Backend + Base de datos

El frontend consume la API REST del backend a través de un cliente HTTP centralizado en `src/lib/api.ts`. La URL base se configura con la variable de entorno `NEXT_PUBLIC_API_URL`.

**Flujo de dependencia:**

```
Docker (PostgreSQL) → Backend (Django :8000) → Frontend (Next.js :3000)
```

Los tres servicios deben estar corriendo para que el frontend funcione correctamente.

---

### Variables de entorno (Frontend)

Crear un archivo `.env` dentro de `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend | `http://localhost:8000/api` |

---

### Ejecutar el servidor (Frontend)

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

Si todo está configurado correctamente, deberás visualizar productos en la ruta `http://localhost:3000/products`.

---

### Rutas disponibles

| Ruta | Descripción | Componente |
|------|-------------|------------|
| `/` | Página principal — landing con enlace a productos | `app/page.tsx` |
| `/products` | Lista de productos con barra de búsqueda y filtros | `app/products/page.tsx` |
| `/products/{id}` | Detalle de un producto específico con galería de imágenes | `app/products/[id]/page.tsx` |

#### Funcionalidades de `/products`

- **Barra de búsqueda** con input y botón "Buscar"
- **Botón "Mostrar todos"** para resetear filtros
- **Grid de tarjetas** con título, categoría, precio y estado
- **Estados de UI:** loading (spinner), éxito (grid), vacío ("No se encontraron productos"), error (con botón "Reintentar")

#### Funcionalidades de `/products/{id}`

- **Galería de imágenes** con thumbnails y vista principal
- **Detalles del producto:** título, descripción, categoría, condición, precio
- **Información del vendedor:** nombre y email de contacto
- **Fecha de publicación**
- **Botón de contacto** para comunicarse con el vendedor

---

## Errores típicos

### Base de datos no levantada

**Síntoma:** El backend no arranca o devuelve errores de conexión al intentar `migrate` o `runserver`.

**Diagnóstico:**

```bash
# 1. Verificar que Docker Desktop esté corriendo
docker info

# 2. Verificar status de los contenedores
docker-compose ps
# reuse_iteso_db debe estar "Up"

# 3. Si no aparece el contenedor de PostgreSQL, levantarlo
docker-compose up -d db

# 4. Verificar los logs del contenedor
docker-compose logs db | tail -20
# Debes ver: "database system is ready to accept connections"

# 5. Verificar que la BD acepte conexiones
docker exec -it reuse_iteso_db psql -U reuse_dev -d reuse_iteso_dev -c "SELECT 1;"
```

**Soluciones comunes:**

| Problema | Solución |
|----------|----------|
| Docker Desktop no está abierto | Abrir Docker Desktop y esperar a que inicie |
| El contenedor existe pero está detenido | `docker-compose start db` |
| El contenedor no existe | `docker-compose up -d db` |
| Puerto 5432 ocupado | Detener otro servicio PostgreSQL local o cambiar el puerto en `docker-compose.yml` y `.env` |
| Credenciales no coinciden | Verificar que `.env` del backend coincida con `docker-compose.yml` |

---

### Backend no arranca

**Síntoma:** Error al ejecutar `python manage.py runserver`.

**Diagnóstico y soluciones:**

```bash
# 1. Verificar que el entorno virtual esté activado
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 2. Verificar que las dependencias estén instaladas
pip install -r requirements.txt

# 3. Verificar que el archivo .env exista en backend/
cat .env      # macOS/Linux
type .env     # Windows

# 4. Verificar conexión a la BD
python manage.py dbshell
# Si falla, la BD no está accesible

# 5. Ejecutar migraciones pendientes
python manage.py migrate

# 6. Verificar que el puerto 8000 no esté ocupado
# Windows:
netstat -ano | findstr :8000
# macOS/Linux:
lsof -i :8000
```

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError` | Activar venv y reinstalar: `pip install -r requirements.txt` |
| `django.db.utils.OperationalError: could not connect` | La BD no está corriendo → `docker-compose up -d` |
| `No migrations to apply` seguido de error | Verificar que las migraciones estén creadas: `python manage.py makemigrations` |
| `Port 8000 already in use` | Matar el proceso o usar otro puerto: `python manage.py runserver 8001` |

---

### Frontend no conecta al backend

**Síntoma:** La página de productos muestra el estado de error o no carga datos.

**Diagnóstico:**

```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:8000/api/marketplace/products/

# 2. Verificar el archivo .env del frontend
cat frontend/.env
# Debe contener: NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 3. Verificar CORS en el backend
# En backend/.env debe estar:
# CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# 4. Reiniciar el frontend después de cambiar .env
# (Next.js requiere restart al cambiar variables de entorno)
```

| Problema | Solución |
|----------|----------|
| `NEXT_PUBLIC_API_URL` no definida | Crear `frontend/.env` con la URL del backend |
| Error CORS en consola del navegador | Agregar `http://localhost:3000` a `CORS_ALLOWED_ORIGINS` en `backend/.env` |
| `fetch failed` / `ECONNREFUSED` | El backend no está corriendo → levantarlo en puerto 8000 |
| Cambié `.env` pero no toma efecto | Reiniciar el servidor de Next.js (`Ctrl+C` → `npm run dev`) |

---

## Estructura de archivos relevante

```
backend/
├── manage.py
├── requirements.txt
├── .env
├── config/
│   ├── settings.py              # Configuración global (BD, apps, REST framework)
│   ├── urls.py                  # Rutas raíz → api/marketplace/
│   └── exception_handler.py     # Handler de errores personalizado
└── marketplace/
    ├── urls.py                  # Router: products/, categories/
    ├── models/
    │   ├── category.py          # Modelo Category
    │   └── product.py           # Modelo Products
    ├── serializers/
    │   ├── category.py          # CategorySerializer
    │   └── product.py           # ProductListSerializer
    └── views/
        ├── category.py          # CategoryViewSet (ReadOnly)
        └── product.py           # ProductViewSet (ReadOnly + filtros)

frontend/
├── package.json
├── .env
└── src/
    ├── app/
    │   ├── layout.tsx           # Layout raíz
    │   ├── page.tsx             # Home — landing page
    │   └── products/
    │       ├── page.tsx         # Lista de productos
    │       └── [id]/page.tsx    # Detalle de producto (en desarrollo)
    ├── components/
    │   ├── products/
    │   │   ├── ProductCard.tsx  # Tarjeta de producto
    │   │   ├── ProductList.tsx  # Lista con búsqueda
    │   │   └── SearchBar.tsx    # Barra de búsqueda
    │   └── ui/                  # Componentes reutilizables (Button, Input, Spinner, etc.)
    ├── hooks/
    │   └── useProducts.ts       # Hook para fetch de productos
    ├── lib/
    │   └── api.ts               # Cliente HTTP centralizado
    └── types/
        ├── product.ts           # Tipos de Product y Category
        └── api.ts               # Tipo PaginatedResponse
```
