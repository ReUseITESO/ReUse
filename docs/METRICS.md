# Métricas del proyecto — ReUseITESO

Snapshot al 2026-05-12. Generado con `git`, `gh` y `wc` contra `origin/main`.

## Pull Requests

- **Mergeadas en el ciclo:** 89
- **Abiertas con conflicto pendiente al cierre:** 1 (#200, esperando rebase del autor)
- **Promedio de PRs por contributor activo:** ~6

## Líneas de código

| Área | LOC |
|---|---|
| Backend Python (sin migrations, sin venv) | 15,417 |
| Frontend TypeScript/TSX (src/) | 18,661 |
| Tests Playwright (frontend/tests/) | 3,827 |
| Tests backend (test_*.py) | 11,599 |
| **Total código + tests** | **49,504** |

## Tests

| Suite | Cantidad | Estado |
|---|---|---|
| pytest (backend) | 131 | ✅ verde |
| Vitest unit (frontend) | 26 | ✅ verde |
| Playwright e2e (frontend) | 199 | ✅ verde |
| **Total** | **356** | **✅** |

- Archivos de test backend: 40
- Archivos de test frontend (`.spec.ts`): 15

## Cobertura por Historia de Usuario (HUs mergeadas)

### Core (19)
HU-CORE-01 a HU-CORE-19 — registro, login, verificación, recovery, perfil, friends, deactivate, notificaciones, dark mode, 404, rate limiting.

### Marketplace (18)
HU-MKT-01 a HU-MKT-18 — productos, búsqueda, filtros, ordenamiento, transacciones, swap completo (12), reportes, reacciones, comentarios, comunidades.

### Gamification (10)
HU-GAM-01 a HU-GAM-10 — points balance, earn points + history, achievements, badges, challenges, eco impact, level progression, redeem points + avatar, leaderboard.

### DBA (3)
HU-DBA-01 a HU-DBA-03 — schema, swap transaction model, índices.

**Total HUs cerradas:** ~50

## Contributors (commits no-merge contra `origin/main`)

| # | Contributor | Commits |
|---|---|---|
| 1 | victortelles | 124 |
| 2 | OmarTieso | 48 |
| 3 | InakiMedina | 44 |
| 4 | rodrigolopez-c | 31 |
| 5 | Antonio Pelayo | 30 |
| 6 | victor.telles@iteso.mx | 30 |
| 7 | Antonio Pelayo (alt email) | 24 |
| 8 | Ferreira (tech lead) | 19 |
| 9 | LuisArturo21 | 19 |
| 10 | David Hernández | 14 |
| 11 | Jorgejvf | 13 |
| 12 | Alan Solorio | 13 |
| 13 | Danielon123456789 | 12 |
| 14 | CyzarS | 10 |
| 15 | Jorge Burgos | 7 |
| 16 | rodrigoleonblanco | 7 |
| 17 | LOSU028 | 6 |
| 18 | Eduardo Antonio Pelayo Carrillo | 6 |
| 19 | LaloCapacha3 | 4 |

(Algunos contributors aparecen 2 veces por usar emails distintos en commits — número real de personas: ~14)

## Infra

- **Backend prod:** Cloud Run en `us-central1`, project `reuse-iteso`, image en Artifact Registry `us-central1-docker.pkg.dev/reuse-iteso/reuse-repo/backend:latest`
- **Frontend prod:** Cloud Run en `us-central1`, image `frontend:latest`
- **DB local:** PostgreSQL 15-alpine en docker-compose, puerto 5433
- **Storage prod:** GCS bucket vía `google-cloud-storage` SDK
- **Email:** SendGrid SMTP

## CI/CD

- **Workflow:** `.github/workflows/ci.yml`
- **Jobs:**
  - `Backend Checks` (~1 min): conflict markers, ruff, black, mypy (advisory), pytest
  - `Frontend Checks` (~40s): conflict markers, npm ci, eslint, prettier --check, tsc --noEmit, vitest
  - `CI Gate` (~3s): aggregator, falla si cualquiera de los dos arriba falla
  - `Deploy to GCP` (~5 min, solo en push a `main`): build & push de imágenes, deploy a Cloud Run
- **Tiempo total típico de pipeline:** ~2 min para PR, ~7 min para deploy a main

## Cómo regenerar este documento

```bash
git shortlog -sn --no-merges origin/main
find backend -name "*.py" -not -path "*/venv/*" -not -path "*/__pycache__/*" -not -path "*/migrations/*" | xargs wc -l | tail -1
find frontend/src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
find frontend/tests -name "*.spec.ts" -o -name "*.setup.ts" | xargs wc -l | tail -1
find backend -name "test_*.py" -o -name "*_test.py" | xargs wc -l | tail -1
gh pr list --state merged --limit 200 --json number --jq '. | length'
```
