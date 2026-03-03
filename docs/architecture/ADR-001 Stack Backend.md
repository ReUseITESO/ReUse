# ADR-001: Stack del Backend

## Estado

**Aceptado** — Febrero 2025

## Contexto

Se necesita definir el stack tecnológico del backend para ReUseITESO. El backend debe exponer una API REST que será consumida por un frontend en Next.js. El equipo es de estudiantes universitarios con experiencia variada, y el proyecto debe completarse en un semestre (~4 meses).

Se evaluaron las siguientes opciones:

| Opción | Framework | Lenguaje |
|--------|-----------|----------|
| A | Django REST Framework | Python |
| B | FastAPI | Python |
| C | Express.js | JavaScript/TypeScript |

## Decisión

Se elige **Django REST Framework (DRF)** con Python como stack del backend.

## Justificación

**A favor de Django REST Framework:**

- **ORM robusto y maduro:** Django ORM maneja migraciones, relaciones y queries complejas sin configuración adicional. Para un proyecto con múltiples modelos relacionados (usuarios, productos, transacciones, gamificación), esto ahorra tiempo significativo.
- **Admin panel incluido:** Django Admin permite al equipo inspeccionar y gestionar datos sin construir un backoffice. Útil para debugging, carga de datos iniciales y para el rol de administrador del sistema.
- **Ecosistema probado para APIs:** DRF provee serializers, viewsets, permisos, paginación y filtros out-of-the-box. `djangorestframework-simplejwt` resuelve autenticación JWT sin código adicional.
- **Familiaridad del equipo:** La mayoría del equipo tiene experiencia previa con Python. Django tiene documentación extensa en español.
- **Arquitectura modular nativa:** Django apps permiten separar módulos (core, marketplace, gamification) de forma natural sin configuración extra.

**En contra de las alternativas:**

- **FastAPI:** Más moderno y con mejor rendimiento, pero requiere configurar ORM (SQLAlchemy o Tortoise), migraciones (Alembic), admin panel y otros componentes por separado. Para el timeline del proyecto, la productividad de Django supera la velocidad de FastAPI.
- **Express.js:** Permitiría un stack unificado JS/TS con el frontend, pero el equipo tiene más experiencia con Python. Express requiere más decisiones de arquitectura (ORM, validación, estructura de proyecto) que Django resuelve por convención.

## Consecuencias

**Positivas:**
- Velocidad de desarrollo alta gracias a las convenciones de Django
- Admin panel disponible desde el día 1
- Migraciones de DB integradas y confiables
- Comunidad amplia para resolver problemas

**Negativas:**
- Django es sincrónico por defecto (no ideal para WebSockets si se necesitaran en el futuro)
- El ORM puede generar queries ineficientes si no se usa select_related/prefetch_related
- El equipo de frontend trabaja en TypeScript y el backend en Python, lo que impide compartir tipos directamente

**Mitigaciones:**
- Si se necesita comunicación en tiempo real, se evaluará Django Channels como ADR separado
- Se establecen reglas de uso de select_related en el contrato de backend (ver contracts.md)
- Los tipos de TypeScript se mantienen sincronizados manualmente con los serializers de DRF

## Referencias

- [Django REST Framework docs](https://www.django-rest-framework.org/)
- [djangorestframework-simplejwt](https://django-rest-framework-simplejwt.readthedocs.io/)
- [architecture-overview.md](../architecture-overview.md)
