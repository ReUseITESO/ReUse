# Guía de Demo — ReUseITESO

Flujo paso a paso para presentar el sistema. Pensado para ~15 minutos.

---

## 0. Setup previo (haz esto 5 min antes)

- Backend prod live: https://backend-674659739241.us-central1.run.app
- Frontend prod live: https://frontend-dscgahxthq-uc.a.run.app
- Si vas a demostrar local: `docker compose up` en la raíz del repo, espera a que `backend` diga `Listening at 0.0.0.0:8000`.
- Ten abierto el frontend en una pestaña, esta guía en otra.

### Usuarios listos para login

| email | password | rol en la demo |
|---|---|---|
| `jose.chavez@iteso.mx` | `ReUse2026!` | usuario completo con productos, transacciones, badges, 350 pts |
| `maria@iteso.mx` | `maria1234` | nivel máximo (Sustainability Leader, 600 pts) |
| `carlos@iteso.mx` | `carlos1234` | Eco Champion, 300 pts |
| `test@iteso.mx` | `test1234` | beginner, 0 pts (úsalo para mostrar la curva desde cero) |

---

## 1. Onboarding / Auth (HU-CORE-07, HU-CORE-09, HU-CORE-19) — 2 min

1. Abre `/auth/signin`. Muestra el form.
2. Login con `jose.chavez@iteso.mx`. Resalta el JWT con refresh token y throttle de 5/min en prod.
3. Logout y muestra `/auth/forgot-password` → flujo de password reset (token SHA-256, expira 60min, respuesta genérica para no filtrar emails).
4. Menciona el rate limiting (HU-CORE-16): si alguien intenta 6 logins fallidos seguidos, el 6 devuelve 429.

---

## 2. Marketplace (HU-MKT-01, HU-MKT-05, HU-MKT-09, HU-MKT-12) — 4 min

1. Login como `jose.chavez@iteso.mx`. Ir a `/products`.
2. Muestra el grid: 29 productos con imágenes reales, filtros por categoría/condición/tipo (sale/donation/swap), ordenar por popularidad o precio.
3. Abre un producto cualquiera (`/products/{id}`):
   - Reacciones like/dislike arriba al nivel del título
   - Descripción con "Ver más" si pasa de 200 chars
   - Botón "Reportar" → dialog HU-MKT-09
   - Botón "Proponer intercambio" si el producto es tipo swap
4. **Flujo swap completo (HU-MKT-12)** — el más complejo:
   - Comprador propone uno de SUS productos
   - Vendedor acepta/rechaza
   - Comprador propone fecha + lugar de entrega
   - Vendedor acepta/rechaza
   - Ambos confirman entrega → transacción completada
   - Resalta: modelo `SwapTransaction` con state machine (`proposal_pending → proposal_accepted → agenda_pending → agenda_accepted → completada`)
5. Ir a `/products/my` → muestra "Mis productos", edición, eliminación, ver transacciones del producto.

---

## 3. Comunidades (HU-CORE-13) — 1 min

1. Ir a `/communities` → muestra comunidades existentes, botón "Crear comunidad".
2. Entrar a una comunidad. Resalta:
   - Marketplace privado por comunidad (solo miembros ven productos)
   - Sidebar con tabs: Miembros ↔ Leaderboard (HU-GAM-10)

---

## 4. Gamification (HU-GAM-01 a 10) — 4 min

Login como `test@iteso.mx` (beginner, 0 pts) para empezar desde cero, o ya como `jose.chavez` para tener data.

1. Ir a `/profile`. Mostrar de arriba abajo:
   - **PointsBalance** (HU-GAM-01) — total de puntos + historial reciente
   - **FeaturedGamificationCard** (HU-GAM-08) — nivel actual + barra al siguiente nivel (4 niveles: Beginner / Active / Eco Champion / Sustainability Leader)
   - **ChallengesBoard** (HU-GAM-05/05A) — retos diarios/semanales/mensuales con barra de progreso. Si hay uno completado, botón "Reclamar"
   - **BadgesList** (HU-GAM-04) — 8 badges, desbloqueadas vs locked
   - **EcoImpactCard** (HU-GAM-06) — items reusados, CO2 evitado, promedio comunidad
2. Click en "Personalizar avatar" → `/profile/customization` (HU-GAM-09):
   - Editor de borde/sombra/zoom
   - Tabs de diseños predefinidos (Celestial, Fire, Monster, Star Ribbon)
3. Ir a `/profile/points-history` (HU-GAM-02A) — tabla con filtros por acción y rango de fecha, paginación.
4. Resaltar el **toast global** (`GlobalChallengeToasts`) que aparece cuando completas un challenge — escucha el evento `reuse:points-updated`.

---

## 5. Notificaciones (HU-CORE-14) — 1 min

1. Click en la campanita del navbar → dropdown con últimas notificaciones, contador de no leídas.
2. Click en "Ver todas" → `/notifications`. Tabla paginada, "Marcar todas como leídas".

---

## 6. Dark mode + 404 (HU-CORE-18, HU-CORE-08) — 1 min

1. Click en el toggle de tema (luna/sol) en el navbar. Persiste en localStorage, respeta `prefers-color-scheme`, sincroniza entre tabs del mismo browser.
2. Navega a una ruta inexistente como `/asdfasdf` → muestra la página 404 custom con el 4-Logo-4.

---

## 7. Cierre — 2 min

Cierra con métricas (`docs/METRICS.md`):
- 89 PRs mergeadas en el sprint
- ~37K LOC entre código y tests
- 350+ tests entre backend pytest, frontend vitest y Playwright e2e — todos verdes en CI
- Deploy automático a GCP Cloud Run en push a `main`
- Equipo de ~14 contributors activos

---

## 8. Easter egg (OPCIONAL — solo si la audiencia es +18 y casual)

- Navega entre páginas. Tienes 1% de chance por click de disparar.
- Para forzar: agrega `?easter=on` a cualquier URL.
- Mensajes son explícitos con albures mexicanos. **NO lo enseñes a profes/comité formal.**

---

## Preguntas frecuentes que pueden hacer

**"¿Cómo manejan deploys?"** → Push a `main` dispara workflow de GitHub Actions, build imagen Docker → push a Artifact Registry → `gcloud run deploy backend && deploy frontend` en us-central1. Backend con `makemigrations` automático en boot para que la regla de no commitear migrations siga funcionando en prod.

**"¿Y si rompe algo en prod?"** → Rollback es un `gcloud run services update-traffic` a la revision anterior — toma 30 segundos.

**"¿Cómo aseguraron calidad?"** → PR review obligatorio (solo tech lead y co-lead mergean), CI Gate con conflict markers + ruff + black + mypy + pytest backend + eslint + prettier + tsc + vitest frontend. Si el CI no está verde, no se mergea.

**"¿Por qué Cloud Run y no AWS?"** → GCP nos da créditos académicos. Backend serverless escala a 0 cuando no hay tráfico. Imágenes en GCS bucket con SDK nativo (`google-cloud-storage`).
