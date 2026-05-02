/**
 * E2E tests – HU-GAM-02A: Point actions
 * Domain: Gamification | Page: /profile/points-history
 *
 * Criterios de aceptación cubiertos:
 *  AC1  – Página de historial accesible desde el perfil
 *  AC2  – Tabla de transacciones con columnas correctas
 *  AC3  – Filtro por tipo de acción
 *  AC4  – Filtro por rango de fechas válido
 *  AC5  – Error de validación cuando start_date > end_date
 *  AC6  – Rangos rápidos "Últimos 7/30 días"
 *  AC7  – Ordenamiento por fecha y puntos
 *  AC8  – Paginación funcional
 *  AC9  – Estado vacío cuando no hay movimientos
 *  AC10 – Spinner de carga
 *  AC11 – Mensaje de error cuando la API falla
 *  AC12 – Usuario no autenticado ve aviso de login
 *  AC13 – Vista mobile muestra cards en lugar de tabla
 *
 * Prerequisitos:
 *   Backend:  http://localhost:8000  (docker compose up db backend)
 *   Frontend: http://localhost:3000  (npm run dev)
 *   Seed ejecutado: python manage.py seed_dev_data
 *   Usuario: jose.chavez@iteso.mx / ReUse2026!
 */

import fs from 'fs';
import path from 'path';
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

const BASE_API = 'http://localhost:8000/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readStoredTokens(userKey: string): { access: string; refresh: string } {
  const state = JSON.parse(fs.readFileSync(storageStatePath(userKey), 'utf-8'));
  const ls: { name: string; value: string }[] = state.origins[0].localStorage;
  return {
    access: ls.find(e => e.name === 'reuse_access_token')!.value,
    refresh: ls.find(e => e.name === 'reuse_refresh_token')!.value,
  };
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

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('HU-GAM-02A – Historial de acciones de puntos', () => {
  test.describe.configure({ mode: 'serial' });

  let tokens: { access: string; refresh: string };
  let userId: number;

  test.beforeAll(async ({ request }) => {
    tokens = readStoredTokens('gam02a');
    userId = await getUserId(request, tokens);
    // Garantizar al menos transacciones de distintas acciones
    await awardPoints(request, tokens, 'publish_item', userId);
    await awardPoints(request, tokens, 'complete_donation', userId);
    await awardPoints(request, tokens, 'complete_sale', userId);
  });

  // ── AC1: Acceso desde el perfil ───────────────────────────────────────────
  test.describe('AC1 – Página de historial accesible desde el perfil', () => {
    test('el link "Ver todo el historial" navega a /profile/points-history', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile');
      const link = page.getByRole('link', { name: /ver todo el historial/i });
      await expect(link).toBeVisible({ timeout: 10000 });
      await link.click();
      await expect(page).toHaveURL('/profile/points-history', { timeout: 8000 });
    });

    test('la página muestra título "Historial de puntos" y contador de movimientos', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.getByRole('heading', { name: /historial de puntos/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/movimientos totales/i)).toBeVisible();
    });

    test('el botón "Volver al perfil" navega de regreso a /profile', async ({ page }) => {
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await page.getByRole('link', { name: /volver al perfil/i }).click();
      await expect(page).toHaveURL('/profile', { timeout: 8000 });
    });
  });

  // ── AC2: Tabla de transacciones ───────────────────────────────────────────
  test.describe('AC2 – Tabla de transacciones con columnas correctas (desktop)', () => {
    test('la tabla tiene las columnas: Fecha y hora, Acción, Asociado, Puntos', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await expect(page.getByRole('columnheader', { name: 'Fecha y hora' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('columnheader', { name: 'Acción' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Asociado' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Puntos' })).toBeVisible();
    });

    test('la tabla contiene al menos una fila de transacción', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
    });

    test('los puntos positivos se muestran con signo + y color verde', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('td.text-emerald-700').first()).toBeVisible();
    });
  });

  // ── AC3: Filtro por tipo de acción ────────────────────────────────────────
  test.describe('AC3 – Filtro por tipo de acción', () => {
    test('filtrar por publish_item muestra solo entradas con "Publicacion de articulo"', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.locator('select').filter({ hasText: 'Todas las acciones' }).selectOption('publish_item');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();

      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

      const rows = page.locator('tbody tr');
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i).getByText('Publicar artículo')).toBeVisible();
      }
    });

    test('filtrar por complete_donation muestra solo entradas de donación', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.locator('select').filter({ hasText: 'Todas las acciones' }).selectOption('complete_donation');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();

      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

      const rows = page.locator('tbody tr');
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i).getByText('Donación completada')).toBeVisible();
      }
    });

    test('limpiar filtros restaura todas las transacciones', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.locator('select').filter({ hasText: 'Todas las acciones' }).selectOption('publish_item');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });
      const filteredCount = await page.locator('tbody tr').count();

      await page.getByRole('button', { name: 'Limpiar' }).click();
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });
      const allCount = await page.locator('tbody tr').count();
      expect(allCount).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  // ── AC4: Filtro por rango de fechas ───────────────────────────────────────
  test.describe('AC4 – Filtro por rango de fechas válido', () => {
    test('filtrar por últimos 7 días devuelve solo transacciones recientes', async ({ page, request }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);

      await page.locator('input[type="date"]').first().fill(toIsoDate(sevenDaysAgo));
      await page.locator('input[type="date"]').last().fill(toIsoDate(today));
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();

      const res = await request.get(
        `${BASE_API}/gamification/points/history/?start_date=${toIsoDate(sevenDaysAgo)}&end_date=${toIsoDate(today)}`,
        { headers: { Authorization: `Bearer ${tokens.access}` } },
      );
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toHaveProperty('results');
    });
  });

  // ── AC5: Error de validación start_date > end_date ────────────────────────
  test.describe('AC5 – Error cuando start_date es mayor que end_date', () => {
    test('muestra mensaje de error de validación en la UI', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      const future = toIsoDate(new Date(Date.now() + 7 * 86400000));
      const past = toIsoDate(new Date(Date.now() - 7 * 86400000));

      await page.locator('input[type="date"]').first().fill(future);
      await page.locator('input[type="date"]').last().fill(past);

      await expect(
        page.getByText('La fecha inicial no puede ser mayor que la fecha final.')
      ).toBeVisible({ timeout: 5000 });
    });

    test('el botón "Aplicar filtros" no llama la API cuando hay error de rango', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      let apiCalled = false;
      await page.route(`${BASE_API}/gamification/points/history/**`, (route) => {
        apiCalled = true;
        route.continue();
      });

      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await page.waitForLoadState('networkidle');
      apiCalled = false;

      const future = toIsoDate(new Date(Date.now() + 7 * 86400000));
      const past = toIsoDate(new Date(Date.now() - 7 * 86400000));
      await page.locator('input[type="date"]').first().fill(future);
      await page.locator('input[type="date"]').last().fill(past);
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();

      await page.waitForTimeout(500);
      expect(apiCalled).toBe(false);
    });
  });

  // ── AC6: Rangos rápidos ───────────────────────────────────────────────────
  test.describe('AC6 – Rangos rápidos "Últimos 7/30 días"', () => {
    test('"Últimos 7 días" rellena las fechas y aplica filtro', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.getByRole('button', { name: 'Ultimos 7 dias' }).click();

      const startInput = page.locator('input[type="date"]').first();
      const endInput = page.locator('input[type="date"]').last();
      const startVal = await startInput.inputValue();
      const endVal = await endInput.inputValue();

      expect(startVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(endVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(endVal).getTime() - new Date(startVal).getTime()).toBe(6 * 86400000);
    });

    test('"Últimos 30 días" rellena las fechas y aplica filtro', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.getByRole('button', { name: 'Ultimos 30 dias' }).click();

      const startVal = await page.locator('input[type="date"]').first().inputValue();
      const endVal = await page.locator('input[type="date"]').last().inputValue();
      expect(new Date(endVal).getTime() - new Date(startVal).getTime()).toBe(29 * 86400000);
    });
  });

  // ── AC7: Ordenamiento ─────────────────────────────────────────────────────
  test.describe('AC7 – Ordenamiento por fecha y puntos', () => {
    test('ordenar por "Fecha: más reciente" coloca la transacción más nueva primero', async ({ page, request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/history/?ordering=-created_at`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const data = await res.json();
      if (data.results.length < 2) { test.skip(); return; }

      const first = new Date(data.results[0].created_at).getTime();
      const second = new Date(data.results[1].created_at).getTime();
      expect(first).toBeGreaterThanOrEqual(second);
    });

    test('ordenar por "Fecha: más antigua" coloca la transacción más vieja primero', async ({ page, request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/history/?ordering=created_at`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const data = await res.json();
      if (data.results.length < 2) { test.skip(); return; }

      const first = new Date(data.results[0].created_at).getTime();
      const second = new Date(data.results[1].created_at).getTime();
      expect(first).toBeLessThanOrEqual(second);
    });

    test('el select de orden cambia los resultados al aplicar filtros', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.locator('select').filter({ hasText: 'Fecha: más reciente' }).selectOption('created_at');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });
    });
  });

  // ── AC8: Paginación ───────────────────────────────────────────────────────
  test.describe('AC8 – Paginación', () => {
    test('la UI muestra el número de página actual', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Pagina 1')).toBeVisible();
    });

    test('el botón "Anterior" está deshabilitado en la primera página', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    });

    test('la API devuelve estructura paginada correcta', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/history/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBeTruthy();
      expect(typeof data.count).toBe('number');
    });
  });

  // ── AC9: Estado vacío ─────────────────────────────────────────────────────
  test.describe('AC9 – Estado vacío sin movimientos', () => {
    test('muestra "No hay movimientos" cuando la API devuelve resultados vacíos', async ({ page }) => {
      await page.route(`${BASE_API}/gamification/points/history/**`, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
        });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(
        page.getByText('No hay movimientos para los filtros seleccionados.')
      ).toBeVisible({ timeout: 8000 });
    });

    test('el botón "Quitar filtros" en estado vacío llama a handleClearFilters', async ({ page }) => {
      let callCount = 0;
      await page.route(`${BASE_API}/gamification/points/history/**`, (route) => {
        callCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
        });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.getByRole('button', { name: 'Quitar filtros' })).toBeVisible({ timeout: 8000 });
      await page.getByRole('button', { name: 'Quitar filtros' }).click();
      expect(callCount).toBeGreaterThanOrEqual(2);
    });
  });

  // ── AC10: Estado de carga ─────────────────────────────────────────────────
  test.describe('AC10 – Spinner de carga', () => {
    test('muestra spinner mientras se cargan los movimientos', async ({ page }) => {
      await injectTokens(page, tokens);

      await page.route(`${BASE_API}/gamification/points/history/**`, async (route) => {
        await new Promise(r => setTimeout(r, 900));
        await route.continue();
      });

      await page.goto('/profile/points-history');
      await expect(page.getByText(/cargando movimientos/i)).toBeVisible({ timeout: 4000 });
    });
  });

  // ── AC11: Error de API ────────────────────────────────────────────────────
  test.describe('AC11 – Mensaje de error cuando la API falla', () => {
    test('muestra mensaje de error cuando /points/history/ retorna 500', async ({ page }) => {
      await page.route(`${BASE_API}/gamification/points/history/**`, (route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Error interno' }) });
      });

      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.locator('[class*="text-red"], [class*="error"], [class*="ErrorMessage"]').first()).toBeVisible({ timeout: 8000 });
    });
  });

  // ── AC12: Usuario no autenticado ──────────────────────────────────────────
  test.describe('AC12 – Usuario no autenticado', () => {
    test('sin token muestra aviso de login en /profile/points-history', async ({ page }) => {
      await page.goto('/profile/points-history');
      await expect(
        page.getByText(/inicia sesion para ver el historial/i)
      ).toBeVisible({ timeout: 8000 });
    });

    test('la API /points/history/ retorna 401 sin token', async ({ request }) => {
      const res = await request.get(`${BASE_API}/gamification/points/history/`);
      expect(res.status()).toBe(401);
    });
  });

  // ── AC14: Etiquetas de acciones con acentos correctos ────────────────────
  test.describe('AC14 – Etiquetas de acciones con ortografía correcta', () => {
    test('las opciones del filtro tienen acentos correctos', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      const select = page.locator('select').filter({ hasText: 'Todas las acciones' });
      await expect(select).toBeVisible({ timeout: 10000 });

      await expect(select.locator('option', { hasText: 'Publicar artículo' })).toBeAttached();
      await expect(select.locator('option', { hasText: 'Donación completada' })).toBeAttached();
      await expect(select.locator('option', { hasText: 'Reseña positiva' })).toBeAttached();
      await expect(select.locator('option', { hasText: 'Deducción de puntos' })).toBeAttached();
    });

    test('las etiquetas en la tabla tienen acentos correctos', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await awardPoints(await page.context().request, tokens, 'receive_positive_review', userId);
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      const bodyText = await page.locator('tbody').textContent();
      expect(bodyText).toMatch(/Reseña/);
    });

    test('la etiqueta de la tabla coincide con la del filtro para publish_item', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');

      await page.locator('select').filter({ hasText: 'Todas las acciones' }).selectOption('publish_item');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

      const filterLabel = await page.locator('select option[value="publish_item"]').textContent();
      const tableLabel = await page.locator('tbody tr').first().locator('td').nth(1).textContent();

      expect(tableLabel?.trim()).toBe(filterLabel?.trim());
    });
  });

  // ── AC15: Parámetros enviados a la API ────────────────────────────────────
  test.describe('AC15 – Filtros envían parámetros correctos a la API', () => {
    test('filtrar por acción envía ?action= en el request', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      let capturedUrl = '';
      await page.route(`${BASE_API}/gamification/points/history/**`, async (route) => {
        capturedUrl = route.request().url();
        await route.continue();
      });

      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await page.waitForLoadState('networkidle');

      await page.locator('select').filter({ hasText: 'Todas las acciones' }).selectOption('publish_item');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();
      await page.waitForTimeout(800);

      expect(capturedUrl).toContain('action=publish_item');
    });

    test('filtrar por fechas envía start_date y end_date en el request', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      let capturedUrl = '';
      await page.route(`${BASE_API}/gamification/points/history/**`, async (route) => {
        capturedUrl = route.request().url();
        await route.continue();
      });

      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await page.waitForLoadState('networkidle');

      const today = toIsoDate(new Date());
      await page.locator('input[type="date"]').first().fill(today);
      await page.locator('input[type="date"]').last().fill(today);
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();
      await page.waitForTimeout(800);

      expect(capturedUrl).toContain('start_date=');
      expect(capturedUrl).toContain('end_date=');
    });
  });

  // ── AC16: Consistencia de puntos ─────────────────────────────────────────
  test.describe('AC16 – Consistencia entre total de puntos y suma del historial', () => {
    test('la suma de puntos del historial es igual al total reportado por /points/', async ({ request }) => {
      const pointsRes = await request.get(`${BASE_API}/gamification/points/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const { points: totalPoints } = await pointsRes.json();

      let sumFromHistory = 0;
      let nextUrl: string | null = `${BASE_API}/gamification/points/history/`;

      while (nextUrl) {
        const pageRes = await request.get(nextUrl, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const data = await pageRes.json();
        for (const entry of data.results) {
          sumFromHistory += entry.points;
        }
        nextUrl = data.next;
      }

      expect(sumFromHistory).toBe(totalPoints);
    });
  });

  // ── AC17: Filtro por fecha mismo día ──────────────────────────────────────
  test.describe('AC17 – Filtro por fecha mismo día', () => {
    test('start_date y end_date iguales devuelve transacciones de ese día', async ({ request }) => {
      await awardPoints(request, tokens, 'publish_item', userId);
      const today = toIsoDate(new Date());

      const res = await request.get(
        `${BASE_API}/gamification/points/history/?start_date=${today}&end_date=${today}`,
        { headers: { Authorization: `Bearer ${tokens.access}` } },
      );
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.results.length).toBeGreaterThan(0);

      for (const entry of data.results) {
        const entryDate = entry.created_at.slice(0, 10);
        expect(entryDate).toBe(today);
      }
    });
  });

  // ── AC13: Vista mobile ────────────────────────────────────────────────────
  test.describe('AC13 – Vista mobile muestra cards en lugar de tabla', () => {
    test('en 375px la tabla está oculta y las cards son visibles', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.locator('.md\\:hidden').first()).toBeVisible({ timeout: 10000 });
      const table = page.locator('table');
      const tableVisible = await table.isVisible().catch(() => false);
      expect(tableVisible).toBe(false);
    });

    test('las cards mobile muestran fecha, acción y puntos', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.locator('.md\\:hidden').first()).toBeVisible({ timeout: 10000 });

      const firstCard = page.locator('.md\\:hidden > div').first();
      await expect(firstCard).toBeVisible({ timeout: 8000 });
      await expect(firstCard.getByText(/puntos/i)).toBeVisible();
    });

    test('los filtros son accesibles en mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await injectTokens(page, tokens);
      await page.goto('/profile/points-history');
      await expect(page.getByRole('button', { name: 'Aplicar filtros' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible();
    });
  });
});
