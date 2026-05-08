import { test, expect } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

/**
 * HU-GAM-07 — Points History
 * Route: /profile/points-history
 * Component: PointsHistoryCard
 * Endpoint: GET /api/gamification/points-history/
 */

test.describe('HU-GAM-07: Points History', () => {
  test.describe('authenticated', () => {
    test.use({ storageState: storageStatePath('gam02a') });

    test('1. Happy path: page loads with heading and counter', async ({ page }) => {
      await page.goto('/profile/points-history');
      await expect(page.getByRole('heading', { name: 'Historial de puntos', level: 1 })).toBeVisible();
      await expect(page.getByText(/movimientos totales/i)).toBeVisible();
    });

    test('2. Filter controls are visible (date range, action, order)', async ({ page }) => {
      await page.goto('/profile/points-history');
      await expect(page.getByText('Desde')).toBeVisible();
      await expect(page.getByText('Hasta')).toBeVisible();
      await expect(page.getByText('Accion', { exact: true })).toBeVisible();
      await expect(page.getByText('Orden', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Aplicar filtros' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible();
    });

    test('3. Quick range buttons (7 and 30 days) are clickable', async ({ page }) => {
      await page.goto('/profile/points-history');
      const sevenBtn = page.getByRole('button', { name: /Ultimos 7 dias/i });
      const thirtyBtn = page.getByRole('button', { name: /Ultimos 30 dias/i });
      await expect(sevenBtn).toBeVisible();
      await expect(thirtyBtn).toBeVisible();
      await sevenBtn.click();
      // After click, the date inputs should have values
      const startInput = page.locator('input[type="date"]').first();
      await expect(startInput).not.toHaveValue('');
    });

    test('4. Invalid date range shows validation error', async ({ page }) => {
      await page.goto('/profile/points-history');
      // Wait for the form (auth-only) to mount
      await expect(page.getByRole('button', { name: 'Aplicar filtros' })).toBeVisible();
      const [startInput, endInput] = await page.locator('input[type="date"]').all();
      await startInput.fill('2026-06-01');
      await endInput.fill('2026-01-01');
      await page.getByRole('button', { name: 'Aplicar filtros' }).click();
      await expect(
        page.getByText(/La fecha inicial no puede ser mayor que la fecha final/i),
      ).toBeVisible();
    });

    test('5. Pagination OR empty state is visible', async ({ page }) => {
      // Pagination only renders when there are entries. Empty state renders
      // when there are none. Both are valid UI behaviors for this view.
      await page.goto('/profile/points-history');
      await expect(
        page.getByRole('heading', { name: 'Historial de puntos', level: 1 }),
      ).toBeVisible();
      // Wait for either signal to appear before asserting
      await page
        .locator(
          'button:has-text("Anterior"), :text("No hay movimientos para los filtros seleccionados")',
        )
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {});
      const paginationVisible = await page
        .getByRole('button', { name: 'Anterior' })
        .isVisible()
        .catch(() => false);
      const emptyVisible = await page
        .getByText(/No hay movimientos para los filtros seleccionados/i)
        .isVisible()
        .catch(() => false);
      expect(paginationVisible || emptyVisible).toBeTruthy();
    });

    test('6. "Volver al perfil" link is visible', async ({ page }) => {
      await page.goto('/profile/points-history');
      await expect(page.getByRole('link', { name: /Volver al perfil/i })).toBeVisible();
    });
  });

  test.describe('mocked error state', () => {
    test.use({ storageState: storageStatePath('gam02a') });

    test('7. Backend 500 → error message with "Verifica tus filtros"', async ({ page }) => {
      await page.route('**/api/gamification/points/history/**', route =>
        route.fulfill({ status: 500, body: '{}' }),
      );
      await page.goto('/profile/points-history');
      await expect(page.getByText(/Verifica tus filtros y vuelve a intentar/i)).toBeVisible();
    });
  });

  test.describe('no session', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('8. Unauthenticated user → signin redirect or sign-in prompt', async ({ page }) => {
      await page.goto('/profile/points-history');
      await page.waitForLoadState('load');
      const url = page.url();
      const signinPrompt = await page
        .getByText(/Inicia sesion para ver el historial de puntos/i)
        .isVisible()
        .catch(() => false);
      expect(url.includes('/auth/signin') || signinPrompt).toBeTruthy();
    });
  });
});
