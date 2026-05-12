# Sprint Final — ReUseITESO

**Periodo:** Primavera 2026 · **Equipo:** ~14 contributors · **Status:** Entregado en producción

---

## Qué se entregó

**Sistema productivo en GCP Cloud Run** con backend Django + DRF y frontend Next.js + TypeScript. La plataforma permite a estudiantes de ITESO publicar, donar, vender e intercambiar artículos de segunda mano, con un sistema completo de gamification (puntos, niveles, badges, retos), comunidades privadas, notificaciones, password recovery, dark mode y customización de avatar.

## URLs en producción

- **Frontend:** https://frontend-dscgahxthq-uc.a.run.app
- **Backend:** https://backend-674659739241.us-central1.run.app
- **Documentación API:** `/api/docs/` (Swagger generado con drf-spectacular)

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Django 5 + DRF 3.14 + SimpleJWT + PostgreSQL 15 + drf-spectacular |
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript 5 + Tailwind 3.4 + shadcn/radix |
| Tests backend | pytest + pytest-django |
| Tests frontend | Vitest (unit) + Playwright (e2e, ~200 specs) |
| Infra | docker-compose (local) + GitHub Actions (CI/CD) + GCP Cloud Run + Artifact Registry + Cloud Storage |
| Auth | JWT (access + refresh) + Microsoft OAuth + password reset por email (SendGrid) |

## Cobertura funcional

### Core (autenticación, usuarios, sociales)
HU-CORE-01 a HU-CORE-19 entregadas: registro, login, verificación de email, recuperación de contraseña, edición de perfil, conexiones de amigos, desactivación/reactivación de cuenta, notificaciones in-app, dark mode, página 404 custom, rate limiting de endpoints sensibles.

### Marketplace
HU-MKT-01 a HU-MKT-18: publicación de productos, edición/eliminación, búsqueda y filtros, ordenamiento por popularidad/precio, transacciones (venta/donación/intercambio), confirmaciones de entrega bilaterales, reportes de producto, reacciones like/dislike, sistema de comentarios, foros por producto, comunidades privadas con marketplace propio.

### Gamification
HU-GAM-01 a HU-GAM-10: balance de puntos, ganar puntos por acciones, historial filtrable, niveles con progresión (Beginner → Active → Eco Champion → Sustainability Leader), badges con sistema de desbloqueo automático, retos diarios/semanales/mensuales con reclamación de recompensa, impacto ambiental (CO2 evitado, items reusados, promedio comunidad), customización de avatar, leaderboard por comunidad.

### DBA / Infra
HU-DBA-01 a HU-DBA-03: modelos de productos/transacciones, modelo `SwapTransaction` con state machine para flujo de intercambio, esquema de notificaciones, optimización de índices.

## Métricas del sprint

| Métrica | Valor |
|---|---|
| PRs mergeadas | 89 |
| LOC backend (sin migrations) | 15,417 |
| LOC frontend (src/) | 18,661 |
| LOC tests backend | 11,599 |
| LOC tests frontend (Playwright) | 3,827 |
| Tests backend (pytest) | 131 ✅ |
| Tests frontend unit (Vitest) | 26 ✅ |
| Tests E2E (Playwright) | 199 ✅ |
| Contributors activos | ~14 |

## Top contributors por commits (excluyendo merges)

1. victortelles — 124
2. OmarTieso — 48
3. InakiMedina — 44
4. rodrigolopez-c — 31
5. Antonio Pelayo — 30
6. Ferreira (tech lead) — 19
7. LuisArturo21 — 19
8. David Hernández — 14
9. Alan Solorio — 13
10. Jorge Burgos — 13

## Decisiones arquitectónicas clave

1. **Backend modular por dominio** — 4 apps Django (`core`, `marketplace`, `social`, `gamification`) para que cada equipo trabaje sin pisar al otro.
2. **Migrations no se commitean** — `core`, `marketplace`, `gamification` están en `.gitignore`. El container regenera con `makemigrations` en boot. Solo `social` commitea.
3. **Deploy automático en push a `main`** — workflow `deploy` en `ci.yml`, sin intervención manual.
4. **Tests Playwright en `frontend/tests/<dominio>/`** — un solo `playwright.config.ts`, fixtures compartidas en `tests/gamification/fixtures/auth.ts`.
5. **CI Gate obligatorio** — backend (ruff + black + mypy + pytest) y frontend (eslint + prettier + tsc + vitest) deben estar verde antes de mergear. Solo Ferreira y Cesar mergean.
6. **SwapTransaction como modelo dedicado** — reemplazó un workaround inicial que codificaba el estado del intercambio dentro de `delivery_location` (CharField). El modelo dedicado con state machine destrabó la HU-MKT-12.

## Decisiones de proceso

- Tech lead único + co-lead. Nadie mergea su propio PR (con una excepción documentada que requirió charla 1:1).
- Reviews con niveles ajustables (chill / normal / mamon / mamon-cabula) según contexto.
- Política de cero rastros de IA en código, commits y comentarios.

## Lo que aprendimos

- **MCP Playwright** aceleró la escritura de specs (un LLM controla browser real y genera el spec mientras navega los AC). Riesgo: tests inconsistentes en estilo si cada dev usa su propio prompt — mitigado al final del sprint con fixtures compartidas y convención de naming.
- **El gitignore de migrations funciona si y solo si `entrypoint.sh` corre `makemigrations` en boot**. Sin eso, 3 PRs mergeaban schema-changing code sin migrations, causando fallos silenciosos en prod.
- **Coordinación de infra requiere tech lead activo** — al inicio del sprint 4 PRs distintos intentaron agregar Playwright config simultáneamente, cada uno con su `testDir`. Se resolvió mergeando el primero limpio (#164 pelayo) y forzando rebase del resto.

## Próximos pasos (post-entrega)

- Mover el script de creación de e2e test users del seed a un comando dedicado opt-in (separar dev data de test fixtures).
- Migrar de pytest a tests/django nativo o consolidar con pytest-django (hoy ya está pero hay archivos de test fuera de la convención).
- Actualizar `docs/deployment-strategy.md` (todavía menciona AWS — info desfasada).
- Revisar las 9 vulnerabilidades reportadas por Dependabot (3 high, 6 moderate).
- Coverage report automatizado en CI.

---

**Entrega:** 2026-05-09 · **Live:** desde 2026-05-08 · **Repo:** [ReUseITESO/ReUse](https://github.com/ReUseITESO/ReUse)
