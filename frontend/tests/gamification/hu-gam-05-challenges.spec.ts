import { test, expect } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';
import { BASE_API } from './config';

/**
 * HU-GAM-05 — Usuario puede participar en retos de sostenibilidad
 * Endpoints:
 *   GET  /api/gamification/challenges/           → retos activos
 *   GET  /api/gamification/challenges/me/        → retos del usuario
 *   POST /api/gamification/challenges/{id}/claim/ → reclamar recompensa
 * UI: ChallengesBoard (/profile)
 */

// ── Datos de prueba ──────────────────────────────────────────────────────────

const DAILY_CHALLENGE = {
  id: 1,
  title: 'Publica 2 artículos hoy',
  description: 'Publica artículos para ganar puntos bonus',
  challenge_type: 'publish',
  goal: 2,
  bonus_points: 20,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-05-02T00:00:00Z', // 1 día → bucket diario
  joined: true,
};

const WEEKLY_CHALLENGE = {
  id: 2,
  title: 'Completa 3 donaciones esta semana',
  description: 'Dona artículos para ayudar a la comunidad',
  challenge_type: 'donation',
  goal: 3,
  bonus_points: 50,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-05-08T00:00:00Z', // 7 días → bucket semanal
  joined: true,
};

const MONTHLY_CHALLENGE = {
  id: 3,
  title: 'Completa 5 intercambios este mes',
  description: 'Intercambia artículos con otros usuarios',
  challenge_type: 'exchange',
  goal: 5,
  bonus_points: 100,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-06-05T00:00:00Z', // 35 días → bucket mensual
  joined: true,
};

const USER_CHALLENGE_IN_PROGRESS = {
  id: 10,
  challenge_id: 1,
  title: 'Publica 2 artículos hoy',
  description: 'Publica artículos para ganar puntos bonus',
  challenge_type: 'publish',
  goal: 2,
  progress: 1,
  bonus_points: 20,
  is_completed: false,
  reward_claimed: false,
  reward_claimed_at: null,
  joined_at: '2026-05-01T00:00:00Z',
  completed_at: null,
  start_date: '2026-05-01T00:00:00Z',
  end_date: '2026-05-02T00:00:00Z',
  is_expired: false,
};

const USER_CHALLENGE_COMPLETED = {
  ...USER_CHALLENGE_IN_PROGRESS,
  id: 11,
  progress: 2,
  is_completed: true,
  reward_claimed: false,
  completed_at: '2026-05-01T12:00:00Z',
};

const USER_CHALLENGE_CLAIMED = {
  ...USER_CHALLENGE_COMPLETED,
  id: 12,
  reward_claimed: true,
  reward_claimed_at: '2026-05-01T13:00:00Z',
};

// ── Suite ────────────────────────────────────────────────────────────────────

test.describe('HU-GAM-05: Participar en retos de sostenibilidad', () => {
  test.describe('usuario autenticado', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('1. Sección "Retos" visible en /profile', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Retos')).toBeVisible();
    });

    test('2. Tres pestañas de navegación visibles: Diarios, Semanales, Mensuales', async ({
      page,
    }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible();
    });

    test('3. Reto diario se muestra con título y puntos bonus (mock)', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText('Publica 2 artículos hoy')).toBeVisible();
      await expect(page.getByText('+20 pts')).toBeVisible();
    });

    test('4. Reto en progreso muestra "En curso" y progreso X/Y', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([USER_CHALLENGE_IN_PROGRESS]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText('En curso')).toBeVisible();
      // Acotar al artículo del reto para evitar coincidir con otros spans de la página
      await expect(
        page.locator('article').filter({ hasText: 'Publica 2 artículos hoy' }).getByText(/1\s*\/\s*2/),
      ).toBeVisible();
    });

    test('5. Reto completado muestra el botón "Reclamar"', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([USER_CHALLENGE_COMPLETED]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByRole('button', { name: 'Reclamar' })).toBeVisible();
    });

    test('6. Reto ya reclamado muestra "Reclamado" (sin botón)', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([USER_CHALLENGE_CLAIMED]),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText('Reclamado')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Reclamar' })).toHaveCount(0);
    });

    test('7. Clic en "Reclamar" llama al endpoint y muestra confirmación', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([USER_CHALLENGE_COMPLETED]),
        }),
      );
      await page.route('**/api/gamification/challenges/1/claim/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...USER_CHALLENGE_CLAIMED }),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Reclamar' }).click();

      await expect(page.getByText('Recompensa reclamada.')).toBeVisible({ timeout: 5000 });
    });

    test('8. Error en claim muestra mensaje de error', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([USER_CHALLENGE_COMPLETED]),
        }),
      );
      await page.route('**/api/gamification/challenges/1/claim/', r =>
        r.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'No se pudo reclamar la recompensa.' } }),
        }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Reclamar' }).click();

      await expect(page.getByText(/no se pudo reclamar/i)).toBeVisible({ timeout: 5000 });
    });

    test('9. Cambiar a pestaña Semanales oculta retos diarios y muestra semanales', async ({
      page,
    }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE, WEEKLY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Publica 2 artículos hoy')).toBeVisible();
      expect(await page.getByText('Completa 3 donaciones esta semana').isVisible()).toBe(false);

      await page.getByRole('button', { name: 'Semanales' }).click();

      await expect(page.getByText('Completa 3 donaciones esta semana')).toBeVisible();
      expect(await page.getByText('Publica 2 artículos hoy').isVisible()).toBe(false);
    });

    test('10. Reto mensual aparece solo en pestaña Mensuales', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MONTHLY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      // No visible en Diarios (por defecto)
      expect(await page.getByText('Completa 5 intercambios este mes').isVisible()).toBe(false);

      await page.getByRole('button', { name: 'Mensuales' }).click();
      await expect(page.getByText('Completa 5 intercambios este mes')).toBeVisible();
    });

    test('11. Pestaña vacía muestra "No hay retos activos en esta categoría"', async ({ page }) => {
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([DAILY_CHALLENGE]),
        }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Semanales' }).click();

      await expect(page.getByText('No hay retos activos en esta categoría')).toBeVisible();
    });

    test('12. Error de API muestra mensaje de error en la sección de retos', async ({ page }) => {
      const errorBody = JSON.stringify({ error: { message: 'No se pudieron cargar los retos' } });
      await page.route('**/api/gamification/challenges/', r =>
        r.fulfill({ status: 500, contentType: 'application/json', body: errorBody }),
      );
      await page.route('**/api/gamification/challenges/me/', r =>
        r.fulfill({ status: 500, contentType: 'application/json', body: errorBody }),
      );

      await page.goto('/profile', { waitUntil: 'networkidle' });

      await expect(page.getByText(/no se pudieron cargar los retos/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test('13. Sección de retos visible en móvil (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Retos')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible();
    });

    test('14. Sección de retos visible en escritorio (1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Retos')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible();
    });

    test('15. Estructura de la API /challenges/ tiene campos requeridos', async ({ page }) => {
      // Intercepta la respuesta REAL del backend (mismo patrón que gam-01/gam-08)
      let apiBody: any = null;
      page.on('response', async res => {
        if (/\/api\/gamification\/challenges\/$/.test(res.url()) && res.ok()) {
          apiBody = await res.json().catch(() => null);
        }
      });

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Retos')).toBeVisible();

      expect(Array.isArray(apiBody)).toBe(true);
      if (apiBody && apiBody.length > 0) {
        const challenge = apiBody[0];
        expect(challenge).toHaveProperty('id');
        expect(challenge).toHaveProperty('title');
        expect(challenge).toHaveProperty('challenge_type');
        expect(challenge).toHaveProperty('goal');
        expect(challenge).toHaveProperty('bonus_points');
        expect(challenge).toHaveProperty('start_date');
        expect(challenge).toHaveProperty('end_date');
      }
    });

    test('16. Estructura de la API /challenges/me/ tiene campos requeridos', async ({ page }) => {
      // Intercepta la respuesta REAL del backend
      let apiBody: any = null;
      page.on('response', async res => {
        if (/\/api\/gamification\/challenges\/me\//.test(res.url()) && res.ok()) {
          apiBody = await res.json().catch(() => null);
        }
      });

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByText('Retos')).toBeVisible();

      expect(Array.isArray(apiBody)).toBe(true);
      if (apiBody && apiBody.length > 0) {
        const uc = apiBody[0];
        expect(uc).toHaveProperty('challenge_id');
        expect(uc).toHaveProperty('progress');
        expect(uc).toHaveProperty('is_completed');
        expect(uc).toHaveProperty('reward_claimed');
        expect(uc).toHaveProperty('goal');
        expect(uc).toHaveProperty('bonus_points');
      }
    });
  });

  test.describe('usuario no autenticado', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('17. Usuario no autenticado ve aviso de inicio de sesión', async ({ page }) => {
      // Misma estrategia que gam-01: goto sin waitUntil + waitForLoadState para capturar redireccionamientos JS
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      const redirected = page.url().includes('/auth/signin');
      const warningVisible = await page
        .getByText(/Inicia sesion/i)
        .first()
        .isVisible()
        .catch(() => false);
      expect(redirected || warningVisible).toBeTruthy();
    });

    test('18. API /challenges/ retorna 401 sin token', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/challenges/`);
      expect(res.status()).toBe(401);
    });

    test('19. API /challenges/me/ retorna 401 sin token', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/challenges/me/`);
      expect(res.status()).toBe(401);
    });

    test('20. API /challenges/{id}/claim/ retorna 401 sin token', async ({ request }) => {
      const res = await request.post(`${BASE_API}/gamification/challenges/1/claim/`);
      expect(res.status()).toBe(401);
    });
  });
});
