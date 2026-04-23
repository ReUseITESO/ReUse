/**
 * E2E tests – HU-GAM-04: User unlocks badges based on milestone achievements
 * Domain: Gamification | Page: /profile
 *
 * Cubre los criterios de aceptación de la historia:
 *  AC1 – Feature accesible solo para usuarios autenticados
 *  AC2 – Funcionalidad principal: badges desbloqueados y bloqueados visibles
 *  AC3 – Feedback apropiado al usuario (fecha de desbloqueo, estado)
 *  AC4 – Manejo de errores
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUnlockedBadge = {
  id: 1,
  name: 'Bienvenido',
  description: 'Completaste tu primer intercambio en la plataforma.',
  icon_url: '',
  rarity: 'common',
  points: 10,
  earned_at: '2026-03-01T10:00:00Z',
};

const mockLockedBadge = {
  id: 2,
  name: 'Eco Guerrero',
  description: 'Completa 10 donaciones para desbloquear esta medalla.',
  icon_url: '',
  rarity: 'rare',
  points: 50,
  earned_at: null,
};

const mockTopBadge = {
  id: 3,
  name: 'Top Vendedor',
  description: 'Alcanza 100 puntos de ventas.',
  icon_url: '',
  rarity: 'epic',
  points: 100,
  earned_at: null,
};

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

async function mockBadgesAPI(page: Page, badges = [mockUnlockedBadge, mockLockedBadge, mockTopBadge]) {
  await page.route('**/api/gamification/badges/status/', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(badges),
    });
  });
}

function badgesSection(page: Page) {
  return page.locator('section').filter({ has: page.locator('h2', { hasText: 'Logros y Medallas' }) });
}

// ─── Suite ────────────────────────────────────────────────────────────────────

test.describe('HU-GAM-04 – Desbloqueo de Medallas', () => {
  test.describe.configure({ mode: 'serial' });

  let tokens: { access: string; refresh: string };

  test.beforeAll(async ({ request }) => {
    tokens = await loginViaAPI(request);
  });

  // ── AC1: Acceso autorizado ─────────────────────────────────────────────────

  test.describe('AC1 – Feature accesible solo para usuarios autenticados', () => {
    test('usuario NO autenticado ve aviso de login en /profile', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByText('Inicia sesion para ver tu perfil')).toBeVisible({ timeout: 8000 });
      await expect(page.getByText('Logros y Medallas')).not.toBeVisible();
    });

    test('usuario autenticado ve la sección "Logros y Medallas" en su perfil', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      await expect(badgesSection(page)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Logros y Medallas')).toBeVisible();
    });
  });

  // ── AC2: Funcionalidad principal ───────────────────────────────────────────

  test.describe('AC2 – Badges desbloqueados y bloqueados visibles', () => {
    test('la sección muestra subsección "Desbloqueados" y "Bloqueados"', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('Desbloqueados')).toBeVisible({ timeout: 10000 });
      await expect(section.getByText('Bloqueados')).toBeVisible();
    });

    test('badge desbloqueado aparece con su nombre y fecha de desbloqueo', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('Bienvenido')).toBeVisible({ timeout: 10000 });
      // Fecha de desbloqueo formateada
      await expect(section.getByText(/mar\.|ene\.|feb\.|abr\.|may\./i).first()).toBeVisible();
    });

    test('badge bloqueado aparece con etiqueta "Bloqueado"', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('Bloqueado').first()).toBeVisible({ timeout: 10000 });
    });

    test('badge bloqueado muestra su nombre y descripción', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('Eco Guerrero')).toBeVisible({ timeout: 10000 });
      await expect(section.getByText(/donaciones/i)).toBeVisible();
    });

    test('la API real devuelve estructura correcta de badges', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/badges/status/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      expect(res.ok()).toBeTruthy();
      const badges = await res.json();
      expect(Array.isArray(badges)).toBeTruthy();
      if (badges.length > 0) {
        const badge = badges[0];
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('points');
        expect(badge).toHaveProperty('earned_at');
      }
    });

    test('badges desbloqueados se ordenan por fecha más reciente primero', async ({ page }) => {
      const olderBadge = { ...mockUnlockedBadge, id: 10, name: 'Novato', earned_at: '2026-01-01T00:00:00Z' };
      const newerBadge = { ...mockUnlockedBadge, id: 11, name: 'Bienvenido', earned_at: '2026-03-15T00:00:00Z' };
      await injectTokens(page, tokens);
      await mockBadgesAPI(page, [olderBadge, newerBadge, mockLockedBadge]);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('Bienvenido')).toBeVisible({ timeout: 10000 });
      await expect(section.getByText('Novato')).toBeVisible();
      // Bienvenido (más reciente) debe aparecer antes que Novato en el DOM
      const bienvenidoIndex = await section.getByText('Bienvenido').first().evaluate(el =>
        Array.from(document.querySelectorAll('h3')).indexOf(el as HTMLHeadingElement)
      );
      const novatoIndex = await section.getByText('Novato').first().evaluate(el =>
        Array.from(document.querySelectorAll('h3')).indexOf(el as HTMLHeadingElement)
      );
      expect(bienvenidoIndex).toBeLessThan(novatoIndex);
    });
  });

  // ── AC3: Feedback apropiado al usuario ────────────────────────────────────

  test.describe('AC3 – Feedback apropiado al usuario', () => {
    test('spinner aparece mientras se cargan los badges', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.route('**/api/gamification/badges/status/', async (route) => {
        await new Promise(r => setTimeout(r, 800));
        await route.continue();
      });
      await page.goto('/profile');
      await expect(page.locator('.animate-spin, .animate-pulse').first()).toBeVisible({ timeout: 4000 });
    });

    test('badge desbloqueado muestra indicador visual activo (punto verde)', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.locator('.bg-success').first()).toBeVisible({ timeout: 10000 });
    });

    test('badge bloqueado tiene estilo visual diferenciado (grayscale)', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.locator('.grayscale').first()).toBeVisible({ timeout: 10000 });
    });

    test('estado vacío en desbloqueados muestra mensaje apropiado', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page, [mockLockedBadge]);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('Todavia no tienes medallas desbloqueadas.')).toBeVisible({ timeout: 10000 });
    });

    test('estado vacío en bloqueados muestra mensaje apropiado', async ({ page }) => {
      await injectTokens(page, tokens);
      await mockBadgesAPI(page, [mockUnlockedBadge]);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText('No hay medallas bloqueadas pendientes.')).toBeVisible({ timeout: 10000 });
    });

    test('los badges muestran paginación cuando hay más de 4', async ({ page }) => {
      const manyBadges = Array.from({ length: 6 }, (_, i) => ({
        ...mockLockedBadge,
        id: i + 1,
        name: `Badge ${i + 1}`,
        earned_at: null,
      }));
      await injectTokens(page, tokens);
      await mockBadgesAPI(page, manyBadges);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });
    });
  });

  // ── AC4: Manejo de errores ─────────────────────────────────────────────────

  test.describe('AC4 – Manejo de errores', () => {
    test('error de API muestra mensaje de error en la sección de medallas', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.route('**/api/gamification/badges/status/', (route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) });
      });
      await page.goto('/profile');
      await expect(
        page.locator('[class*="error"], [class*="text-error"]').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('token inválido no muestra la sección de medallas', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('reuse_access_token', 'token-invalido');
        localStorage.setItem('reuse_refresh_token', 'refresh-invalido');
      });
      await page.goto('/profile');
      await expect(page.getByText('Inicia sesion para ver tu perfil')).toBeVisible({ timeout: 10000 });
    });

    test('la sección de medallas se muestra en viewport móvil (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await mockBadgesAPI(page);
      await page.goto('/profile');
      const section = badgesSection(page);
      await expect(section).toBeVisible({ timeout: 10000 });
      const box = await section.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(375);
    });
  });
});