/**
 * E2E tests – HU-GAM-02: Usuario puede ganar puntos
 * Domain: Gamification | Pages: /profile, /profile/points-history
 *
 * Criterios de aceptación cubiertos:
 *  AC1 – Balance de puntos visible en el perfil del usuario autenticado
 *  AC2 – El usuario gana puntos al realizar acciones del marketplace
 *  AC3 – El balance se actualiza después de ganar puntos
 *  AC4 – Actividad reciente muestra las últimas transacciones de puntos
 *  AC5 – Estado de carga mientras se obtienen los datos
 *  AC6 – Usuario no autenticado ve aviso apropiado
 *  AC7 – Visualización correcta en móvil y escritorio
 *
 * Prerequisitos:
 *   Backend:  http://localhost:8000  (docker compose up db backend)
 *   Frontend: http://localhost:3000  (npm run dev)
 *   Seed ejecutado: python manage.py seed_dev_data
 *   Usuario: jose.chavez@iteso.mx / ReUse2026!
 */

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const BASE_API = 'http://localhost:8000/api';
const TEST_EMAIL = 'jose.chavez@iteso.mx';
const TEST_PASSWORD = 'ReUse2026!';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loginViaAPI(request: APIRequestContext) {
  const res = await request.post(`${BASE_API}/auth/signin/`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(res.ok(), `Login falló: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return body.tokens as { access: string; refresh: string };
}

async function injectTokens(page: Page, tokens: { access: string; refresh: string }) {
  await page.addInitScript((t) => {
    localStorage.setItem('reuse_access_token', t.access);
    localStorage.setItem('reuse_refresh_token', t.refresh);
  }, tokens);
}

async function getUserId(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/auth/profile/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  const body = await res.json();
  return body.id as number;
}

async function getCurrentPoints(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/gamification/points/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  const body = await res.json();
  return body.points as number;
}

async function awardPoints(
  request: APIRequestContext,
  tokens: { access: string; refresh: string },
  action: 'publish_item' | 'complete_donation' | 'complete_sale' | 'complete_exchange' | 'receive_positive_review',
  userId: number,
) {
  return request.post(`${BASE_API}/gamification/award-points/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
    data: { action, user_id: userId },
  });
}

async function getLevelProgression(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/gamification/level-progression/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  return res.json();
}

async function getPointsHistory(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/gamification/points/history/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  return res.json();
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('HU-GAM-02 – Usuario puede ganar puntos', () => {
  test.describe.configure({ mode: 'serial' });

  let tokens: { access: string; refresh: string };
  let userId: number;

  test.beforeAll(async ({ request }) => {
    tokens = await loginViaAPI(request);
    userId = await getUserId(request, tokens);
  });

  // ── AC1: Balance de puntos visible en el perfil ────────────────────────────
  test.describe('AC1 – Balance de puntos visible en el perfil', () => {
    test('usuario autenticado ve la sección "Puntos Acumulados" en su perfil', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Puntos Acumulados')).toBeVisible({ timeout: 10000 });
    });

    test('el balance de puntos muestra un número', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Total de puntos')).toBeVisible({ timeout: 10000 });
      const balanceEl = page.locator('p.text-5xl');
      await expect(balanceEl).toBeVisible({ timeout: 8000 });
      const text = await balanceEl.textContent();
      expect(text).toMatch(/[\d,]+/);
    });

    test('el perfil muestra el balance reportado por la API', async ({ page, request }) => {
      const levelData = await getLevelProgression(request, tokens);
      const apiPoints: number = levelData.points ?? 0;

      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Total de puntos')).toBeVisible({ timeout: 10000 });

      const balanceEl = page.locator('p.text-5xl');
      await expect(balanceEl).toBeVisible();
      const displayedText = (await balanceEl.textContent()) ?? '';
      const displayedPoints = parseInt(displayedText.replace(/[^0-9]/g, ''), 10);
      expect(displayedPoints).toBe(apiPoints);
    });

    test('el link "Ver todo el historial" apunta a /profile/points-history', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const link = page.getByRole('link', { name: /ver todo el historial/i });
      await expect(link).toBeVisible({ timeout: 10000 });
      await expect(link).toHaveAttribute('href', '/profile/points-history');
    });
  });

  // ── AC2: El usuario gana puntos al realizar acciones ───────────────────────
  test.describe('AC2 – El usuario gana puntos al realizar acciones del marketplace', () => {
    test('la API award-points devuelve 200 para publish_item', async ({ request }) => {
      const res = await awardPoints(request, tokens, 'publish_item', userId);
      expect(res.ok(), `award-points falló: ${res.status()}`).toBeTruthy();
      const body = await res.json();
      expect(body.message).toBe('Points awarded successfully');
    });

    test('la API award-points devuelve 200 para complete_donation', async ({ request }) => {
      const res = await awardPoints(request, tokens, 'complete_donation', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('la API award-points devuelve 200 para complete_sale', async ({ request }) => {
      const res = await awardPoints(request, tokens, 'complete_sale', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('la API award-points devuelve 200 para complete_exchange', async ({ request }) => {
      const res = await awardPoints(request, tokens, 'complete_exchange', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('la API award-points devuelve 200 para receive_positive_review', async ({ request }) => {
      const res = await awardPoints(request, tokens, 'receive_positive_review', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('award-points sin autenticación devuelve 401', async ({ request }) => {
      const res = await request.post(`${BASE_API}/gamification/award-points/`, {
        data: { action: 'publish_item', user_id: userId },
      });
      expect(res.status()).toBe(401);
    });

    test('award-points con acción inválida devuelve 400', async ({ request }) => {
      const res = await request.post(`${BASE_API}/gamification/award-points/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
        data: { action: 'accion_invalida', user_id: userId },
      });
      expect(res.status()).toBe(400);
    });
  });

  // ── AC3: Balance se actualiza después de ganar puntos ──────────────────────
  test.describe('AC3 – Balance actualizado después de ganar puntos', () => {
    test('los puntos del usuario aumentan después de una acción', async ({ request }) => {
      const pointsBefore = await getCurrentPoints(request, tokens);

      const res = await awardPoints(request, tokens, 'publish_item', userId);
      expect(res.ok()).toBeTruthy();

      const pointsAfter = await getCurrentPoints(request, tokens);
      expect(pointsAfter).toBeGreaterThan(pointsBefore);
    });

    test('la API /gamification/points/ devuelve la estructura correcta', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toHaveProperty('points');
      expect(typeof body.points).toBe('number');
      expect(body.points).toBeGreaterThanOrEqual(0);
    });

    test('la API /gamification/level-progression/ devuelve estructura correcta', async ({ request }) => {
      const data = await getLevelProgression(request, tokens);
      expect(data).toHaveProperty('points');
      expect(data).toHaveProperty('current_level');
      expect(data).toHaveProperty('next_level');
      expect(data).toHaveProperty('progress_percent');
      expect(data.progress_percent).toBeGreaterThanOrEqual(0);
      expect(data.progress_percent).toBeLessThanOrEqual(100);
    });
  });

  // ── AC4: Actividad reciente muestra últimas transacciones ──────────────────
  test.describe('AC4 – Actividad reciente en el perfil', () => {
    test('la sección "Actividad reciente" es visible en el perfil', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText(/actividad reciente/i)).toBeVisible({ timeout: 10000 });
    });

    test('la actividad reciente muestra entradas después de ganar puntos', async ({ page, request }) => {
      await awardPoints(request, tokens, 'publish_item', userId);

      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText(/actividad reciente/i)).toBeVisible({ timeout: 10000 });

      const hasEntry =
        (await page.getByText('Articulo publicado').count()) > 0 ||
        (await page.getByText(/\+\d+/).count()) > 0;
      expect(hasEntry).toBeTruthy();
    });

    test('los puntos de la actividad reciente se muestran en verde con signo +', async ({ page, request }) => {
      await awardPoints(request, tokens, 'publish_item', userId);

      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText(/actividad reciente/i)).toBeVisible({ timeout: 10000 });

      await expect(page.getByText(/\+\d+/).first()).toBeVisible({ timeout: 8000 });
    });

    test('la API /points/history/ devuelve transacciones con estructura correcta', async ({ request }) => {
      const data = await getPointsHistory(request, tokens);
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBeTruthy();

      if (data.results.length > 0) {
        const entry = data.results[0];
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('action');
        expect(entry).toHaveProperty('points');
        expect(entry).toHaveProperty('created_at');
        expect(typeof entry.points).toBe('number');
      }
    });
  });

  // ── AC5: Estado de carga mientras se obtienen los datos ────────────────────
  test.describe('AC5 – Estado de carga', () => {
    test('skeleton de carga aparece mientras se obtienen los puntos', async ({ page }) => {
      await injectTokens(page, tokens);

      await page.route(`${BASE_API}/gamification/level-progression/`, async (route) => {
        await new Promise(r => setTimeout(r, 800));
        await route.continue();
      });

      await page.goto('/profile');
      await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 4000 });
    });

    test('el skeleton desaparece y muestra el balance real', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Total de puntos')).toBeVisible({ timeout: 12000 });
      await expect(page.locator('p.text-5xl')).toBeVisible();
    });

    test('error de API muestra botón de Reintentar', async ({ page }) => {
      await page.route(`${BASE_API}/gamification/level-progression/`, (route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Error interno' }) });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible({ timeout: 8000 });
    });
  });

  // ── AC6: Usuario no autenticado ve aviso apropiado ────────────────────────
  test.describe('AC6 – Usuario no autenticado', () => {
    test('usuario no autenticado ve aviso en la sección de puntos', async ({ page }) => {
      await page.goto('/profile');
      await expect(
        page.getByText(/inicia sesion para ver tus puntos/i)
          .or(page.getByText(/inicia sesion para ver tu perfil/i))
          .first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('la API /gamification/points/ devuelve 401 sin token', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/`);
      expect(res.status()).toBe(401);
    });

    test('la API /gamification/level-progression/ devuelve 401 sin token', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/level-progression/`);
      expect(res.status()).toBe(401);
    });

    test('la API /points/history/ devuelve 401 sin token', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/history/`);
      expect(res.status()).toBe(401);
    });
  });

  // ── AC7: Responsividad ────────────────────────────────────────────────────
  test.describe('AC7 – Visualización en móvil y escritorio', () => {
    test('el balance de puntos se muestra en viewport de escritorio (1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Puntos Acumulados')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('p.text-5xl')).toBeVisible();
    });

    test('el balance de puntos se muestra en viewport móvil (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Puntos Acumulados')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('p.text-5xl')).toBeVisible();
    });

    test('la tarjeta de puntos no se desborda en pantalla móvil', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('Total de puntos')).toBeVisible({ timeout: 10000 });

      const card = page.locator('article').filter({ has: page.getByText('Puntos Acumulados') }).first();
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test('el link al historial es funcional en móvil', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const link = page.getByRole('link', { name: /ver todo el historial/i });
      await expect(link).toBeVisible({ timeout: 10000 });
      await link.click();
      await expect(page).toHaveURL('/profile/points-history', { timeout: 8000 });
    });
  });
});
