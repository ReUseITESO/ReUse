import { test, expect } from '@playwright/test';

/*
Pasos implementados (MCP Playwright):
1. Validar que una ruta inexistente muestra la página 404 personalizada.
2. Validar presencia de elementos visuales (4-Logo-4).
3. Validar mensajes en español ("página no encontrada", etc.).
4. Validar que el botón "Ir al inicio" redirige a "/".
5. Validar accesibilidad por teclado (Tab + Enter).
6. Validar que rutas anidadas y con parámetros también muestran el 404.
7. Validar responsividad básica (Mobile/Desktop).
*/

test.describe('TEST-CORE-08 - Custom 404 error page E2E', () => {
  test('happy path: should display custom 404 page for unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Check branded text in Spanish - this is unique enough
    const title = page.getByText('página no encontrada');
    await expect(title).toBeVisible();

    // Check "404" visual (4 + Logo + 4)
    // Using a more specific locator to avoid strict mode issues if multiple '4's exist
    const numeral4 = page.locator('span').filter({ hasText: /^4$/ });
    await expect(numeral4).toHaveCount(2);
    await expect(page.getByRole('img', { name: '0' })).toBeVisible();

    await expect(
      page.getByText('La página que buscas ya fue reciclada o la dirección no es correcta.'),
    ).toBeVisible();

    // Check CTA button
    const homeBtn = page.getByRole('link', { name: 'Ir al inicio' });
    await expect(homeBtn).toBeVisible();
    await expect(homeBtn).toHaveAttribute('href', '/');
  });

  test('navigation: CTA button "Ir al inicio" should redirect to home', async ({ page }) => {
    await page.goto('/unknown-page');

    const homeBtn = page.getByRole('link', { name: 'Ir al inicio' });
    await homeBtn.click();

    await expect(page).toHaveURL('/');
  });

  test('edge case: nested invalid routes should show 404', async ({ page }) => {
    await page.goto('/api/v1/invalid/nested/path');
    await expect(page.getByText('página no encontrada')).toBeVisible();
  });

  test('edge case: routes with query and hash should show 404', async ({ page }) => {
    await page.goto('/error-page?debug=true#details');
    await expect(page.getByText('página no encontrada')).toBeVisible();
  });

  test('accessibility: should be navigable by keyboard', async ({ page }) => {
    await page.goto('/404-accessibility-test');

    // Focus the first element and then tab to the button
    // In many apps, the first tab might go to a skip link or navbar
    // We'll tab until the "Ir al inicio" button is focused, with a limit
    const homeBtn = page.getByRole('link', { name: 'Ir al inicio' });

    let isFocused = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      if (await homeBtn.evaluate(node => document.activeElement === node)) {
        isFocused = true;
        break;
      }
    }

    expect(isFocused).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/');
  });

  test('responsiveness: should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/mobile-404');

    // Verify visibility of key elements
    await expect(page.getByText('página no encontrada')).toBeVisible();
    const homeBtn = page.getByRole('link', { name: 'Ir al inicio' });
    await expect(homeBtn).toBeVisible();

    // Check that the button is within the viewport width
    const box = await homeBtn.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
    expect(box?.x).toBeGreaterThanOrEqual(0);
  });

  test('responsiveness: should render correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/desktop-404');

    await expect(page.getByText('página no encontrada')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ir al inicio' })).toBeVisible();
  });
});
