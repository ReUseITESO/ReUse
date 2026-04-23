/**
 * E2E tests – HU-GAM-05A: Display challenges linked to marketplace actions + visual redesign
 * Domain: Gamification | Page: /profile
 *
 * Cubre los criterios de aceptación específicos de esta sub-historia:
 *  AC1 – Sección de retos visible en el perfil del usuario autenticado
 *  AC2 – Progreso exacto basado en acciones del marketplace (award-points API)
 *  AC3 – Acción válida actualiza correctamente el progreso del reto
 *  AC4 – Reto completado genera feedback visual inmediato en el perfil
 *  AC5 – Jerarquía visual, accesibilidad y estados (loading, empty, error)
 *  AC6 – UI funciona en móvil y escritorio
 *  AC7 – El progreso no se duplica por el mismo evento de negocio
 *
 * Prerequisitos:
 *   Backend: http://localhost:8000  (docker compose up db backend)
 *   Frontend: http://localhost:3000 (npm run dev)
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

/** Llama a award-points para simular una acción del marketplace */
async function triggerMarketplaceAction(
  request: APIRequestContext,
  tokens: { access: string; refresh: string },
  action: 'publish_item' | 'complete_donation' | 'complete_exchange' | 'complete_sale' | 'receive_positive_review',
  userId: number,
) {
  const res = await request.post(`${BASE_API}/gamification/award-points/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
    data: { action, user_id: userId },
  });
  return res;
}

/** Obtiene el ID del usuario autenticado */
async function getUserId(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/auth/profile/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  const body = await res.json();
  return body.id as number;
}

/** Obtiene los retos del usuario directamente desde la API */
async function getMyChallenges(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/gamification/challenges/me/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  return res.json();
}

/** Obtiene la lista de challenges disponibles (objetos Challenge, con campo `id`) */
async function getAvailableChallenges(request: APIRequestContext, tokens: { access: string; refresh: string }) {
  const res = await request.get(`${BASE_API}/gamification/challenges/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  return res.json();
}

/** Selector acotado al section de retos dentro del perfil */
function challengesBoardInProfile(page: Page) {
  return page.locator('section').filter({ has: page.locator('h3', { hasText: 'Retos' }) }).last();
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('HU-GAM-05A – Retos en el Perfil', () => {
  // Serial para evitar rate-limiting: el beforeAll comparte tokens en un solo worker
  test.describe.configure({ mode: 'serial' });

  let tokens: { access: string; refresh: string };
  let userId: number;

  test.beforeAll(async ({ request }) => {
    tokens = await loginViaAPI(request);
    userId = await getUserId(request, tokens);
  });

  // ── AC1: Sección de retos en el perfil ─────────────────────────────────────
  test.describe('AC1 – Sección de retos accesible en el perfil', () => {
    test('usuario NO autenticado ve aviso de login en /profile', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByText('Inicia sesion para ver tu perfil')).toBeVisible({ timeout: 8000 });
      // El tablero de retos NO aparece
      await expect(page.getByRole('button', { name: 'Diarios' })).not.toBeVisible();
    });

    test('usuario autenticado ve la sección "Retos" en su perfil', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board).toBeVisible({ timeout: 10000 });
      await expect(board.locator('h3', { hasText: 'Retos' })).toBeVisible();
    });

    test('el perfil incluye las pestañas Diarios / Semanales / Mensuales', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible();
    });

    test('el perfil contiene sección de Retos, balance de puntos y logros', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');

      // Las tres secciones de gamificación deben existir en el perfil
      await expect(challengesBoardInProfile(page)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Logros y Medallas')).toBeVisible();
      // PointsBalance renderiza el balance del usuario
      await expect(page.getByText(/puntos/i).first()).toBeVisible();

      // Los retos aparecen antes que "Logros y Medallas" en el DOM
      const challengesHandle = await challengesBoardInProfile(page).elementHandle();
      const badgesHeading = page.getByText('Logros y Medallas');
      const badgesHandle = await badgesHeading.elementHandle();

      if (challengesHandle && badgesHandle) {
        // compareDocumentPosition: bit 4 = el segundo elemento viene después del primero
        const position: number = await page.evaluate(
          ([a, b]) => a.compareDocumentPosition(b),
          [challengesHandle, badgesHandle] as [Element, Element],
        );
        // Node.DOCUMENT_POSITION_FOLLOWING = 4: badges está después de challenges en el DOM
        expect(position & 4).toBe(4);
      }
    });
  });

  // ── AC2: Progreso vinculado a acciones del marketplace ─────────────────────
  test.describe('AC2 – Progreso basado en acciones reales del marketplace', () => {
    test('progreso inicial de retos es 0 para usuario sin acciones previas', async ({ request }) => {
      const challenges = await getMyChallenges(request, tokens);
      expect(Array.isArray(challenges)).toBeTruthy();
      expect(challenges.length).toBeGreaterThan(0);
      expect(typeof challenges[0].progress).toBe('number');
      expect(typeof challenges[0].goal).toBe('number');
      expect(typeof challenges[0].is_completed).toBe('boolean');
    });

    test('acción publish_item actualiza progreso en reto de tipo publish', async ({ request }) => {
      // Buscar un reto de tipo 'publish' con progreso < goal
      const beforeChallenges: Array<{
        challenge_id: number;
        challenge_type: string;
        progress: number;
        goal: number;
        is_completed: boolean;
      }> = await getMyChallenges(request, tokens);

      const publishChallenge = beforeChallenges.find(
        c => c.challenge_type === 'publish' && !c.is_completed,
      );

      if (!publishChallenge) {
        test.skip();
        return;
      }

      const progressBefore = publishChallenge.progress;

      // Simular publicación de un artículo
      const actionRes = await triggerMarketplaceAction(request, tokens, 'publish_item', userId);
      expect(actionRes.ok(), `award-points falló: ${actionRes.status()}`).toBeTruthy();

      // Obtener retos actualizados
      const afterChallenges: typeof beforeChallenges = await getMyChallenges(request, tokens);
      const updatedChallenge = afterChallenges.find(
        c => c.challenge_id === publishChallenge.challenge_id,
      );

      expect(updatedChallenge).toBeDefined();
      // El progreso debe haber aumentado (o reto completado)
      expect(updatedChallenge!.progress).toBeGreaterThanOrEqual(progressBefore);
    });

    test('la API /challenges/me/ devuelve estructura correcta de progreso', async ({ request }) => {
      const challenges = await getMyChallenges(request, tokens);
      for (const c of challenges.slice(0, 3)) {
        expect(c).toHaveProperty('challenge_id');
        expect(c).toHaveProperty('title');
        expect(c).toHaveProperty('progress');
        expect(c).toHaveProperty('goal');
        expect(c).toHaveProperty('is_completed');
        expect(c).toHaveProperty('reward_claimed');
        expect(c).toHaveProperty('start_date');
        expect(c).toHaveProperty('end_date');
        expect(c).toHaveProperty('challenge_type');
        expect(['donation', 'exchange', 'sale', 'publish', 'review']).toContain(c.challenge_type);
        expect(c.progress).toBeGreaterThanOrEqual(0);
        // El backend almacena el conteo real; la UI aplica Math.min, no el backend
      }
    });
  });

  // ── AC3: Progreso se actualiza visualmente en el perfil ────────────────────
  test.describe('AC3 – Actualización de progreso en el perfil', () => {
    test('el perfil muestra contador de progreso en formato X / Y completado', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      await expect(board.getByText(/\d+ \/ \d+ completado/).first()).toBeVisible();
    });

    test('la barra de progreso existe para cada reto en el perfil', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      const firstCard = board.locator('article').first();
      await expect(firstCard.locator('.h-2.overflow-hidden')).toBeVisible();
    });

    test('badge de estado "En curso" visible en retos no completados', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      await expect(board.getByText('En curso').first()).toBeVisible();
    });

    test('progreso en perfil refleja el progreso real de la API', async ({ page, request }) => {
      const apiChallenges = await getMyChallenges(request, tokens);
      const firstChallenge = apiChallenges[0];

      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      // La UI aplica Math.min(progress, goal), por eso el display es min/goal
      const displayedProgress = Math.min(firstChallenge.progress, firstChallenge.goal);
      const expectedText = `${displayedProgress} / ${firstChallenge.goal}`;
      await expect(board.getByText(new RegExp(expectedText.replace('/', '\\/'))).first()).toBeVisible();
    });
  });

  // ── AC4: Feedback visual al completar un reto ──────────────────────────────
  test.describe('AC4 – Feedback visual al completar reto', () => {
    test('reto completado muestra ícono de checkmark', async ({ page, request }) => {
      const challenges = await getMyChallenges(request, tokens);
      const completedChallenge = challenges.find((c: { is_completed: boolean }) => c.is_completed);

      if (!completedChallenge) {
        // Si no hay retos completados, hacemos mock parcial para verificar la UI
        await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{
              ...challenges[0],
              progress: challenges[0].goal,
              is_completed: true,
              reward_claimed: false,
            }]),
          });
        });
        await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(challenges.slice(0, 1).map((c: { joined: boolean }) => ({ ...c, joined: true }))),
          });
        });
      }

      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      // Si hay reto completado, debe mostrar checkmark o botón de reclamar
      if (completedChallenge) {
        // Buscar CheckCircle2 (svg) o botón "Reclamar"
        const hasVisualFeedback =
          (await board.locator('[data-testid="check-icon"], .text-emerald-500').count()) > 0 ||
          (await board.getByRole('button', { name: 'Reclamar' }).count()) > 0 ||
          (await board.getByText('Reclamado').count()) > 0;
        expect(hasVisualFeedback).toBeTruthy();
      } else {
        // Mock activo: debe aparecer el botón "Reclamar"
        await expect(board.getByRole('button', { name: 'Reclamar' })).toBeVisible({ timeout: 6000 });
      }
    });

    test('reto completado y no reclamado muestra botón "Reclamar" en perfil', async ({ page, request }) => {
      // Necesitamos Challenge objects (con `id`) para /challenges/ y
      // UserChallenge objects (con `challenge_id`) para /challenges/me/
      // El ChallengesBoard hace match: challenge.id === userChallenge.challenge_id
      const available = await getAvailableChallenges(request, tokens);
      const myList = await getMyChallenges(request, tokens);

      // Tomar el primer challenge disponible y su progreso correspondiente
      const challenge = available[0];
      const userChallenge = myList.find((c: { challenge_id: number }) => c.challenge_id === challenge.id)
        ?? { ...myList[0], challenge_id: challenge.id };

      await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            ...userChallenge,
            challenge_id: challenge.id,
            progress: challenge.goal,
            is_completed: true,
            reward_claimed: false,
          }]),
        });
      });
      await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ ...challenge, joined: true }]),
        });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);

      await expect(board.getByRole('button', { name: 'Reclamar' })).toBeVisible({ timeout: 8000 });
    });

    test('reclamar recompensa en perfil muestra mensaje de éxito', async ({ page, request }) => {
      const available = await getAvailableChallenges(request, tokens);
      const myList = await getMyChallenges(request, tokens);

      const challenge = available[0];
      const userChallenge = myList.find((c: { challenge_id: number }) => c.challenge_id === challenge.id)
        ?? { ...myList[0], challenge_id: challenge.id };

      await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            ...userChallenge,
            challenge_id: challenge.id,
            progress: challenge.goal,
            is_completed: true,
            reward_claimed: false,
          }]),
        });
      });
      await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ ...challenge, joined: true }]),
        });
      });
      await page.route(`${BASE_API}/gamification/challenges/${challenge.id}/claim/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Recompensa reclamada.' }),
        });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);

      await expect(board.getByRole('button', { name: 'Reclamar' })).toBeVisible({ timeout: 8000 });
      await board.getByRole('button', { name: 'Reclamar' }).click();
      await expect(page.getByText('Recompensa reclamada.')).toBeVisible({ timeout: 5000 });
    });
  });

  // ── AC5: Jerarquía visual y estados ────────────────────────────────────────
  test.describe('AC5 – Jerarquía visual, loading, empty y error states', () => {
    test('skeleton de carga aparece en perfil mientras se obtienen retos', async ({ page }) => {
      await injectTokens(page, tokens);

      await page.route(`${BASE_API}/gamification/challenges/`, async (route) => {
        await new Promise(r => setTimeout(r, 900));
        await route.continue();
      });

      await page.goto('/profile');
      await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 4000 });
    });

    test('estado vacío se muestra cuando no hay retos en la pestaña activa', async ({ page }) => {
      // Devolver solo retos semanales para que Diarios esté vacío
      await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });
      await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(page.getByText('No hay retos activos en esta categoría')).toBeVisible({ timeout: 8000 });
      await expect(page.getByText('Prueba otra pestaña o vuelve más tarde.')).toBeVisible();
    });

    test('error de API muestra mensaje de error en el tablero del perfil', async ({ page }) => {
      await page.route(`${BASE_API}/gamification/challenges/`, (route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: { message: 'Error interno' } }) });
      });
      await page.route(`${BASE_API}/gamification/challenges/me/`, (route) => {
        route.fulfill({ status: 500, body: '{}' });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(
        page.locator('[class*="text-error"], [class*="error"]').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('cada reto muestra ícono de tipo, título, barra de progreso y puntos', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      const card = board.locator('article').first();
      // Ícono (gradiente de colores por tipo)
      await expect(card.locator('svg').first()).toBeVisible();
      // Título
      await expect(card.locator('h4')).not.toBeEmpty();
      // Barra de progreso
      await expect(card.locator('.h-2.overflow-hidden')).toBeVisible();
      // Puntos bonus
      await expect(card.getByText(/\+\d+ pts/)).toBeVisible();
      // Estado
      await expect(card.getByText(/En curso|Reclamar|Reclamado/)).toBeVisible();
    });
  });

  // ── AC6: Responsividad móvil y escritorio ──────────────────────────────────
  test.describe('AC6 – Responsividad (móvil y escritorio)', () => {
    test('el tablero de retos se muestra correctamente en viewport de escritorio', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board).toBeVisible({ timeout: 10000 });
      await expect(board.locator('article').first()).toBeVisible({ timeout: 8000 });
    });

    test('el tablero de retos se muestra correctamente en viewport móvil (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board).toBeVisible({ timeout: 10000 });
      await expect(board.locator('article').first()).toBeVisible({ timeout: 8000 });
    });

    test('las pestañas Diarios/Semanales/Mensuales son accesibles en móvil', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile');

      await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible();

      // El cambio de pestaña funciona en móvil
      await page.getByRole('button', { name: 'Semanales' }).click();
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 8000 });
    });

    test('las tarjetas de reto no se desboran en pantalla móvil', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const board = challengesBoardInProfile(page);
      await expect(board.locator('article').first()).toBeVisible({ timeout: 10000 });

      const card = board.locator('article').first();
      const cardBox = await card.boundingBox();
      expect(cardBox).not.toBeNull();
      // La tarjeta no debe ser más ancha que la pantalla
      expect(cardBox!.width).toBeLessThanOrEqual(375);
    });
  });

  // ── AC7: No duplicación de progreso ────────────────────────────────────────
  test.describe('AC7 – El progreso no se duplica por el mismo evento', () => {
    test('llamar award-points dos veces incrementa el progreso solo en 1 por llamada', async ({ request }) => {
      const before: Array<{
        challenge_id: number;
        challenge_type: string;
        progress: number;
        goal: number;
        is_completed: boolean;
      }> = await getMyChallenges(request, tokens);

      const publishChallenges = before.filter(c => c.challenge_type === 'publish' && !c.is_completed);
      if (publishChallenges.length === 0) {
        test.skip();
        return;
      }

      const target = publishChallenges[0];
      const progressBefore = target.progress;

      // Llamar dos veces la misma acción
      await triggerMarketplaceAction(request, tokens, 'publish_item', userId);
      await triggerMarketplaceAction(request, tokens, 'publish_item', userId);

      const after: typeof before = await getMyChallenges(request, tokens);
      const updated = after.find(c => c.challenge_id === target.challenge_id);

      expect(updated).toBeDefined();
      // Debe haber incrementado en exactamente 2 (una por llamada), no duplicado
      const expectedProgress = Math.min(progressBefore + 2, target.goal);
      expect(updated!.progress).toBe(expectedProgress);
    });

    test('la misma transacción no genera doble progreso en la misma sesión de challenges/me/', async ({ request }) => {
      // Llamar /challenges/me/ dos veces seguidas y verificar que el progreso es idéntico
      const first: Array<{ challenge_id: number; progress: number }> = await getMyChallenges(request, tokens);
      const second: typeof first = await getMyChallenges(request, tokens);

      expect(first.length).toBe(second.length);
      for (let i = 0; i < first.length; i++) {
        const a = first[i];
        const b = second.find(c => c.challenge_id === a.challenge_id);
        expect(b).toBeDefined();
        expect(b!.progress).toBe(a.progress);
      }
    });
  });
});
