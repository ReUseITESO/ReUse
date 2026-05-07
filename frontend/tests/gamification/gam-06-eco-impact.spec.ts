import { test, expect } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

/**
 * HU-GAM-06 — Eco Impact
 * Endpoint: GET /api/gamification/impact/
 *   => { items_reused, co2_avoided, community_average_items, community_average_co2 }
 * UI: EcoImpactCard (/profile only)
 *
 * Known bug (to be confirmed by tests and documented):
 *   - Frontend type UserImpact declares `items_saved_from_waste` but
 *     backend serializer does NOT return that field.
 */

test.describe('HU-GAM-06: Eco Impact', () => {
  test.describe('beginner user (zero state)', () => {
    test.use({ storageState: storageStatePath('beginner') });

    test('1. User with no impact → zeros without crash', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-card')).toBeVisible();
      await expect(page.getByTestId('eco-impact-items')).toHaveText('0');
      await expect(page.getByTestId('eco-impact-co2')).toHaveText('0 kg');
      // community_average_items is a non-negative float (aggregated across all users)
      const avg = await page.getByTestId('eco-impact-community-avg').innerText();
      expect(parseFloat(avg)).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('champion user (10 items, 25 kg CO2)', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('2. UI numbers equal API response exactly', async ({ page }) => {
      let api: any = null;
      page.on('response', async res => {
        if (res.url().includes('/api/gamification/impact/') && res.ok()) {
          api = await res.json();
        }
      });
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-card')).toBeVisible();

      expect(api).not.toBeNull();
      await expect(page.getByTestId('eco-impact-items')).toHaveText(String(api.items_reused));
      await expect(page.getByTestId('eco-impact-co2')).toHaveText(`${api.co2_avoided} kg`);
      await expect(page.getByTestId('eco-impact-community-avg')).toHaveText(
        String(api.community_average_items),
      );
    });

    test('3. CO2 shows "kg" suffix', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-co2')).toContainText('kg');
    });

    test('4. Community average is non-negative', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      const avg = parseFloat(await page.getByTestId('eco-impact-community-avg').innerText());
      expect(avg).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('mocked edge cases', () => {
    test.use({ storageState: storageStatePath('beginner') });

    test('5. Singular vs plural label for items_reused (1 vs N)', async ({ page }) => {
      // Singular
      await page.route('**/api/gamification/impact/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items_reused: 1,
            co2_avoided: 2.5,
            community_average_items: 3,
            community_average_co2: 5,
          }),
        }),
      );
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-hero-label')).toHaveText('1 item reutilizado');

      // Plural
      await page.unroute('**/api/gamification/impact/');
      await page.route('**/api/gamification/impact/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items_reused: 5,
            co2_avoided: 12.5,
            community_average_items: 3,
            community_average_co2: 5,
          }),
        }),
      );
      await page.reload({ waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-hero-label')).toHaveText('5 items reutilizados');
    });

    test('6. CO2 value respects 2-decimal rounding from backend', async ({ page }) => {
      await page.route('**/api/gamification/impact/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items_reused: 3,
            co2_avoided: 1.25, // backend already rounds to 2 decimals
            community_average_items: 1,
            community_average_co2: 2.5,
          }),
        }),
      );
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-co2')).toHaveText('1.25 kg');
    });

    test('7. Backend error → retry button visible and clickable', async ({ page }) => {
      await page.route('**/api/gamification/impact/', r => r.fulfill({ status: 500, body: '{}' }));
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('eco-impact-error')).toBeVisible();
      const retry = page.getByTestId('eco-impact-retry');
      await expect(retry).toBeVisible();
      await expect(retry).toBeEnabled();
    });
  });
});
