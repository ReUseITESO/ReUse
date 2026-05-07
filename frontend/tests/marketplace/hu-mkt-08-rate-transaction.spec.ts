import { test, expect } from '@playwright/test';

test.describe.serial('HU-MKT-08: Rate and Review Completed Transaction', () => {
  test.use({ storageState: 'tests/gamification/.auth/buyer.json' });

  test('should display completed transactions in history', async ({ page }) => {
    await page.goto('/transaction-history');
    await expect(page.locator('[data-testid="transaction-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-card"]').filter({ hasText: 'completada' })).toBeVisible();
  });

  test('should open the review form from a completed transaction', async ({ page }) => {
    await page.goto('/transaction-history');
    const rateButton = page.locator('[data-testid="rate-transaction-button"]').first();
    await expect(rateButton).toBeVisible();
    await rateButton.click();

    const reviewForm = page.locator('[data-testid="transaction-review-form"]');
    await expect(reviewForm).toBeVisible();
    await expect(reviewForm.locator('[data-testid="review-comment"]')).toBeVisible();
    await expect(reviewForm.locator('[data-testid="submit-review"]')).toBeVisible();
  });

  test('should disable submit when no star rating is selected', async ({ page }) => {
    await page.goto('/transaction-history');
    const rateButton = page.locator('[data-testid="rate-transaction-button"]').first();
    await rateButton.click();

    const submitButton = page.locator('[data-testid="submit-review"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should enforce max comment length on the review form', async ({ page }) => {
    await page.goto('/transaction-history');
    const rateButton = page.locator('[data-testid="rate-transaction-button"]').first();
    await rateButton.click();

    const commentField = page.locator('[data-testid="review-comment"]');
    await expect(commentField).toHaveAttribute('maxLength', '500');
    await commentField.fill('a'.repeat(500));
    await expect(commentField).toHaveValue('a'.repeat(500));
  });

  test('should submit a valid review and display it on the transaction card', async ({ page }) => {
    await page.goto('/transaction-history');
    const rateButton = page.locator('[data-testid="rate-transaction-button"]').first();
    await rateButton.click();

    const reviewForm = page.locator('[data-testid="transaction-review-form"]');
    await reviewForm.locator('[data-testid="star-5"]').click();
    await reviewForm.locator('[data-testid="review-comment"]').fill('Excelente producto, muy recomendado!');

    const submitButton = reviewForm.locator('[data-testid="submit-review"]');
    await submitButton.click();

    await expect(reviewForm.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-review"]')).toContainText('Excelente producto, muy recomendado!');
  });
});

test.describe('HU-MKT-08: Unauthenticated Access', () => {
  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/transaction-history');
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});