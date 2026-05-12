# Tests — convención

Playwright e2e + Vitest unit. Esta guía fija cómo escribir specs nuevos para que se mantengan consistentes.

## Estructura

```
frontend/tests/
├── core/                 specs de la app `core` (auth, notifications, dark mode, 404, rate limit)
├── gamification/         specs de la app `gamification` (points, levels, badges, challenges, eco impact, avatar)
│   ├── fixtures/         fixtures compartidas (auth.ts) — la fuente de verdad de tokens y users
│   │   └── auth.ts       USERS, storageStatePath(key), createStorageStateForUser(key)
│   └── auth.setup.ts     setup project de Playwright, login todos los users una vez por corrida
├── marketplace/          specs de la app `marketplace` (products, transactions, comunidades de mkt)
└── README.md             este archivo
```

Un solo `playwright.config.ts` en `frontend/`. `testDir` apunta a `./tests`.

## Naming

- Archivos: `<feature-id>-<slug>.spec.ts`. Ejemplos: `gam-01-view-points.spec.ts`, `13a-communities-crud.spec.ts`, `mkt-05-manage-listings.spec.ts`.
- Para HUs con subletras (5A, 13a, 02A), incluirla en el nombre.
- Sin prefijo `hu-` redundante. `gam-02-earn-points.spec.ts` mejor que `hu-gam-02-earn-points.spec.ts` (los archivos ya viven dentro de `gamification/`).

## Plantilla mínima

```ts
import { test, expect } from '@playwright/test';
import { storageStatePath } from '../gamification/fixtures/auth';

/**
 * GAM-XX — Título de la HU
 * Endpoints: GET /api/.../endpoint
 * UI: ComponentName (/ruta)
 *
 * Acceptance Criteria:
 * - AC1 …
 * - AC2 …
 */

test.describe('GAM-XX: titulo', () => {
  test.describe('AC1 — descripción', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('caso happy', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByTestId('xyz')).toBeVisible();
    });
  });

  test.describe('AC2 — descripción', () => {
    // ...
  });
});
```

## Reglas

1. **Usa `storageStatePath` siempre que necesites un user logueado.** Nunca metas tokens fake con `addInitScript` — rompe la convención y los siguientes specs no podrán reusarlo.
2. **`BASE_API` y credenciales no van hardcoded en cada spec.** Si necesitas la base URL, importa de un módulo compartido o usa `process.env`.
3. **Mocks deben ser específicos.** Para tests que mockean HTTP, intercepta solo los endpoints que el test usa. Como safety net adicional, puedes copiar el patrón de `core/16-rate-limiting.spec.ts`:
   ```ts
   test.beforeEach(async ({ page }) => {
     await page.route('**/api/**', (route) =>
       route.fulfill({ status: 404, body: JSON.stringify({ error: 'no mockeado' }) })
     );
     // ... mocks específicos por test override este default
   });
   ```
   Esto falla rápido si te falta mockear un endpoint, en vez de pegarle a la DB real.
4. **`data-testid` es preferido sobre texto literal.** El texto cambia con i18n, los testids no. Si el componente todavía no tiene testid, agrégalo en el mismo PR.
5. **Selectores accessibility-first:** `getByRole`, `getByLabel`, `getByText`. Evita `page.locator('div.button')` si hay alternativa.
6. **Specs idempotentes:** si el spec crea data (producto, comunidad, transacción), usa nombres únicos por corrida (sufijo `Date.now()` o UUID corto) para evitar duplicates en la DB.
7. **AC explícitos en jsdoc.** Que cualquiera pueda leer el header del spec y saber qué HU cubre y qué AC.

## Test users del seed (estricto)

| key | email | password | pts | level |
|---|---|---|---|---|
| `beginner` | test@iteso.mx | test1234 | 0 | Beginner Reuser |
| `active` | rodrigo@iteso.mx | rodrigo1234 | 100 | Active Reuser |
| `champion` | carlos@iteso.mx | carlos1234 | 300 | Eco Champion |
| `leader` | maria@iteso.mx | maria1234 | 600 | Sustainability Leader |

Estos 4 usuarios NO reciben welcome badge ni impact aleatorio. Si modificas el seed, no los toques o se cae media suite.

## Correr la suite

```bash
# levantar dependencias
docker compose up -d

# correr seed (idempotente)
docker compose exec backend python manage.py seed_dev_data

# Playwright (recomendado un worker por rate limit en local)
cd frontend
npx playwright test --workers=1

# solo un dominio
npx playwright test tests/gamification --workers=1

# UI interactivo
npm run test:e2e:ui

# ver reporte HTML
npm run test:e2e:report
```

## Para escribir specs nuevos rápido

El equipo usó **Playwright MCP** (Model Context Protocol server) con Claude/GPT durante el sprint. El flujo es:

1. Backend + frontend levantados local
2. Conecta el MCP de Playwright a tu cliente (Claude Desktop, Kiro, Cursor)
3. Dale el AC en lenguaje natural + el path/route a probar
4. El modelo abre el browser, navega, encuentra selectores via accessibility tree y genera el `.spec.ts`
5. Pégalo en `tests/<dominio>/`, revisa que respete la convención de arriba, ajusta naming

Si el modelo genera tokens hardcoded o `addInitScript` para auth, **rechaza** y dile que use `storageStatePath` de las fixtures.

## Vitest unit

Para componentes React puros con mocks de hooks. Se ejecuta con `npm test`. Archivos: `*.test.tsx` junto al componente.

Patrón canónico en `frontend/src/components/gamification/ChallengesBoard.test.tsx` y `ChallengesBoard.hu-gam-05.test.tsx`.

## CI

- `Frontend Checks` corre `npm run lint`, `prettier --check`, `tsc --noEmit`, `npm test` (vitest)
- Playwright e2e **no corre en CI todavía** (necesita backend + DB live). Se corre localmente antes de mergear feature grandes. Roadmap: meterlo a CI con `docker compose` arriba.

## Si tu spec rompe en CI

1. ¿`lint` o `prettier` fallaron? Local: `npm run lint -- --fix` y `npm run format`.
2. ¿`tsc` falló? Probablemente importaste algo mal o un tipo cambió. Local: `npx tsc --noEmit`.
3. ¿Vitest falló? Local: `npm test`. Revisa que los mocks de hooks cubran todos los casos.
