import { test, expect } from '@playwright/test';

/**
 * MKT-14: Marketplace — Community Exclusive Items
 *
 * Strategy: Consolidate all global mocks (Profile, Notifications, Communities)
 * in the top-level beforeEach to prevent background 401 errors.
 */
test.describe('MKT-14: Marketplace — Community Exclusive Items', () => {
  const userId = 1;
  const communityId = 101;
  const communityName = 'Gaming for people that dont';
  const productId = 999;

  test.beforeEach(async ({ page }) => {
    // 1. Mock Global Auth & Layout (Prevents the 401 "Session Expired" error)
    await page.route(/\/api\/auth\/profile/, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: userId,
          email: 'test@iteso.mx',
          first_name: 'Iñaki',
          full_name: 'Iñaki Medina',
        }),
      });
    });

    await page.route(/\/api\/core\/notifications/, async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ count: 0, results: [] }) });
    });

    // 2. Mock Communities (The list used in the filter)
    await page.route(/\/api\/social\/communities/, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: communityId, name: communityName, is_member: true, is_admin: false },
        ]),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('reuse_access_token', 'mock_token');
      window.localStorage.setItem('reuse_refresh_token', 'mock_token');
    });

    await page.route(/\/api\/marketplace\/categories/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [{ id: 1, name: 'Videojuegos', icon: 'game' }],
        }),
      });
    });
  });

  test('Community member can publish an item scoped to a specific community', async ({ page }) => {
    let capturedPayload: string | null = null;

    await page.route('**/api/marketplace/products/**', async route => {
      if (route.request().method() === 'POST') {
        capturedPayload = route.request().postData();
        return route.fulfill({
          status: 201,
          body: JSON.stringify({ id: productId, title: 'Bata' }),
        });
      }
      route.continue();
    });

    await page.goto('/products/new');

    // Fill Mandatory standard fields
    await page.getByLabel(/Título/i).fill('Bata de Laboratorio');
    await page.getByLabel(/Descripción/i).fill('Bata blanca para química.');

    // Select Category (AppSelect custom component)
    const categorySelector = page
      .getByRole('combobox')
      .filter({ hasText: /Seleccionar categoría/i });
    await categorySelector.click();
    await page.getByRole('option', { name: 'Videojuegos' }).click();

    // Fill Price (Required for 'sale' items to avoid validation block)
    await page.getByLabel(/Precio/i).fill('250');

    // Verify Community Section renders (requires communities.length > 0)
    const communityHeading = page.getByRole('heading', { name: /Comunidad/i, level: 2 });
    await expect(communityHeading).toBeVisible();

    // Select the community
    const communitySelector = page.getByRole('combobox').filter({ hasText: /Sin comunidad/i });
    await communitySelector.click();
    await page.getByRole('option', { name: communityName }).click();

    await page.getByRole('button', { name: /Publicar artículo/i }).click();

    // Verify FormData includes community ID
    expect(capturedPayload).toContain('name="community"');
    expect(capturedPayload).toContain(String(communityId));

    await page.waitForURL(/\/products$/);
  });

  test('User can browse community marketplace and filter by community', async ({ page }) => {
    // 3. FIX: Mock the CORRECT endpoint used in useCommunityProducts.ts
    // We use a regex that catches any call to marketplace/products/
    await page.route(/\/api\/marketplace\/products/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [
            {
              id: productId,
              title: 'Control Pro',
              price: '1200.00',
              transaction_type: 'sale',
              status: 'disponible',
              category: { name: 'Videojuegos' },
              community: { id: communityId, name: communityName },
              seller_name: 'Iñaki Medina',
              created_at: new Date().toISOString(),
              images: [],
            },
          ],
        }),
      });
    });

    await page.goto('/communities/marketplace');

    // 4. Verify the item appears (Mock is now properly intercepted)
    await expect(page.getByText('Control Pro')).toBeVisible();

    // 5. Verify Filter interaction
    const filter = page.getByRole('combobox').filter({ hasText: /Todas mis comunidades/i });
    await filter.click();
    await page.getByRole('option', { name: communityName }).click();

    // Assert the counter updates
    await expect(page.getByText('1 artículo')).toBeVisible();
  });

  test('Community detail page includes marketplace section', async ({ page }) => {
    // 1. Mock Community Detail
    await page.route(new RegExp(`.*/api/social/communities/${communityId}/$`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: communityId,
          name: communityName,
          description: 'Gaming stuff',
          members_count: 5,
          creator: { full_name: 'Admin' },
        }),
      });
    });

    // 2. FIX: Mock Members so isMember becomes true (removes "Unirse" button)
    await page.route(
      new RegExp(`.*/api/social/communities/${communityId}/members/`),
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              user: { id: userId, full_name: 'Iñaki Medina', first_name: 'Iñaki' },
              role: 'member',
            },
          ]),
        });
      },
    );

    // 3. Mock Posts to clean up the UI
    await page.route(new RegExp(`.*/api/social/communities/${communityId}/posts/`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // 4. FIX: Mock the specific product endpoint used by useCommunityMarketplace
    await page.route(
      new RegExp(`.*/api/social/communities/${communityId}/products/`),
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 1,
            results: [
              {
                id: productId,
                title: 'Item Local',
                category: { name: 'Videojuegos' },
                images: [],
                price: '100.00',
                transaction_type: 'sale',
                seller_name: 'Test User',
              },
            ],
          }),
        });
      },
    );

    await page.goto(`/communities/${communityId}`);

    // 5. Assertions
    // Check that the "Unirse" button is GONE (confirms membership mock worked)
    await expect(page.getByRole('button', { name: /Unirse/i })).not.toBeVisible();

    // Verify the product is visible
    await expect(page.getByText('Item Local')).toBeVisible();
  });

  test('Accessing community item as non-member redirects or shows 403', async ({ page }) => {
    const forbiddenId = 888;
    await page.route(`**/api/marketplace/products/${forbiddenId}/**`, async route => {
      await route.fulfill({
        status: 403,
        body: JSON.stringify({ detail: 'No eres miembro de esta comunidad.' }),
      });
    });

    await page.goto(`/products/${forbiddenId}`);

    // Verify error UI state
    await expect(page.getByText(/no eres miembro|no tienes permiso/i)).toBeVisible();

    // Recovery path
    await page.getByRole('button', { name: /volver/i }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('Shows empty state when community has no items', async ({ page }) => {
    // FIX: Match the actual endpoint (/api/marketplace/products/)
    // and use a regex to handle query params (?scope=communities)
    await page.route(/\/api\/marketplace\/products/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 0,
          results: [],
          pages: 1,
          current_page: 1,
        }),
      });
    });

    await page.goto('/communities/marketplace');

    // Verify empty state message from CommunitiesMarketplacePage.tsx
    await expect(page.getByText(/no hay artículos en tus comunidades/i)).toBeVisible();
  });
});
