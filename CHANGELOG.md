# Changelog — ReUseITESO

Sprint Primavera 2026. Sistema entregado en producción 2026-05-08.

---

## [1.0.0] — 2026-05-08

### Infra / Deploy

- Deploy automático a GCP Cloud Run en push a `main` (workflow `deploy` en `ci.yml`)
- Backend en `https://backend-674659739241.us-central1.run.app`
- Frontend en `https://frontend-dscgahxthq-uc.a.run.app`
- `backend/entrypoint.sh` corre `makemigrations` antes de `migrate` en cada boot del container (necesario para que la regla de no commitear migrations funcione en prod)
- `frontend/Dockerfile` con `chmod +x ./entrypoint.sh` para que Cloud Run pueda ejecutar el entry
- Storage de imágenes migrado de filesystem local a Google Cloud Storage

### HU-CORE — Autenticación, usuarios, social

- **HU-CORE-04** Home dashboard con métricas de gamification
- **HU-CORE-07** Sign in con email/password + JWT (access + refresh)
- **HU-CORE-09** Email verification en account creation (token por SMTP)
- **HU-CORE-10** Editar perfil
- **HU-CORE-11** Friend connections (request, accept, reject)
- **HU-CORE-13** Communities CRUD (HU-CORE-13a)
- **HU-CORE-14** Notifications: campanita en navbar, página `/notifications`, contador de no leídas, mark all
- **HU-CORE-16** Rate limiting en endpoints sensibles (auth: 5/min, email verification: 3/min, password reset: 3/hour)
- **HU-CORE-17** Desactivar cuenta + reactivar con token
- **HU-CORE-18** Dark mode toggle con persistencia y `prefers-color-scheme`
- **HU-CORE-08** Página 404 custom con identidad visual ITESO (4-Logo-4)
- **HU-CORE-19** Password recovery (SHA-256 hash de token, expira 60min, respuesta genérica anti-enumeration, transaccional send/confirm)

### HU-MKT — Marketplace

- Publicación, edición y eliminación de productos
- Búsqueda con filtros por categoría, condición, tipo (sale/donation/swap), rango de precio
- Ordenamiento por popularidad y precio (HU-MKT-10)
- Set price con validación server-side y client-side (HU-MKT-11)
- **HU-MKT-12** Flujo completo de intercambio (swap): propose product → accept/reject → propose agenda → accept/reject → mutual delivery confirmation
- Modelo `SwapTransaction` con state machine dedicada (HU-DBA-03)
- Reportes de producto (HU-MKT-09) con razones predefinidas y descripción opcional
- Reacciones like/dislike (HU-MKT-17)
- Sistema de comentarios (HU-MKT-16)
- Comunidades privadas con marketplace propio (HU-MKT-15)
- Cards de transacciones con confirmaciones bilaterales

### HU-GAM — Gamification

- **HU-GAM-01** View points en `/profile` (PointsBalance card)
- **HU-GAM-02** Earn points por acciones (publish, complete sale, complete donation, complete exchange, receive review)
- **HU-GAM-02A** Points action history filtrable por acción y fecha, paginado
- **HU-GAM-03** Achievements / badges
- **HU-GAM-04** Unlock badges con desbloqueo automático por milestones
- **HU-GAM-05** Sustainability challenges (publish/donate/exchange/sale/review goals)
- **HU-GAM-05A** Challenges vinculados a acciones de marketplace (auto-progress)
- **HU-GAM-06** Eco impact (items reused, CO2 avoided, community average)
- **HU-GAM-07** Points history detallado
- **HU-GAM-08** Level progression (Beginner Reuser → Active Reuser → Eco Champion → Sustainability Leader)
- **HU-GAM-09** Customización de avatar (border, shadow, zoom, design templates)
- **HU-GAM-10** Leaderboard por comunidad (members vs leaderboard tab)

### HU-DBA — Schema

- **HU-DBA-01** Modelos iniciales (ProductReaction, Report, Notification)
- **HU-DBA-02** Índices optimizados para queries frecuentes
- **HU-DBA-03** Modelo `SwapTransaction` con stages, `agenda_location`, foreign keys a Transaction y Products

### Tests

- 131 tests pytest backend (verde)
- 26 tests Vitest frontend (verde)
- 199 tests Playwright e2e (verde) cubriendo HU-CORE-08/13/16/18 y HU-GAM-01/02/02A/03/04/05/05A/06/07/08 y HU-MKT-05
- Convención: tests en `frontend/tests/<dominio>/` con fixtures compartidas en `tests/gamification/fixtures/auth.ts`
- 4 e2e test users dedicados en el seed (test/rodrigo/carlos/maria) con baseline strict 0/100/300/600 pts

### Easter egg

- "Hackeado por Ferreira Perro" — 1% de chance por cambio de ruta dispara overlay con 50+ popups estilo Windows XP error dialogs, beeps Web Audio, redirect a `/hacked` con matrix rain y terminal animada

### Fixes notables

- Throttle rates condicionales: 5/min en prod, 1000/min en `DEBUG=True` (necesario para suite Playwright local)
- Fix de paginación en transacciones (filtro unified `pendiente+confirmada` rompía counts client-side, revertido a single-status)
- Fix BOM UTF-8 en `frontend/src/app/notifications/page.tsx` (rompía la directiva `'use client'`)
- 22 imágenes Unsplash agregadas al seed (29/29 productos ahora tienen imagen)
- Skip welcome badge + impact aleatorio para e2e users (rompía asserts de baseline)
- Hotfix `chmod +x` en `frontend/Dockerfile` (Cloud Run no podía ejecutar el entrypoint)

---

## Pendientes post-entrega

- PR #200 (Omar, HU-GAM-02 tests) en CONFLICTING contra dev, pendiente rebase del autor
- `docs/deployment-strategy.md` desfasado (menciona AWS, debe actualizarse o borrarse — info real ahora vive en ADRs y `docs/SPRINT-FINAL.md`)
- 9 vulnerabilidades reportadas por Dependabot (3 high, 6 moderate)
- Conversación pendiente: CyzarS mergeó su propio PR #160 en abril
