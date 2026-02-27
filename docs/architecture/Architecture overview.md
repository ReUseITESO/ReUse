# Arquitectura General – ReUseITESO

## Resumen

ReUseITESO es una plataforma web de compraventa de artículos de segunda mano entre estudiantes del ITESO. El sistema sigue una arquitectura de **monolito modular** en el backend con un **frontend desacoplado**, diseñada para ser realista dentro del alcance de un proyecto académico de un semestre.

## Stack Tecnológico

| Capa       | Tecnología                  | Justificación                                                        |
| ---------- | --------------------------- | -------------------------------------------------------------------- |
| Frontend   | Next.js + TypeScript        | SSR, tipado fuerte, ecosistema React maduro                          |
| Backend    | Python (Django REST Framework) | ORM robusto, admin panel incluido, comunidad amplia                  |
| Base de datos | PostgreSQL               | Relacional, soporte nativo en Django, gratuito                       |
| Auth       | JWT (via djangorestframework-simplejwt) | Stateless, compatible con SPA                            |
| Agentes IA | Tooling interno (Python)   | Apoyo al desarrollo, no expuesto como producto al usuario final      |

## Tipo de Arquitectura

**Monolito modular (backend) + Frontend desacoplado (SPA)**

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│                  (Next.js + TS)                     │
│         Consume API REST vía HTTP/JSON              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│               Backend (Django API)                  │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Core   │  │ Marketplace  │  │ Gamificación │  │
│  │          │  │              │  │              │  │
│  │ - Auth   │  │ - Productos  │  │ - Puntos     │  │
│  │ - Users  │  │ - Transacc.  │  │ - Badges     │  │
│  │ - Roles  │  │ - Mensajes   │  │ - Ranking    │  │
│  │ - Config │  │ - Categorías │  │ - Retos      │  │
│  └──────────┘  └──────────────┘  └──────────────┘  │
│                       │                             │
│              ┌────────▼────────┐                    │
│              │   PostgreSQL    │                    │
│              │  (Base de Datos)│                    │
│              └─────────────────┘                    │
└─────────────────────────────────────────────────────┘

        ┌─────────────────────┐
        │   Agentes IA        │
        │   (Tooling interno) │
        │                     │
        │ - Sugerencia precio │
        │ - Detección fraude  │
        │ - Recomendaciones   │
        └─────────────────────┘
  (No es módulo del producto, es herramienta de apoyo)
```

## Decisiones Clave

1. **Monolito modular, no microservicios**: un semestre no da tiempo para la complejidad operacional de microservicios. El monolito modular permite separación lógica sin sobrecarga de infraestructura.

2. **Frontend desacoplado**: Next.js se comunica exclusivamente con la API REST. No hay templates de Django ni rendering server-side desde el backend.

3. **Agentes como tooling, no como producto**: los agentes de IA son herramientas de apoyo al desarrollo y análisis de datos. No se exponen directamente al usuario final como feature del producto en el MVP.

4. **Base de datos compartida**: una sola instancia de PostgreSQL. Cada módulo es dueño de sus tablas, pero pueden existir foreign keys entre módulos cuando sea necesario.

5. **Autenticación con correo ITESO**: solo usuarios con correo `@iteso.mx` pueden registrarse. Se valida en el flujo de registro.

## Módulos del Sistema

| Módulo         | Responsabilidad principal                              |
| -------------- | ------------------------------------------------------ |
| **Core**       | Autenticación, usuarios, roles, configuración general  |
| **Marketplace**| Productos, transacciones, mensajería, categorías       |
| **Gamificación** | Sistema de puntos, badges, rankings e incentivos     |

> El módulo de IA opera como tooling transversal y se documenta por separado.

## Flujo General de Comunicación

1. El usuario interactúa con el **frontend** (Next.js).
2. El frontend hace peticiones HTTP a la **API REST** del backend.
3. El backend procesa la petición en el **módulo correspondiente**.
4. El módulo accede a la **base de datos** según sea necesario.
5. El backend responde en **JSON estandarizado**.
6. El frontend renderiza la respuesta al usuario.

## Estructura del Repositorio (Monorepo)

```
ReUse/
├── backend/                    # Django project
│   ├── core/                   # Módulo Core (app Django)
│   ├── marketplace/            # Módulo Marketplace (app Django)
│   ├── gamification/           # Módulo Gamificación (app Django)
│   ├── config/                 # Settings, URLs raíz, WSGI
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # Next.js project
│   ├── src/
│   │   ├── app/                # App Router (pages)
│   │   ├── components/         # Componentes reutilizables
│   │   ├── lib/                # Utilidades, API client
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── docs/                       # Documentación del proyecto
│   └── architecture/
│       ├── architecture-overview.md
│       ├── modules.md
│       ├── contracts.md
│       ├── constraints.md
│       └── adrs/
├── infrastructure/             # CI/CD, scripts, deploy
└── README.md
```

## Ambientes

| Ambiente     | Propósito                        | Base de datos       |
| ------------ | -------------------------------- | ------------------- |
| Local        | Desarrollo individual            | PostgreSQL local    |
| Staging      | Pruebas de integración           | PostgreSQL staging  |
| Producción   | Despliegue final                 | PostgreSQL prod     |

## Referencias

- [ADR-001: Stack Backend](./ADR-001:%20Stack%20Backend.md)
- [ADR-002: Estructura Monorepo](./ADR-002:%20Estructura%20Monorepo.md)
- [Módulos y límites](./modules.md)
- [Contratos entre capas](./contracts.md)
- [Restricciones del proyecto](./constraints.md)
- [Normas de escritura backend](../../reglas_de_escritura_back.md)