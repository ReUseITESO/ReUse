import { test, expect } from '@playwright/test';

test.describe('MKT-05: Marketplace — manage listings', () => {
  
  // tests/marketplace/mkt-05-manage-listings.spec.ts

  test.beforeEach(async ({ page }) => {
  // 1. Mock the profile endpoint (the one useAuth calls on mount)
  await page.route('**/api/auth/profile/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        id: 1, 
        email: 'test@iteso.mx' 
      }),
    });
  });

  // 2. BEST PRACTICE: Inject tokens BEFORE the application scripts run
  await page.addInitScript(() => {
    window.localStorage.setItem('reuse_access_token', 'mock_access_token');
    window.localStorage.setItem('reuse_refresh_token', 'mock_refresh_token');
  });

  // 3. Navigate directly to the profile page
  await page.goto('/profile');
});

test('create Textbook listing, edit price to 50, and verify in My Listings', async ({ page }) => {
  // The app will now initialize with the user session active
  await expect(page.getByText('test@iteso.mx')).toBeVisible();

  await page.goto('/products/new');
  // ... continue Marketplace logic
});
});