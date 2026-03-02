# ADR-002: Estructura Monorepo

## Estado

**Aceptado** — Febrero 2025

## Contexto

Se necesita definir cómo organizar el código fuente del proyecto ReUseITESO. El sistema tiene dos componentes principales: un backend en Django y un frontend en Next.js. Se debe decidir si ambos viven en un solo repositorio o en repositorios separados.

Se evaluaron las siguientes opciones:

| Opción | Estructura | Descripción |
|--------|-----------|-------------|
| A | Monorepo | Un solo repositorio con backend/, frontend/ y docs/ |
| B | Multi-repo | Repos separados: ReUse-backend, ReUse-frontend, ReUse-docs |
| C | Monorepo con herramientas | Monorepo con Nx, Turborepo o similar |

## Decisión

Se elige **Monorepo simple** (opción A): un solo repositorio Git con carpetas separadas para backend, frontend, documentación e infraestructura.

```
ReUse/
├── backend/          # Django project
├── frontend/         # Next.js project
├── docs/             # Documentación
├── infrastructure/   # CI/CD, scripts, deploy
└── README.md
```

## Justificación

**A favor del monorepo simple:**

- **Simplicidad operacional:** Un solo repo significa un solo lugar para issues, PRs, branches y CI. Para un equipo de estudiantes trabajando en un semestre, reducir la complejidad operacional es clave.
- **PRs atómicos:** Cuando un cambio de backend requiere cambio en frontend (ej. nuevo endpoint + consumo en UI), ambos cambios van en el mismo PR. Esto facilita la revisión y evita que el sistema quede en un estado inconsistente.
- **Documentación centralizada:** La carpeta `docs/` vive junto al código. No hay riesgo de que la documentación quede desactualizada en otro repo olvidado.
- **CI/CD unificado:** Un solo pipeline puede ejecutar tests de backend, tests de frontend y validaciones de documentación en el mismo flujo.
- **Visibilidad completa:** Cualquier miembro del equipo puede ver y entender todo el sistema sin saltar entre repos.

**En contra de las alternativas:**

- **Multi-repo:** Agrega complejidad operacional innecesaria para el tamaño del equipo y del proyecto. Coordinar versiones entre repos, manejar dependencias cruzadas y mantener CI en múltiples lugares no vale la pena para un proyecto de un semestre.
- **Monorepo con herramientas (Nx/Turborepo):** Estas herramientas optimizan builds incrementales y cacheo en monorepos grandes. Nuestro proyecto no tiene el tamaño ni la complejidad que justifique aprenderlas y configurarlas. Sería sobreingeniería.

## Consecuencias

**Positivas:**
- Proceso de desarrollo simple y predecible
- Un solo lugar para buscar cualquier cosa del proyecto
- PRs que incluyen cambios end-to-end (backend + frontend + docs)
- Onboarding rápido para nuevos miembros del equipo

**Negativas:**
- El repo puede crecer en tamaño (mitigado: es un proyecto de un semestre, no llegará a ser problemático)
- Si los pipelines de CI no se configuran bien, un cambio solo de docs podría ejecutar tests de backend innecesariamente
- No hay independencia de deploy: un cambio en frontend no puede desplegarse sin considerar el estado del backend en el mismo commit

**Mitigaciones:**
- CI se configura con **path filters**: cambios en `backend/` ejecutan tests de backend, cambios en `frontend/` ejecutan tests de frontend
- Se establecen convenciones claras de branching y PRs (ver documentación de DevOps/CI)
- El deploy se maneja por carpeta: el pipeline de backend y frontend se ejecutan de forma independiente aunque vivan en el mismo repo

## Estructura Detallada

```
ReUse/
├── backend/
│   ├── core/                   # App: autenticación, usuarios, roles
│   ├── marketplace/            # App: productos, transacciones, mensajes
│   ├── gamification/           # App: puntos, badges, ranking
│   ├── config/                 # Settings, URLs raíz, WSGI/ASGI
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   ├── components/         # Componentes de UI
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # API client, utils
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── architecture/
│       ├── architecture-overview.md
│       ├── modules.md
│       ├── contracts.md
│       ├── constraints.md
│       └── adrs/
├── infrastructure/
│   ├── ci/                     # Configuración CI/CD
│   ├── scripts/                # Scripts de desarrollo
│   └── docs/                   # Docs de infraestructura
└── README.md
```

## Referencias

- [architecture-overview.md](../architecture-overview.md)
- [Documentación de infraestructura](../../../infrastructure/docs/)
