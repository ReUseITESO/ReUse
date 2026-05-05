import { test, expect, type APIRequestContext } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

const BASE_API = 'http://localhost:8000/api';

/**
 * HU-GAM-05A — Perfil: Retos vinculados a acciones del marketplace + rediseño visual
 * Endpoints usados:
 *   GET  /api/gamification/challenges/           → retos activos
 *   GET  /api/gamification/challenges/me/        → retos del usuario con progreso
 *   POST /api/gamification/award-points/         → simula acción del marketplace
 * UI: ChallengesBoard en /profile (sección de retos del perfil autenticado)
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

async function loginViaAPI(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${BASE_API}/auth/signin/`, {
    data: { email, password },
  });
  expect(res.ok(), `Login falló: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return body.tokens as { access: string; refresh: string };
}

async function getUserId(
  request: APIRequestContext,
  tokens: { access: string; refresh: string },
): Promise<number> {
  const res = await request.get(`${BASE_API}/auth/profile/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  const body = await res.json();
  return body.id as number;
}

async function awardPoints(
  request: APIRequestContext,
  tokens: { access: string; refresh: string },
  action: string,
  userId: number,
) {
  return request.post(`${BASE_API}/gamification/award-points/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
    data: { action, user_id: userId },
  });
}

// ── Datos mock reutilizables ─────────────────────────────────────────────────

const MOCK_PUBLISH_CHALLENGE = {
  id: 1,
  title: 'Publica 3 artículos esta semana',
  description: 'Gana puntos publicando artículos nuevos',
  challenge_type: 'publish',
  goal: 3,
  bonus_points: 45,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-05-08T00:00:00Z', // 7 días → semanal
  joined: true,
};

const MOCK_DONATION_CHALLENGE = {
  id: 2,
  title: 'Dona 2 artículos este mes',
  description: 'Apoya a la comunidad donando artículos',
  challenge_type: 'donation',
  goal: 2,
  bonus_points: 30,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-06-01T00:00:00Z', // 31 días → mensual
  joined: true,
};

const mkUserChallenge = (overrides: Record<string, unknown> = {}) => ({
  id: 10,
  challenge_id: 1,
  title: 'Publica 3 artículos esta semana',
  description: 'Gana puntos publicando artículos nuevos',
  challenge_type: 'publish',
  goal: 3,
  progress: 0,
  bonus_points: 45,
  is_completed: false,
  reward_claimed: false,
  reward_claimed_at: null,
  joined_at: '2026-05-01T00:00:00Z',
  completed_at: null,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-05-08T00:00:00Z',
  is_expired: false,
  ...overrides,
});

// ── Suite ────────────────────────────────────────────────────────────────────

test.describe('HU-GAM-05A: Perfil – Retos vinculados a acciones del marketplace', () => {
  test.describe('sección de retos en el perfil autenticado', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('1. La sección de retos es visible en /profile', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Retos')).toBeVisible();
    });

    test('2. El progreso del reto coincide con los datos de /challenges/me/', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_PUBLISH_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mkUserChallenge({ progress: 2 })]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Semanales' }).click();

      await expect(page.getByText(/2\s*\/\s*3/)).toBeVisible();
    });

    test('3. Reto completado muestra feedback visual distinto al reto en curso', async ({
      page,
    }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_PUBLISH_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            mkUserChallenge({ progress: 3, is_completed: true, reward_claimed: false }),
          ]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Semanales' }).click();

      // Reto completado muestra botón de reclamación, no el label "En curso"
      await expect(page.getByRole('button', { name: 'Reclamar' })).toBeVisible();
      await expect(page.getByText('En curso')).toHaveCount(0);
    });

    test('4. El progreso se actualiza al recibir evento reuse:points-updated', async ({ page }) => {
      let phase = 0;

      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_PUBLISH_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mkUserChallenge({ progress: phase === 0 ? 1 : 2 })]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Semanales' }).click();

      // Avanzar la fase y simular acción del marketplace que dispara un refetch
      phase = 1;
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('reuse:points-updated')));

      await expect(page.locator('article').getByText(/2\s*\/\s*3/)).toBeVisible({ timeout: 5000 });
    });

    test('5. Múltiples retos se renderizan independientemente con su propio progreso', async ({
      page,
    }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_PUBLISH_CHALLENGE, MOCK_DONATION_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            mkUserChallenge({ challenge_id: 1, progress: 1, goal: 3 }),
            mkUserChallenge({
              id: 20,
              challenge_id: 2,
              progress: 2,
              goal: 2,
              title: 'Dona 2 artículos este mes',
              challenge_type: 'donation',
              start_date: '2026-05-01T00:00:00Z',
              end_date: '2026-06-01T00:00:00Z',
            }),
          ]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Semanales' }).click();

      await expect(page.getByText(/1\s*\/\s*3/)).toBeVisible();
    });
  });

  test.describe('estados de carga y error', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('6. Skeleton de carga aparece mientras se obtienen los retos', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', async r => {
        await new Promise(resolve => setTimeout(resolve, 800));
        await r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/profile');
      await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 4000 });
    });

    test('7. Estado vacío muestra el mensaje correcto cuando no hay retos', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText('No hay retos activos en esta categoría')).toBeVisible();
    });

    test('8. Error de API muestra mensaje al usuario en la sección de retos', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'No se pudieron cargar los retos' } }),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'No se pudieron cargar los retos' } }),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText(/no se pudieron cargar los retos/i)).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('vinculación con acciones del marketplace (integración)', () => {
    test.describe.configure({ mode: 'serial' });

    let tokens: { access: string; refresh: string };
    let userId: number;

    test.beforeAll(async ({ request }) => {
      tokens = await loginViaAPI(request, 'carlos@iteso.mx', 'carlos1234');
      userId = await getUserId(request, tokens);
    });

    test('9. La API award-points (publish_item) actualiza el balance del usuario', async ({
      request,
    }) => {
      const res = await awardPoints(request, tokens, 'publish_item', userId);
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });

    test('10. La API award-points (complete_donation) es aceptada correctamente', async ({
      request,
    }) => {
      const res = await awardPoints(request, tokens, 'complete_donation', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('11. La API award-points (complete_exchange) es aceptada correctamente', async ({
      request,
    }) => {
      const res = await awardPoints(request, tokens, 'complete_exchange', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('12. La API award-points (complete_sale) es aceptada correctamente', async ({
      request,
    }) => {
      const res = await awardPoints(request, tokens, 'complete_sale', userId);
      expect(res.ok()).toBeTruthy();
    });

    test('13. La API award-points (receive_positive_review) es aceptada correctamente', async ({
      request,
    }) => {
      const res = await awardPoints(request, tokens, 'receive_positive_review', userId);
      expect(res.ok()).toBeTruthy();
    });
  });

  test.describe('diseño responsive', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('14. Sección de retos y pestañas funcionan en móvil (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText('Retos')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible();

      // La sección no se desborda del viewport
      const section = page.locator('section').filter({ hasText: 'Retos' }).first();
      const box = await section.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    });

    test('15. Sección de retos y pestañas funcionan en escritorio (1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText('Retos')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible();
    });
  });

  test.describe('usuario no autenticado', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('16. Usuario no autenticado ve aviso apropiado o es redirigido', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });

      const redirected = page.url().includes('/auth/signin');
      const hasWarning =
        (await page
          .getByText(/Inicia sesión para ver y participar en retos/i)
          .isVisible()
          .catch(() => false)) ||
        (await page
          .getByText(/Inicia sesion/i)
          .first()
          .isVisible()
          .catch(() => false));

      expect(redirected || hasWarning).toBeTruthy();
    });
  });
});
