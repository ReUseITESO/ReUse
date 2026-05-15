import { test, expect } from '@playwright/test';

test.describe('MKT-05: Marketplace — manage listings', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/profile/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@iteso.mx' }),
      });
    });

    await page.route('**/api/marketplace/categories/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [{ id: 1, name: 'Libros y Apuntes', icon: 'book' }], // Use 'name'
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('reuse_access_token', 'mock_access_token');
      window.localStorage.setItem('reuse_refresh_token', 'mock_refresh_token');
    });

    await page.goto('/profile');
  });

  test('create Textbook listing, edit price to 50, and verify in My Listings', async ({ page }) => {
    const productId = 123;
    const categoryMock = { id: 1, name: 'Libros y Apuntes', icon: 'book' };

    // 1. USE 'let' so we can update the state during the test
    let currentProduct = {
      id: productId,
      title: 'Textbook',
      description: 'Libro de texto de cálculo en buen estado.',
      price: '40.00',
      category: categoryMock,
      condition: 'buen_estado',
      transaction_type: 'sale',
      status: 'disponible',
      seller_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await page.route('**/api/marketplace/products/**', async route => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === 'POST') {
        return route.fulfill({ status: 201, body: JSON.stringify(currentProduct) });
      }

      if (method === 'PATCH' || method === 'PUT') {
        const contentType = route.request().headers()['content-type'] || '';
        const rawData = route.request().postData() || '';

        if (contentType.includes('application/json')) {
          const patchData = route.request().postDataJSON();
          currentProduct = { ...currentProduct, ...patchData };
        } else {
          // Simple extraction for multipart/form-data (FormData)
          // We look for the "price" field and the value immediately following the boundary headers
          const priceMatch = rawData.match(/name="price"\s+([\d.]+)/);
          if (priceMatch) {
            currentProduct.price = priceMatch[1];
          }
        }

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentProduct),
        });
      }

      if (method === 'GET') {
        if (url.includes(`/products/${productId}/`)) {
          return route.fulfill({ status: 200, body: JSON.stringify(currentProduct) });
        }

        // 3. Subsequent GETs will now return the updated price
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ count: 1, results: [currentProduct] }),
        });
      }

      await route.continue();
    });

    // 1. CREATE
    await page.goto('/products/new');
    await page.getByLabel('Título').fill('Textbook');
    await page.getByLabel('Descripción').fill('Libro de texto de cálculo en buen estado.');

    await page.getByRole('combobox').filter({ hasText: 'Seleccionar categoría' }).click();
    await page.getByRole('option', { name: 'Libros y Apuntes' }).click();

    await page.getByLabel('Precio (MXN)').fill('40');
    await page.getByRole('button', { name: 'Publicar artículo' }).click();
    await page.waitForURL(/\/products$/);

    // 2. EDIT
    await page.goto('/products/my');
    await page.getByRole('link', { name: 'Editar producto' }).click();
    await page.waitForURL(new RegExp(`/products/${productId}/edit$`));

    // Category should be pre-selected thanks to the full object mock
    await expect(page.getByRole('combobox').filter({ hasText: 'Libros y Apuntes' })).toBeVisible();

    await page.getByLabel('Precio (MXN)').fill('50');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    // 3. VERIFY
    await page.waitForURL('/products/my');

    await expect(page.getByText(/\$50/)).toBeVisible();
    await expect(page.getByText('Textbook')).toBeVisible();
  });

  test('delete a listing and verify removal from "My Items"', async ({ page }) => {
    const productId = 123;
    let items = [
      {
        id: productId,
        title: 'Item to Delete',
        price: '10.0',
        category: { id: 1, name: 'Libros y Apuntes', icon: 'book' }, // Required field
        status: 'disponible', // Also recommended for conditional rendering
      },
    ];

    await page.route('**/api/marketplace/products/**', async route => {
      const method = route.request().method();
      if (method === 'DELETE') {
        items = []; // Simulate deletion
        return route.fulfill({ status: 204 });
      }
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ count: items.length, results: items }),
        });
      }
      await route.continue();
    });

    await page.goto('/products/my');

    // 1. Click initial trigger
    await page.getByRole('button', { name: /eliminar producto/i }).click();

    // 2. Click exact confirmation button in the dialog
    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();

    // 3. Verify item is gone and empty state is visible
    await expect(page.getByRole('heading', { name: 'Item to Delete' })).not.toBeVisible();
    await expect(page.getByText(/no se ha registrado/i)).toBeVisible();
  });

  test('prevent submission of sale item with zero price', async ({ page }) => {
    // Keep mock for server-side safety
    await page.route('**/api/marketplace/products/**', async route => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ price: ['El precio debe ser mayor a 0'] }),
        });
      }
      await route.continue();
    });

    await page.goto('/products/new');

    // Fill mandatory fields
    await page.getByLabel('Título *').fill('Invalid Item');
    await page.getByLabel('Descripción *').fill('Test description for validation.');
    await page.getByRole('combobox').filter({ hasText: 'Seleccionar categoría' }).click();
    await page.getByRole('option', { name: 'Libros y Apuntes' }).click();

    const priceInput = page.getByLabel(/precio/i);
    await priceInput.fill('0');

    // Attempt to submit
    await page.getByRole('button', { name: /publicar/i }).click();

    // FIX: Assert the HTML5 validity state instead of looking for text
    const isInvalid = await priceInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    // Confirm navigation was blocked
    await expect(page).toHaveURL(/\/products\/new/);
  });

  test('redirect to marketplace when trying to edit someone else’s item', async ({ page }) => {
    const foreignProductId = 999;

    await page.route(`**/api/marketplace/products/${foreignProductId}/`, async route => {
      return route.fulfill({
        status: 403,
        body: JSON.stringify({ detail: 'No tienes permiso para realizar esta acción.' }),
      });
    });

    await page.goto(`/products/${foreignProductId}/edit`);

    // Verify application handles 403 by redirecting or showing unauthorized UI
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByText(/no tienes permiso/i)).toBeVisible();
  });
});
