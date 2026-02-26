# Restricciones del Proyecto – ReUseITESO

## Propósito

Este documento define las restricciones explícitas del proyecto: qué tecnologías no se usarán, qué patrones están fuera de alcance y qué se considera sobreingeniería. Estas restricciones existen para mantener el proyecto realista dentro del timeline de un semestre académico y las capacidades del equipo.

Cualquier propuesta que contradiga estas restricciones debe pasar por un ADR formal antes de ser implementada.

---

## 1. Restricciones de Arquitectura

### Lo que NO se hará

| Restricción | Razón |
|-------------|-------|
| **No microservicios** | La complejidad operacional (service discovery, comunicación inter-servicio, despliegue distribuido) no se justifica para el alcance del proyecto. Se usa monolito modular. |
| **No event-driven architecture** | No se implementarán colas de mensajes (RabbitMQ, Kafka, Redis Streams). La comunicación entre módulos se resuelve con signals de Django y llamadas directas a servicios. |
| **No GraphQL** | REST es suficiente para las necesidades del proyecto. GraphQL agrega complejidad en schema management, N+1 queries y tooling que no aporta valor para nuestro caso de uso. |
| **No Server-Side Rendering desde Django** | El backend no genera HTML. Toda la UI es responsabilidad del frontend (Next.js). No se usan Django templates. |
| **No WebSockets en el MVP** | La mensajería se implementa con polling o refresh manual. Si se necesita tiempo real, se evaluará Django Channels como ADR separado. |
| **No multi-tenancy** | La plataforma es exclusiva para ITESO. No se diseña para soportar múltiples instituciones. |

### Límites de la base de datos

| Restricción | Razón |
|-------------|-------|
| **Una sola instancia de PostgreSQL** | No se usan réplicas de lectura, sharding ni bases de datos separadas por módulo. Una sola instancia es suficiente para el volumen esperado. |
| **No bases de datos adicionales** | No se usa Redis, MongoDB, Elasticsearch ni ninguna otra base de datos. PostgreSQL cubre todas las necesidades (incluyendo búsqueda full-text con `SearchVector` de Django). |
| **No stored procedures ni triggers en DB** | Toda la lógica de negocio vive en el código Python. La base de datos solo almacena y consulta datos. |

---

## 2. Restricciones de Tecnología

### Tecnologías aprobadas

Solo se pueden usar las tecnologías listadas en el stack tecnológico definido en `architecture-overview.md`. Cualquier adición debe pasar por un ADR.

### Tecnologías explícitamente prohibidas

| Tecnología | Razón |
|-----------|-------|
| **Firebase / Supabase** | El backend es Django. No se usan BaaS externos que dupliquen funcionalidad. |
| **ORMs externos a Django** (SQLAlchemy, Peewee) | Django ORM es el único ORM del proyecto. Mezclar ORMs causa problemas de migraciones y consistencia. |
| **CSS-in-JS** (styled-components, emotion) | Se usa Tailwind CSS o CSS Modules para estilos en el frontend. CSS-in-JS agrega complejidad de runtime. |
| **State management externo** (Redux, MobX, Zustand) | Para el tamaño de la app, React Context + hooks propios son suficientes. Si se necesita algo más, se evalúa como ADR. |
| **Docker en desarrollo local obligatorio** | Docker es opcional para desarrollo local. El setup principal es directo (venv de Python + npm). Docker se usa para CI/CD y staging. |

### Librerías y herramientas aprobadas (no exhaustivo)

**Backend:**
- Django 5.x
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- django-filter
- Pillow (para imágenes)
- psycopg2 (driver PostgreSQL)

**Frontend:**
- Next.js 14+
- TypeScript
- Tailwind CSS
- React Hook Form (formularios)
- Axios o fetch nativo (HTTP client)

> Agregar nuevas dependencias al proyecto requiere justificación en el PR.

---

## 3. Restricciones de Alcance

### Funcionalidades fuera del MVP

Las siguientes funcionalidades **no se implementan** en la primera entrega. Pueden evaluarse como iteraciones futuras si el timeline lo permite.

| Funcionalidad | Razón de exclusión |
|---------------|-------------------|
| **Pagos en línea** | Complejidad regulatoria y de integración (Stripe, PayPal). Las transacciones se coordinan entre usuarios fuera de la plataforma. |
| **Chat en tiempo real** | Requiere WebSockets y una capa adicional de infraestructura. La mensajería se maneja con HTTP polling. |
| **Notificaciones push** | Requiere integración con servicios externos (FCM, APNs). Se limita a notificaciones dentro de la app. |
| **App móvil nativa** | El frontend es web responsivo. No se desarrolla app nativa para iOS/Android. |
| **Integración con sistemas del ITESO** | No se integra con el sistema académico, Moodle ni correo institucional más allá de validar el dominio @iteso.mx. |
| **Moderación automática con IA** | El módulo de IA es tooling interno. No se expone como feature de moderación automática al usuario. |
| **Multi-idioma** | La interfaz es solo en español. No se implementa i18n. |

### Límites de escala

| Parámetro | Límite esperado | Implicación |
|-----------|----------------|-------------|
| Usuarios concurrentes | < 100 | No se necesita load balancing ni caché agresivo |
| Productos totales | < 5,000 | Queries simples sin optimización avanzada |
| Imágenes por producto | Máximo 5 | Almacenamiento local o servicio simple, no CDN |
| Tamaño de imagen | Máximo 5 MB | Se comprime en el frontend antes de subir |

---

## 4. Restricciones de Proceso

### Desarrollo

| Restricción | Detalle |
|-------------|---------|
| **Branch principal protegido** | No se hacen push directos a `main`. Todo va por PR con al menos 1 aprobación. |
| **PRs con impacto arquitectónico** | Cambios que afecten estructura de módulos, modelos de datos o dependencias entre módulos requieren aprobación del Arquitecto. |
| **No se mergea código sin tests** | Todo endpoint nuevo debe tener al menos un test de integración. Todo componente de frontend con lógica debe tener al menos un test. |
| **Migraciones revisadas** | Toda migración de Django debe ser revisada antes de merge. No se auto-generan y mergean sin inspección. |

### Agentes de IA (bots de desarrollo)

| Restricción | Detalle |
|-------------|---------|
| **No inventan tecnologías** | Los agentes solo pueden usar el stack aprobado. Si un agente sugiere una librería o patrón no aprobado, se rechaza. |
| **No crean módulos nuevos** | La estructura de módulos (Core, Marketplace, Gamificación) es fija. Un agente no puede crear un nuevo módulo sin ADR. |
| **Outputs revisados por humano** | Todo código generado por agentes debe ser revisado en PR como cualquier otro código. No se mergea automáticamente. |
| **Respetan contratos** | Los agentes deben generar código que respete los contratos definidos en `contracts.md` (formato de respuestas, convenciones de endpoints, estructura de frontend). |

---

## 5. Lo que SÍ se considera sobreingeniería

Para evitar dudas, las siguientes prácticas se consideran **sobreingeniería** en el contexto de este proyecto y deben evitarse:

- Implementar CQRS (Command Query Responsibility Segregation)
- Crear una capa de abstracción sobre Django ORM
- Implementar un API Gateway separado
- Usar contenedores para cada módulo del backend
- Implementar circuit breakers o retry policies
- Crear un design system completo con Storybook desde el inicio
- Implementar feature flags o A/B testing
- Crear una librería de componentes publicada en npm
- Implementar observabilidad avanzada (distributed tracing, custom metrics)
- Usar Kubernetes para orquestar el despliegue

**Principio guía:** si la solución más simple funciona para < 100 usuarios concurrentes y < 5,000 productos, es la solución correcta.

---

## 6. Proceso para Cambiar una Restricción

Si durante el semestre se identifica que una restricción debe levantarse:

1. Se crea un **ADR** documentando por qué la restricción original ya no aplica.
2. El ADR debe incluir: contexto nuevo, alternativas evaluadas, impacto en el timeline.
3. El ADR debe ser aprobado por el **Arquitecto** y el **Tech Lead**.
4. Se actualiza este documento para reflejar el cambio.

No se levantan restricciones "de facto" (implementando sin documentar). Si está en el código pero no en un ADR, se revierte.