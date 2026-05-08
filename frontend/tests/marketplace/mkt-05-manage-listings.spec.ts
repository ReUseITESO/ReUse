import { test, expect } from '@playwright/test';

test.describe('MKT-05: Marketplace — manage listings', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/profile/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@iteso.mx' }),
      });
    });

    await page.route('**/api/marketplace/categories/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [{ id: 1, name: 'Libros y Apuntes', icon: 'book' }] // Use 'name'
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

    await page.route('**/api/marketplace/products/**', async (route) => {
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
          body: JSON.stringify({ count: 1, results: [currentProduct] })
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
});