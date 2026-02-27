# Módulos y Límites – ReUseITESO

## Visión General

El sistema se divide en **3 módulos principales** dentro del backend (Django apps), más un componente transversal de IA que opera como tooling de apoyo. Cada módulo es una Django app independiente con sus propios modelos, serializers, views y URLs.

```
┌─────────────────────────────────────────────────────────────┐
│                      Backend Django                         │
│                                                             │
│  ┌─────────┐      ┌───────────────┐      ┌──────────────┐  │
│  │  Core   │◄────►│  Marketplace  │◄────►│ Gamificación │  │
│  │         │      │               │      │              │  │
│  └─────────┘      └───────────────┘      └──────────────┘  │
│       ▲                   ▲                      ▲          │
│       │                   │                      │          │
│       └───────────────────┴──────────────────────┘          │
│                  Dependencia hacia Core                      │
└─────────────────────────────────────────────────────────────┘
```

**Regla general de dependencias:**
- Core **no depende** de ningún otro módulo.
- Marketplace **depende** de Core.
- Gamificación **depende** de Core y Marketplace.
- Ningún módulo depende de Gamificación (es terminal).

---

## Módulo: Core

**Django app:** `core/`

**Propósito:** Gestionar todo lo relacionado con identidad, acceso y configuración base del sistema. Es el módulo fundacional del que dependen todos los demás.

### Responsabilidades

- Registro de usuarios con validación de correo `@iteso.mx`
- Autenticación (login/logout) mediante JWT
- Gestión de perfiles de usuario (nombre, carrera, foto, bio)
- Definición y asignación de roles (comprador, vendedor, administrador)
- Configuración general del sistema (categorías base, parámetros globales)
- Middleware de autenticación para proteger endpoints

### Modelos principales

- `User` (extiende AbstractUser de Django)
- `Profile` (información adicional del estudiante)
- `Role` (roles del sistema)

### Qué le pertenece

- Todo lo relacionado con autenticación y autorización
- Gestión de usuarios y perfiles
- Validación de correo institucional
- Endpoints de `/api/auth/` y `/api/users/`
- Middleware y permisos reutilizables

### Qué NO le pertenece

- Lógica de productos o publicaciones → Marketplace
- Lógica de transacciones o pagos → Marketplace
- Mensajería entre usuarios → Marketplace
- Puntos, badges o rankings → Gamificación
- Cualquier lógica de negocio específica de compraventa

### Dependencias

- **No depende de ningún otro módulo**
- Es consumido por: Marketplace, Gamificación

### Endpoints expuestos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Registro con correo @iteso.mx |
| POST | `/api/auth/login/` | Login, retorna JWT |
| POST | `/api/auth/refresh/` | Refresh del token JWT |
| GET | `/api/users/me/` | Perfil del usuario autenticado |
| PATCH | `/api/users/me/` | Actualizar perfil propio |
| GET | `/api/users/{id}/` | Perfil público de un usuario |

---

## Módulo: Marketplace

**Django app:** `marketplace/`

**Propósito:** Gestionar toda la funcionalidad principal de compraventa: publicaciones de productos, transacciones entre usuarios, categorización y comunicación entre comprador y vendedor.

### Responsabilidades

- CRUD de publicaciones de productos de segunda mano
- Gestión de categorías de productos
- Búsqueda y filtrado de publicaciones
- Manejo de estados de publicaciones (publicado, reservado, vendido, cancelado)
- Creación y gestión de transacciones entre usuarios
- Historial de transacciones por usuario
- Mensajería básica entre comprador y vendedor asociada a una publicación
- Subida y gestión de imágenes de productos

### Modelos principales

- `Category` (categorías de productos)
- `Product` (publicación de un artículo)
- `ProductImage` (imágenes asociadas a un producto)
- `Transaction` (transacción entre comprador y vendedor)
- `Message` (mensajes entre usuarios sobre un producto)

### Estados de una publicación

```
publicado → reservado → vendido
    │            │
    ▼            ▼
 cancelado    cancelado
```

### Estados de una transacción

```
pendiente → confirmada → completada
    │           │
    ▼           ▼
cancelada    cancelada
```

### Qué le pertenece

- Todo lo relacionado con productos y publicaciones
- Categorías y etiquetas
- Transacciones de compraventa
- Mensajería entre comprador y vendedor
- Imágenes de productos
- Endpoints de `/api/products/`, `/api/categories/`, `/api/transactions/`, `/api/messages/`

### Qué NO le pertenece

- Autenticación o gestión de usuarios → Core
- Validación de correo institucional → Core
- Puntos por venta o compra → Gamificación
- Badges o logros → Gamificación
- Ranking de usuarios → Gamificación
- Sugerencia automática de precios → Tooling IA

### Dependencias

- **Depende de Core:** necesita el modelo User para asociar productos, transacciones y mensajes a usuarios autenticados
- Es consumido por: Gamificación (para otorgar puntos por transacciones)

### Endpoints expuestos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products/` | Listar productos (con filtros) |
| POST | `/api/products/` | Crear nueva publicación |
| GET | `/api/products/{id}/` | Detalle de un producto |
| PATCH | `/api/products/{id}/` | Editar publicación propia |
| DELETE | `/api/products/{id}/` | Eliminar publicación propia |
| PATCH | `/api/products/{id}/status/` | Cambiar estado de publicación |
| GET | `/api/categories/` | Listar categorías |
| POST | `/api/transactions/` | Iniciar una transacción |
| GET | `/api/transactions/` | Historial de transacciones propias |
| PATCH | `/api/transactions/{id}/status/` | Cambiar estado de transacción |
| GET | `/api/messages/{product_id}/` | Mensajes de un producto |
| POST | `/api/messages/{product_id}/` | Enviar mensaje sobre un producto |

---

## Módulo: Gamificación

**Django app:** `gamification/`

**Propósito:** Incentivar el uso de la plataforma y la cultura de reutilización mediante un sistema de puntos, badges, rankings y retos.

### Responsabilidades

- Asignación de puntos por acciones en la plataforma (publicar, comprar, vender, completar perfil)
- Definición y otorgamiento de badges (logros)
- Ranking de usuarios por puntos acumulados
- Definición de retos periódicos (ej. "vende 3 artículos esta semana")
- Seguimiento de progreso de retos por usuario

### Modelos principales

- `PointTransaction` (registro de puntos otorgados/restados)
- `Badge` (definición de un logro)
- `UserBadge` (badges obtenidos por un usuario)
- `Challenge` (definición de un reto)
- `UserChallenge` (progreso de un usuario en un reto)

### Reglas de puntos (ejemplo inicial)

| Acción | Puntos |
|--------|--------|
| Completar perfil | +10 |
| Publicar un producto | +5 |
| Vender un producto | +15 |
| Comprar un producto | +10 |
| Completar un reto | +20 |

> Estas reglas son configurables y se ajustarán durante el semestre.

### Qué le pertenece

- Todo el sistema de puntos y su historial
- Badges y su asignación
- Rankings y leaderboards
- Retos y progreso
- Endpoints de `/api/gamification/`

### Qué NO le pertenece

- La lógica de cuándo se completa una transacción → Marketplace (Gamificación solo reacciona al evento)
- Gestión de usuarios o perfiles → Core
- Productos o publicaciones → Marketplace
- Mensajería → Marketplace

### Dependencias

- **Depende de Core:** necesita el modelo User para asociar puntos y badges
- **Depende de Marketplace:** necesita saber cuándo ocurren transacciones o publicaciones para otorgar puntos
- **No es consumido por ningún otro módulo** (es terminal en el grafo de dependencias)

### Mecanismo de integración con Marketplace

Gamificación **no importa directamente** lógica de Marketplace. En su lugar, se usa un patrón de **signals de Django**:

```python
# En marketplace/signals.py
from django.db.models.signals import post_save
from marketplace.models import Transaction

@receiver(post_save, sender=Transaction)
def on_transaction_completed(sender, instance, **kwargs):
    if instance.status == 'completed':
        # Llama al servicio de gamificación
        from gamification.services import award_points
        award_points(user=instance.buyer, action='purchase')
        award_points(user=instance.seller, action='sale')
```

Esto mantiene el acoplamiento bajo: Marketplace emite el evento, Gamificación reacciona.

### Endpoints expuestos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gamification/points/` | Puntos del usuario autenticado |
| GET | `/api/gamification/points/history/` | Historial de puntos |
| GET | `/api/gamification/badges/` | Badges disponibles |
| GET | `/api/gamification/badges/me/` | Badges del usuario autenticado |
| GET | `/api/gamification/ranking/` | Ranking global de usuarios |
| GET | `/api/gamification/challenges/` | Retos activos |
| GET | `/api/gamification/challenges/me/` | Progreso en retos del usuario |

---

## Tooling IA (Transversal)

> **No es un módulo del producto.** Es un conjunto de herramientas de apoyo al desarrollo y análisis.

### Funciones previstas

- **Sugerencia de precios:** analiza precios históricos de productos similares para sugerir un rango al vendedor.
- **Detección de publicaciones irregulares:** identifica publicaciones potencialmente fraudulentas o que violen las reglas.
- **Recomendaciones:** sugiere productos a usuarios basándose en su historial de búsqueda o compras.

### Reglas

- No se expone como feature al usuario final en el MVP.
- Consume datos de Marketplace (productos, transacciones) en modo lectura.
- Se implementa de forma progresiva y se documenta por separado.
- Su implementación es responsabilidad individual (extra).

---

## Resumen de Dependencias

```
Core ◄─── Marketplace ◄─── Gamificación
                ▲
                │
          Tooling IA (lectura)
```

| Módulo | Depende de | Es consumido por |
|--------|-----------|-----------------|
| Core | — | Marketplace, Gamificación |
| Marketplace | Core | Gamificación, Tooling IA |
| Gamificación | Core, Marketplace | — |
| Tooling IA | Marketplace (lectura) | — |