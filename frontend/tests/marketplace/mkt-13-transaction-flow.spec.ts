import { test, expect } from '@playwright/test';

test.describe('MKT-13: Marketplace — Transaction Flow', () => {
  const productId = 555;
  const transactionId = 777;
  const buyerId = 10;
  const sellerId = 20;

  test.beforeEach(async ({ page }) => {
    // 1. Mock Auth Profile (Identity)
    await page.route('**/api/auth/profile/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: buyerId,
          email: 'buyer@iteso.mx',
          first_name: 'Iñaki',
          last_name: 'Medina',
        }),
      });
    });

    // 2. Mock Categories (Prevents component crashes on icons/labels)
    await page.route('**/api/marketplace/categories/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [{ id: 1, name: 'Videojuegos', icon: 'gamepad' }],
        }),
      });
    });

    // 3. Inject Auth Tokens (Session)
    await page.addInitScript(() => {
      window.localStorage.setItem('reuse_access_token', 'mock_access_token');
      window.localStorage.setItem('reuse_refresh_token', 'mock_refresh_token');
    });
  });

  test('Buyer initiates a request (Happy Path)', async ({ page }) => {
    // 1. Mock the product detail
    await page.route(`**/api/marketplace/products/${productId}/`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: productId,
          title: 'Nintendo Switch',
          description: 'Consola Nintendo Switch en excelente estado.',
          seller_id: sellerId,
          status: 'disponible',
          transaction_type: 'sale',
          price: '4500.00',
          created_at: new Date().toISOString(),
          images: [],
          category: { name: 'Videojuegos' },
          // FIX: Add these to stop the "Me gusta: undefined" buttons in your snapshot
          likes_count: 0,
          dislikes_count: 0,
          seller: { first_name: 'Vendedor', last_name: 'Test', id: sellerId },
        }),
      });
    });

    // 2. Mock the Transaction POST creation
    await page.route('**/api/marketplace/transactions/', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({ id: transactionId, product_id: productId, status: 'pending' }),
        });
      }
    });

    // START FLOW (Based on your recorded locators)
    await page.goto(`/products/${productId}`);

    await page.getByRole('button', { name: 'Solicitar artículo' }).click();

    // Coordination Modal
    await page.getByRole('combobox', { name: 'Selecciona edificio o puerta' }).click();
    await page.getByRole('option', { name: 'H' }).click();
    await page.getByRole('combobox', { name: 'Busca o escribe salon' }).click();
    await page.getByRole('option', { name: '111' }).click();

    await page.getByRole('button', { name: 'Selecciona fecha' }).click();
    await page.getByRole('button', { name: /22 de mayo/i }).click();

    // Time selection
    await page.getByRole('button', { name: '9', exact: true }).click();
    await page.getByRole('button', { name: '03' }).click();
    await page.getByRole('button', { name: 'PM' }).click();

    await page.getByRole('button', { name: 'Enviar solicitud' }).click();

    // Verify success feedback (Assuming a toast or redirect occurs)
    await expect(page.getByText(/solicitud enviada/i)).toBeVisible();
  });

  test('Seller accepts a pending transaction', async ({ page }) => {
    const sellerId = 20;
    const transactionId = 777;

    // 1. Auth as Seller (Ensure ID matches the mock below)
    await page.route('**/api/auth/profile/', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ id: sellerId, email: 'seller@iteso.mx', first_name: 'Vendedor' }),
      });
    });

    // 2. Mock Active Transactions (The one we want to accept)
    // TransactionsPanel likely calls this endpoint
    await page.route('**/api/marketplace/transactions/?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [
            {
              id: transactionId,
              status: 'pendiente',
              transaction_type: 'sale',
              product: {
                id: productId, // FIX: Added id to fix the 'undefined' links in the snapshot
                title: 'Nintendo Switch',
                price: 4500,
                category: { name: 'Videojuegos' },
              },
              buyer: { first_name: 'Iñaki', last_name: 'Medina' },
              seller: { id: sellerId, first_name: 'Vendedor', last_name: 'Test' },
              delivery_location: 'Edificio H Salón 111',
              delivery_date: new Date().toISOString(),
              expires_at: new Date(Date.now() + 86400000).toISOString(),
            },
          ],
        }),
      });
    });

    // 3. Mock the Accept Action
    await page.route(`**/api/marketplace/transactions/${transactionId}/status/`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'confirmada' }),
      });
    });

    // 4. FIX: Navigate to the Transactions dashboard, not My Products
    await page.goto('/transactions');

    // 5. Verify and Click
    await expect(page.getByText('Nintendo Switch').first()).toBeVisible();

    const acceptBtn = page.getByRole('button', { name: 'Aceptar solicitud' });
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    await acceptBtn.click({ force: true });

    // Verify UI feedback (e.g., status change or toast)
    await expect(page.getByText(/confirmada/i)).toBeVisible();
  });

  test('Completion: Mark handoff as delivered', async ({ page }) => {
    const transactionId = 777;

    // Mock an ACCEPTED (confirmada) transaction
    await page.route(`**/api/marketplace/transactions/${transactionId}/`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: transactionId,
          status: 'confirmada', // Status must be confirmada for completion button to show
          transaction_type: 'sale',
          product: {
            title: 'Nintendo Switch',
            price: 4500,
            category: { name: 'Videojuegos' },
          },
          buyer: { first_name: 'Iñaki', last_name: 'Medina' },
          seller: { first_name: 'Vendedor', last_name: 'Test' },
          delivery_location: 'Edificio H Salón 111',
          delivery_date: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto(`/transactions/${transactionId}`);

    // The label comes from getDeliveryConfirmationLabel(actorRole)
    // Usually "Confirmar entrega" or similar.
    const confirmBtn = page.getByRole('button', { name: /confirmar/i });
    await confirmBtn.click();
  });

  test('Validate: cannot request own item', async ({ page }) => {
    // Mock product where owner ID matches logged-in user ID (10)
    await page.route(`**/api/marketplace/products/${productId}/`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ id: productId, seller_id: buyerId }),
      });
    });

    await page.goto(`/products/${productId}`);

    // The button should be hidden or disabled for the owner
    const requestBtn = page.getByRole('button', { name: 'Solicitar artículo' });
    await expect(requestBtn).not.toBeVisible();
  });
});
