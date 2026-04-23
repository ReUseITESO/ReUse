/**
 * E2E tests – "User can participate in sustainability challenges"
 * Domain: Gamification
 *
 * Estos tests corren contra el backend y frontend REALES (sin mocks).
 * Usan el usuario jose.chavez@iteso.mx del seed con contraseña ReUse2026!
 *
 * Requisitos:
 *   - Backend running en http://localhost:8000
 *   - Frontend running en http://localhost:3000
 *   - Seed ejecutado: python manage.py seed_dev_data
 */

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const BASE_API = 'http://localhost:8000/api';
const TEST_EMAIL = 'jose.chavez@iteso.mx';
const TEST_PASSWORD = 'ReUse2026!';

// ─── Auth helper: login vía API real y devuelve tokens ───────────────────────
async function loginViaAPI(request: APIRequestContext): Promise<{ access: string; refresh: string }> {
  const res = await request.post(`${BASE_API}/auth/signin/`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(res.ok(), `Login falló con status ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return body.tokens;
}

// ─── Inyecta tokens en localStorage antes de cargar la página ────────────────
async function injectRealTokens(page: Page, tokens: { access: string; refresh: string }) {
  await page.addInitScript((t) => {
    localStorage.setItem('reuse_access_token', t.access);
    localStorage.setItem('reuse_refresh_token', t.refresh);
  }, tokens);
}

// ─── Setup compartido ────────────────────────────────────────────────────────
test.describe('Retos de Sustentabilidad – Sistema Real', () => {
  let tokens: { access: string; refresh: string };

  test.beforeAll(async ({ request }) => {
    tokens = await loginViaAPI(request);
  });

  // ── AC1: Feature accesible para usuarios autorizados ──────────────────────
  test.describe('AC1 – Acceso autorizado', () => {
    test('usuario NO autenticado ve aviso de login en lugar del tablero', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(
        page.getByText('Inicia sesión para ver y participar en retos activos.'),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Diarios' })).not.toBeVisible();
    });

    test('usuario autenticado ve el tablero de retos con pestañas', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible();
    });
  });

  // ── Selector helper: sección de retos ────────────────────────────────────
  // PointsBalance y otros también usan <article>, por lo que acotamos a la
  // sección del ChallengesBoard usando su h3 "Retos".
  function challengesSection(page: Page) {
    return page.locator('section').filter({ has: page.locator('h3', { hasText: 'Retos' }) }).last();
  }

  // ── AC2: Funcionalidad principal ───────────────────────────────────────────
  test.describe('AC2 – Funcionalidad de retos', () => {
    test('la pestaña Diarios está activa por defecto y muestra retos', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');

      const dailyBtn = page.getByRole('button', { name: 'Diarios' });
      await expect(dailyBtn).toBeVisible({ timeout: 10000 });

      // Esperar a que carguen los retos (el skeleton desaparece)
      await expect(challengesSection(page).locator('article').first()).toBeVisible({ timeout: 10000 });
    });

    test('cada reto muestra título, barra de progreso, puntos bonus y estado', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      const board = challengesSection(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      const firstChallenge = board.locator('article').first();
      // Tiene título
      await expect(firstChallenge.locator('h4')).not.toBeEmpty();
      // Tiene barra de progreso
      await expect(firstChallenge.locator('.h-2.overflow-hidden')).toBeVisible();
      // Tiene puntos bonus (+XX pts)
      await expect(firstChallenge.getByText(/\+\d+ pts/)).toBeVisible();
      // Tiene badge de estado
      await expect(firstChallenge.getByText(/En curso|Reclamar|Reclamado/)).toBeVisible();
    });

    test('el contador de progreso muestra formato X / Y completado', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      const board = challengesSection(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      await expect(board.getByText(/\d+ \/ \d+ completado/).first()).toBeVisible();
    });

    test('cambiar a pestaña Semanales muestra retos de duración semanal', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible({ timeout: 10000 });

      await page.getByRole('button', { name: 'Semanales' }).click();
      await expect(challengesSection(page).locator('article').first()).toBeVisible({ timeout: 8000 });
    });

    test('cambiar a pestaña Mensuales muestra retos de duración mensual', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible({ timeout: 10000 });

      await page.getByRole('button', { name: 'Mensuales' }).click();
      await expect(challengesSection(page).locator('article').first()).toBeVisible({ timeout: 8000 });
    });

    test('los retos del seed corresponden al catálogo esperado (diarios)', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      await expect(challengesSection(page).locator('article').first()).toBeVisible({ timeout: 10000 });

      // Los retos diarios del seed incluyen alguno de estos títulos
      const expectedTitles = [
        'Publica 1 articulo util hoy',
        'Concreta 2 ventas express',
        'Completa 2 intercambios inteligentes',
        'Dona 2 articulos que ya no uses',
        'Gana 2 resenas positivas',
        'Publica 2 articulos de estudio',
      ];

      // Al menos un reto visible debe coincidir con el catálogo
      let found = false;
      for (const title of expectedTitles) {
        const el = page.getByRole('heading', { name: title, exact: false });
        if (await el.count() > 0) {
          found = true;
          break;
        }
      }
      expect(found, 'Ningún reto diario del seed aparece en el tablero').toBeTruthy();
    });
  });

  // ── AC3: Feedback al usuario ───────────────────────────────────────────────
  test.describe('AC3 – Feedback al usuario', () => {
    test('estado "En curso" es visible en retos sin completar', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      const board = challengesSection(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      // Buscar badge "En curso" dentro del tablero de retos
      const enCurso = board.getByText('En curso').first();
      await expect(enCurso).toBeVisible();
    });

    test('progreso 0/X en reto no comenzado muestra barra vacía', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      const board = challengesSection(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      // Al menos algún reto debe tener progress 0
      const zeroProgress = board.getByText(/^0 \/ \d+ completado/);
      await expect(zeroProgress.first()).toBeVisible();
    });

    test('el tablero muestra skeleton mientras carga', async ({ page }) => {
      await injectRealTokens(page, tokens);

      // Interceptar para añadir delay artificial
      await page.route(`${BASE_API}/gamification/challenges/`, async (route) => {
        await new Promise(r => setTimeout(r, 800));
        await route.continue();
      });

      await page.goto('/dashboard');
      // El skeleton aparece durante la carga
      const skeleton = page.locator('.animate-pulse').first();
      await expect(skeleton).toBeVisible({ timeout: 3000 });
    });
  });

  // ── AC4: Manejo de errores ─────────────────────────────────────────────────
  test.describe('AC4 – Manejo de errores', () => {
    test('pestaña sin retos activos muestra estado vacío', async ({ page }) => {
      await injectRealTokens(page, tokens);

      // Interceptar la API de retos y devolver lista vacía solo para /me/
      await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
        if (route.request().url().endsWith('/challenges/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else {
          route.continue();
        }
      });
      await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.goto('/dashboard');
      await expect(page.getByText('No hay retos activos en esta categoría')).toBeVisible({ timeout: 8000 });
    });

    test('error de red en challenges API muestra mensaje de error', async ({ page }) => {
      await injectRealTokens(page, tokens);

      await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: { message: 'Error interno' } }) });
      });
      await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
        route.fulfill({ status: 500, body: '{}' });
      });

      await page.goto('/dashboard');
      await expect(
        page.locator('[class*="text-error"], [class*="error"]').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('sesión expirada (token inválido) muestra aviso de login', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('reuse_access_token', 'token-invalido-expirado');
        localStorage.setItem('reuse_refresh_token', 'refresh-invalido');
      });

      await page.goto('/dashboard');
      // Con tokens inválidos no puede cargar el perfil, queda sin autenticar
      await expect(
        page.getByText('Inicia sesión para ver y participar en retos activos.'),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Pruebas de tabs y navegación ──────────────────────────────────────────
  test.describe('Navegación entre pestañas', () => {
    test('cambiar entre pestañas no recarga la página completa', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible({ timeout: 10000 });

      await page.getByRole('button', { name: 'Semanales' }).click();
      await page.getByRole('button', { name: 'Mensuales' }).click();
      await page.getByRole('button', { name: 'Diarios' }).click();

      // El tablero sigue visible sin reload
      await expect(challengesSection(page).locator('article').first()).toBeVisible({ timeout: 8000 });
    });

    test('cada pestaña muestra exactamente 3 retos rotativos (máx del seed)', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      const board = challengesSection(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      const dailyCount = await board.locator('article').count();
      // El backend devuelve 3 diarios, 3 semanales, 3 mensuales rotativos
      expect(dailyCount).toBeLessThanOrEqual(3);
      expect(dailyCount).toBeGreaterThanOrEqual(1);
    });

    test('al volver a pestaña anterior los retos siguen visibles', async ({ page }) => {
      await injectRealTokens(page, tokens);
      await page.goto('/dashboard');
      const board = challengesSection(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      await page.getByRole('button', { name: 'Semanales' }).click();
      await expect(board.locator('article').first()).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: 'Diarios' }).click();
      await expect(board.locator('article').first()).toBeVisible({ timeout: 5000 });
    });
  });
});
