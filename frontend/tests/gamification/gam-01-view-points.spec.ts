import { test, expect } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

/**
 * HU-GAM-01 — View Points
 * Endpoint: GET /api/gamification/points/ => { points: N }
 * UI: PointsBalance component (/profile, /dashboard)
 *
 * Note: PointsBalance renders the number from `levelProgression.points`
 * (via useLevelProgression), not from useUserPoints. Tests validate both.
 */

test.describe('HU-GAM-01: View Points', () => {
  test.describe('authenticated (champion, 300 pts)', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('1. Happy path: PointsBalance card visible on /profile', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      const card = page.getByTestId('points-balance-card');
      await expect(card).toBeVisible();
      const total = page.getByTestId('points-balance-total');
      await expect(total).toBeVisible();
      await expect(total).toHaveText(/^\d[\d,]*$/);
    });

    test('2. UI points equal API /points/ response (Bug #1 fixed: PointsBalance now consumes /points/)', async ({
      page,
    }) => {
      // Previously PointsBalance read points from /level-progression/ while
      // the dedicated /points/ endpoint was never consumed. Fixed by switching
      // the component to useUserPoints. This test asserts that /points/ is
      // now called and that the UI matches its response.
      const pointsResponsePromise = page.waitForResponse(
        (res) => /\/api\/gamification\/points\/(\?|$)/.test(res.url()) && res.ok(),
      );
      await page.goto('/profile');
      const pointsResponse = await pointsResponsePromise;
      const apiPoints = (await pointsResponse.json()).points;

      await expect(page.getByTestId('points-balance-total')).toBeVisible();
      const uiText = (await page.getByTestId('points-balance-total').innerText()).trim();
      const uiNumber = parseInt(uiText.replace(/,/g, ''), 10);
      expect(uiNumber).toBe(apiPoints);
      expect(uiNumber).toBeGreaterThanOrEqual(0);
    });

    test('3. Dashboard also shows PointsBalance', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('points-balance-card')).toBeVisible();
      const text = (await page.getByTestId('points-balance-total').innerText()).trim();
      expect(parseInt(text.replace(/,/g, ''), 10)).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('no session', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('4. Unauthenticated → signin redirect OR warning panel', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      const url = page.url();
      const showsSigninCta = await page
        .getByText(/Inicia sesion/i)
        .first()
        .isVisible()
        .catch(() => false);
      expect(url.includes('/auth/signin') || showsSigninCta).toBeTruthy();
    });
  });

  test.describe('mocked error states', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('5. Backend 500 → "Reintentar" button visible', async ({ page }) => {
      await page.route('**/api/gamification/points/', (r) =>
        r.fulfill({ status: 500, body: '{}' }),
      );
      await page.goto('/profile');
      await expect(page.getByTestId('points-balance-error')).toBeVisible();
      const retry = page.getByTestId('points-balance-retry');
      await expect(retry).toBeVisible();
      await expect(retry).toBeEnabled();
    });

    test('6. es-MX localized number (thousands separator for >= 1000)', async ({ page }) => {
      await page.route('**/api/gamification/points/', (r) =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ points: 1500 }),
        }),
      );
      await page.goto('/profile');
      await expect(page.getByTestId('points-balance-total')).toHaveText('1,500');
    });
  });
});
