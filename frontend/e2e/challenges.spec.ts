/**
 * E2E tests for HU: "User can participate in sustainability challenges"
 * Domain: Gamification
 *
 * Coverage:
 * - Unauthenticated users see a login prompt instead of challenges
 * - Authenticated users see the ChallengesBoard with tabs (Diarios/Semanales/Mensuales)
 * - Challenges display title, progress bar, bonus points, and status badge
 * - Tab switching filters challenges by time bucket
 * - Completed challenges show a "Reclamar" button
 * - Claiming a reward shows success feedback and disables button
 * - API errors are surfaced to the user
 * - Loading skeleton appears while fetching
 * - Empty state shown when no challenges exist for a bucket
 */

import { test, expect, type Page, type Route } from '@playwright/test';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  email: 'test@iteso.mx',
  first_name: 'Ana',
  last_name: 'López',
  points: 120,
};

const now = new Date();
const yesterday = (offset: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

const dailyChallenge = {
  id: 1,
  title: 'Dona 2 artículos hoy',
  description: 'Ayuda al ecosistema donando artículos hoy.',
  challenge_type: 'donation',
  goal: 2,
  bonus_points: 20,
  start_date: yesterday(-1),
  end_date: yesterday(1),
  joined: true,
};

const weeklyChallenge = {
  id: 2,
  title: 'Completa 3 intercambios esta semana',
  description: 'Intercambia artículos esta semana.',
  challenge_type: 'exchange',
  goal: 3,
  bonus_points: 40,
  start_date: yesterday(-3),
  end_date: yesterday(4),
  joined: true,
};

const monthlyChallenge = {
  id: 3,
  title: 'Publica 5 artículos este mes',
  description: 'Mantén el catálogo fresco.',
  challenge_type: 'publish',
  goal: 5,
  bonus_points: 80,
  start_date: yesterday(-10),
  end_date: yesterday(20),
  joined: false,
};

const completedChallenge = {
  id: 4,
  title: 'Vende 1 artículo hoy',
  description: 'Mueve artículos de tu inventario.',
  challenge_type: 'sale',
  goal: 1,
  bonus_points: 15,
  start_date: yesterday(-1),
  end_date: yesterday(1),
  joined: true,
};

const myDailyProgress = {
  id: 10,
  challenge_id: 1,
  title: 'Dona 2 artículos hoy',
  description: 'Ayuda al ecosistema donando artículos hoy.',
  challenge_type: 'donation',
  goal: 2,
  progress: 1,
  bonus_points: 20,
  is_completed: false,
  reward_claimed: false,
  reward_claimed_at: null,
  joined_at: yesterday(-1),
  completed_at: null,
  start_date: yesterday(-1),
  end_date: yesterday(1),
  is_expired: false,
};

const myCompletedProgress: {
  id: number;
  challenge_id: number;
  title: string;
  description: string;
  challenge_type: string;
  goal: number;
  progress: number;
  bonus_points: number;
  is_completed: boolean;
  reward_claimed: boolean;
  reward_claimed_at: string | null;
  joined_at: string;
  completed_at: string | null;
  start_date: string;
  end_date: string;
  is_expired: boolean;
} = {
  id: 11,
  challenge_id: 4,
  title: 'Vende 1 artículo hoy',
  description: 'Mueve artículos de tu inventario.',
  challenge_type: 'sale',
  goal: 1,
  progress: 1,
  bonus_points: 15,
  is_completed: true,
  reward_claimed: false,
  reward_claimed_at: null,
  joined_at: yesterday(-1),
  completed_at: yesterday(0),
  start_date: yesterday(-1),
  end_date: yesterday(1),
  is_expired: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function injectAuthTokens(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('reuse_access_token', 'fake-access-token');
    localStorage.setItem('reuse_refresh_token', 'fake-refresh-token');
  });
}

async function mockProfileAPI(page: Page) {
  await page.route('**/api/auth/profile/**', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    });
  });
}

async function mockChallengesAPI(
  page: Page,
  challenges = [dailyChallenge, completedChallenge, weeklyChallenge, monthlyChallenge],
  myChallenges = [myDailyProgress, myCompletedProgress],
) {
  await page.route('**/api/gamification/challenges/', (route: Route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(challenges),
      });
    } else {
      route.continue();
    }
  });

  await page.route('**/api/gamification/challenges/me/', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(myChallenges),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Sustainability Challenges – Unauthenticated', () => {
  test('shows login prompt when user is not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Inicia sesión para ver y participar en retos activos.')).toBeVisible();
  });

  test('does not show challenge tabs when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Diarios' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Semanales' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Mensuales' })).not.toBeVisible();
  });
});

test.describe('Sustainability Challenges – Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthTokens(page);
    await mockProfileAPI(page);
    await mockChallengesAPI(page);
  });

  test('shows challenge board with tabs for authenticated user', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Diarios' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Semanales' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mensuales' })).toBeVisible();
  });

  test('daily tab is active by default and shows daily challenges', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dona 2 artículos hoy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vende 1 artículo hoy' })).toBeVisible();
  });

  test('weekly tab shows only weekly challenges', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Semanales' }).click();
    await expect(page.getByRole('heading', { name: 'Completa 3 intercambios esta semana' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dona 2 artículos hoy' })).not.toBeVisible();
  });

  test('monthly tab shows only monthly challenges', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Mensuales' }).click();
    await expect(page.getByRole('heading', { name: 'Publica 5 artículos este mes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dona 2 artículos hoy' })).not.toBeVisible();
  });

  test('challenge card shows progress counter and bonus points', async ({ page }) => {
    await page.goto('/dashboard');
    // Daily challenge: 1/2 progress
    await expect(page.getByText('1 / 2 completado')).toBeVisible();
    await expect(page.getByText('+20 pts')).toBeVisible();
  });

  test('in-progress challenge shows "En curso" status badge', async ({ page }) => {
    await page.goto('/dashboard');
    const badges = page.getByText('En curso');
    await expect(badges.first()).toBeVisible();
  });

  test('completed challenge shows "Reclamar" button', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Reclamar' })).toBeVisible();
  });

  test('already-claimed challenge shows "Reclamado" badge', async ({ page }) => {
    const claimedProgress = {
      ...myCompletedProgress,
      reward_claimed: true,
      reward_claimed_at: yesterday(0),
    };
    await mockChallengesAPI(
      page,
      [dailyChallenge, completedChallenge, weeklyChallenge, monthlyChallenge],
      [myDailyProgress, claimedProgress],
    );
    await page.goto('/dashboard');
    await expect(page.getByText('Reclamado')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reclamar' })).not.toBeVisible();
  });
});

test.describe('Sustainability Challenges – Claiming Rewards', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthTokens(page);
    await mockProfileAPI(page);
    await mockChallengesAPI(page);
  });

  test('successfully claiming reward shows success message', async ({ page }) => {
    await page.route('**/api/gamification/challenges/4/claim/', (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Recompensa reclamada.' }),
      });
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Reclamar' }).click();
    await expect(page.getByText('Recompensa reclamada.')).toBeVisible();
  });

  test('claim button is disabled while request is in flight', async ({ page }) => {
    let resolveRoute: () => void;
    const routeBlocked = new Promise<void>(res => (resolveRoute = res));

    await page.route('**/api/gamification/challenges/4/claim/', async (route: Route) => {
      await routeBlocked;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok' }),
      });
    });

    await page.goto('/dashboard');
    const claimBtn = page.getByRole('button', { name: 'Reclamar' });
    await claimBtn.click();

    await expect(page.getByRole('button', { name: 'Reclamando...' })).toBeVisible();
    resolveRoute!();
  });

  test('claim API error shows error message to user', async ({ page }) => {
    await page.route('**/api/gamification/challenges/4/claim/', (route: Route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'La recompensa ya fue reclamada.' } }),
      });
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Reclamar' }).click();
    await expect(page.getByText(/recompensa|reclamada|error/i)).toBeVisible();
  });
});

test.describe('Sustainability Challenges – Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthTokens(page);
    await mockProfileAPI(page);
  });

  test('shows empty state when no challenges exist for a bucket', async ({ page }) => {
    await mockChallengesAPI(page, [weeklyChallenge], []);
    await page.goto('/dashboard');
    // Daily tab should have empty state
    await expect(page.getByText('No hay retos activos en esta categoría')).toBeVisible();
  });

  test('shows error message when challenges API fails', async ({ page }) => {
    await page.route('**/api/gamification/challenges/', (route: Route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Internal server error' } }),
      });
    });
    await page.route('**/api/gamification/challenges/me/', (route: Route) => {
      route.fulfill({ status: 500, body: '{}' });
    });

    await page.goto('/dashboard');
    // Error should be visible somewhere on the page
    await expect(page.locator('[class*="error"], [class*="text-error"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('challenges with 100% progress show green progress bar', async ({ page }) => {
    const fullyCompleted = { ...myDailyProgress, progress: 2, is_completed: true };
    await mockChallengesAPI(page, [dailyChallenge], [fullyCompleted]);
    await page.goto('/dashboard');
    // Progress bar should exist and be 100% wide
    const progressBar = page.locator('[style*="width: 100%"]');
    await expect(progressBar).toBeVisible();
  });

  test('challenge bonus points are displayed correctly', async ({ page }) => {
    await mockChallengesAPI(page, [dailyChallenge, completedChallenge], [myDailyProgress]);
    await page.goto('/dashboard');
    await expect(page.getByText('+20 pts')).toBeVisible();
    await expect(page.getByText('+15 pts')).toBeVisible();
  });

  test('switching tabs preserves previously active tab selection', async ({ page }) => {
    await mockChallengesAPI(page);
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Semanales' }).click();
    await expect(page.getByRole('heading', { name: 'Completa 3 intercambios esta semana' })).toBeVisible();

    await page.getByRole('button', { name: 'Diarios' }).click();
    await expect(page.getByRole('heading', { name: 'Dona 2 artículos hoy' })).toBeVisible();
  });
});
