import { test, expect } from '@playwright/test';
import { storageStatePath } from './fixtures/auth';

/**
 * HU-GAM-08 — Level Progression
 * Endpoint: GET /api/gamification/level-progression/
 * UI: FeaturedGamificationCard (/profile)
 *
 * Levels: Beginner Reuser (0), Active Reuser (100), Eco Champion (250),
 *         Sustainability Leader (500)
 */

test.describe('HU-GAM-08: Level Progression', () => {
  test.describe('with beginner user (0 pts)', () => {
    test.use({ storageState: storageStatePath('beginner') });

    test('1. Beginner → name, progress bar 0%, points_to_next 100', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('level-current-name')).toHaveText('Beginner Reuser');
      const bar = page.getByTestId('level-progress-bar');
      await expect(bar).toHaveAttribute('data-progress', '0');
      await expect(page.getByTestId('level-points-to-next')).toHaveText('100');
    });
  });

  test.describe('off-by-one boundary: user with EXACTLY 100 points', () => {
    test.use({ storageState: storageStatePath('active') });

    test('2. 100 pts exactos → "Active Reuser" (NOT Beginner)', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      // The critical off-by-one assertion: 100 must be Active, not Beginner
      await expect(page.getByTestId('level-current-name')).toHaveText('Active Reuser');
      // Progress to next should just be starting
      await expect(page.getByTestId('level-points-to-next')).toHaveText('150');
    });

    test('3. 100 pts → progress bar between 0 and 100 (not NaN, not negative)', async ({
      page,
    }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      const bar = page.getByTestId('level-progress-bar');
      const progress = await bar.getAttribute('data-progress');
      const value = Number(progress);
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  test.describe('champion user (300 pts)', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('4. 300 pts → "Eco Champion", next is "Sustainability Leader"', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('level-current-name')).toHaveText('Eco Champion');
      await expect(page.getByTestId('level-progress-label')).toContainText('Sustainability Leader');
    });
  });

  test.describe('leader user (600 pts, max level)', () => {
    test.use({ storageState: storageStatePath('leader') });

    test('5. Max level → "Nivel máximo alcanzado", no "points to next" text', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('level-current-name')).toHaveText('Sustainability Leader');
      await expect(page.getByTestId('level-progress-label')).toHaveText('Nivel máximo alcanzado');
      await expect(page.getByTestId('level-progress-bar')).toHaveAttribute('data-progress', '100');
      // "points to next" element should NOT be rendered when is_max_level
      await expect(page.getByTestId('level-points-to-next')).toHaveCount(0);
    });
  });

  test.describe('UI vs API consistency', () => {
    test.use({ storageState: storageStatePath('champion') });

    test('6. UI level name and points_to_next_level match API response', async ({ page }) => {
      let api: any = null;
      page.on('response', async res => {
        if (res.url().includes('/api/gamification/level-progression/') && res.ok()) {
          api = await res.json();
        }
      });
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('level-current-name')).toBeVisible();

      expect(api).not.toBeNull();
      await expect(page.getByTestId('level-current-name')).toHaveText(api.current_level.name);
      await expect(page.getByTestId('level-points-to-next')).toHaveText(
        String(api.points_to_next_level),
      );
      // Progress is integer 0..100
      expect(api.progress_percent).toBeGreaterThanOrEqual(0);
      expect(api.progress_percent).toBeLessThanOrEqual(100);
    });
  });

  test.describe('mocked edge cases', () => {
    test.use({ storageState: storageStatePath('beginner') });

    test('7. Negative points from backend should be normalized to 0 (Beginner)', async ({
      page,
    }) => {
      // Simulate a corrupted backend response with negative points
      await page.route('**/api/gamification/level-progression/', r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            points: -50,
            current_level: { name: 'Beginner Reuser', min_points: 0, icon: 'seed' },
            next_level: { name: 'Active Reuser', min_points: 100, icon: 'leaf' },
            progress_percent: 0,
            points_to_next_level: 100,
            is_max_level: false,
          }),
        }),
      );
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.getByTestId('level-current-name')).toHaveText('Beginner Reuser');
      const bar = page.getByTestId('level-progress-bar');
      const value = Number(await bar.getAttribute('data-progress'));
      // UI should not render a negative bar width
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
});
