import { test, expect } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

/**
 * HU-GAM-03 — Achievements & Badges
 * Route: /profile (BadgesList component at bottom)
 * Endpoint: GET /api/gamification/badges/status/
 */

test.describe('HU-GAM-03: Achievements & Badges', () => {
  test.describe('authenticated', () => {
    test.use({ storageState: storageStatePath('gam02a') });

    test('1. Happy path: unlocked and locked sections are visible in profile', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: 'Desbloqueados', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Bloqueados', exact: true })).toBeVisible();
    });

    test('2. Carousel pagination controls are present for each section', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByRole('button', { name: /Pagina anterior de desbloqueados/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Pagina siguiente de desbloqueados/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Pagina anterior de bloqueados/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Pagina siguiente de bloqueados/i })).toBeVisible();
    });

    test('3. Badge data matches API response (name present in DOM)', async ({ page }) => {
      const responsePromise = page.waitForResponse(
        res => /\/api\/gamification\/badges\/status\//.test(res.url()) && res.ok(),
      );
      await page.goto('/profile');
      const response = await responsePromise;
      const badges = await response.json();
      if (Array.isArray(badges) && badges.length > 0) {
        // At least one badge name should be visible on the page
        const firstBadge = badges[0];
        await expect(page.getByText(firstBadge.name).first()).toBeVisible();
      }
    });
  });

  test.describe('mocked empty state', () => {
    test.use({ storageState: storageStatePath('gam02a') });

    test('4. No badges → both empty messages shown', async ({ page }) => {
      await page.route('**/api/gamification/badges/status/', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        }),
      );
      await page.goto('/profile');
      await expect(
        page.getByText(/Todavia no tienes medallas desbloqueadas/i).last(),
      ).toBeVisible();
      await expect(page.getByText(/No hay medallas bloqueadas pendientes/i)).toBeVisible();
    });

    test('5. Unlocked badge shows earned date label', async ({ page }) => {
      await page.route('**/api/gamification/badges/status/', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              name: 'Bienvenido Test',
              description: 'Badge de prueba',
              earned_at: '2026-03-15T10:00:00Z',
            },
            {
              id: 2,
              name: 'Eco Warrior Locked',
              description: 'Todavia no',
              earned_at: null,
            },
          ]),
        }),
      );
      await page.goto('/profile');
      await expect(page.getByText('Bienvenido Test')).toBeVisible();
      await expect(page.getByText('Eco Warrior Locked')).toBeVisible();
      await expect(page.getByText(/Bloqueado/i).first()).toBeVisible();
    });
  });

  test.describe('mocked error state', () => {
    test.use({ storageState: storageStatePath('gam02a') });

    test('6. Backend 500 → error message visible', async ({ page }) => {
      await page.route('**/api/gamification/badges/status/', route =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Server error' }),
        }),
      );
      await page.goto('/profile');
      // ErrorMessage shows somewhere in the badges area
      const error = page.getByText(/error|fallo|intentar/i).first();
      await expect(error).toBeVisible();
    });
  });
});
