import { test, expect, type Route } from '@playwright/test';

/**
 * HU-CORE-16: Rate Limiting E2E Tests
 * 
 * Estos tests validan que el frontend maneje correctamente las respuestas 429 (Too Many Requests)
 * del backend. Todas las peticiones al backend están mockeadas para evitar afectar la base de datos real
 * y para simular estados de bloqueo (throttling).
 */

test.describe('HU-CORE-16: Rate Limiting', () => {

  // Seguridad: Interceptamos TODAS las llamadas a la API por defecto
  // para evitar que cualquier descuido en un test impacte la base de datos real.
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async (route: Route) => {
      // Por defecto devolvemos 404 o un error genérico si no está mockeado específicamente en el test
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: "Endpoint no mockeado en el test." } })
      });
    });
  });

  test('SC-01: Auth Throttle - Signin Isolation', async ({ page }) => {
    let requestCount = 0;

    // Interceptar las llamadas a signin para simular el rate limit
    await page.route('**/api/auth/signin/', async (route: Route) => {
      requestCount++;
      if (requestCount > 5) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Demasiadas solicitudes. Intenta de nuevo en 60 segundos."
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: "Credenciales inválidas" })
        });
      }
    });

    // 1. Navigate to /auth/signin
    await page.goto('/auth/signin');

    // 2. Fill in email and any password
    await page.locator('#email').fill('test-limit@iteso.mx');
    await page.locator('#password').fill('wrongpassword');

    // 3. Click "Iniciar sesión" 6 times rapidly
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    }

    // 4. Verify 429 error and UI message
    const errorMsg = page.getByText(/Demasiadas solicitudes/i);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/60 segundos/)).toBeVisible();
  });

  test('SC-02: Auth Throttle - Cross-Flow Blocking', async ({ page }) => {
    let authRequestCount = 0;

    // Compartir el contador entre signin y signup para simular bloqueo por IP
    const handleAuthThrottle = async (route: Route) => {
      authRequestCount++;
      if (authRequestCount > 5) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Demasiadas solicitudes por IP. Intenta de nuevo en 60 segundos."
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: "No autorizado / Error" })
        });
      }
    };

    await page.route('**/api/auth/signin/', handleAuthThrottle);
    await page.route('**/api/auth/signup/', handleAuthThrottle);

    // 1. Navigate to /auth/signin
    await page.goto('/auth/signin');

    // 2. Click "Iniciar sesión" 5 times (depletar el bucket)
    await page.locator('#email').fill('attacker@iteso.mx');
    await page.locator('#password').fill('password');
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    }

    // 3. Navigate to /auth/signup
    await page.goto('/auth/signup');

    // 4. Fill the signup form and click "Crear cuenta"
    await page.locator('#email').fill('new-user@iteso.mx');
    await page.locator('#first_name').fill('Test');
    await page.locator('#last_name').fill('User');
    await page.locator('#phone').fill('3312345678');
    await page.locator('#password').fill('SecurePass123!');
    await page.locator('#password_confirm').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    // 5. Verify 429 error and UI message
    await expect(page.getByText(/Demasiadas solicitudes/i)).toBeVisible({ timeout: 10000 });
  });

  test('SC-03: Email Verification Throttle - Forgot Password', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/auth/password-reset/send/', async (route: Route) => {
      requestCount++;
      if (requestCount > 3) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Demasiadas solicitudes. Intenta de nuevo en 60 segundos."
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: "Si el correo está registrado, recibirás un enlace." })
        });
      }
    });

    // 1. Navigate to /auth/forgot-password
    await page.goto('/auth/forgot-password');

    // 2. Enter a valid email format
    await page.locator('#email').fill('user@iteso.mx');

    // 3. Click "Enviar enlace" y luego "Reenviar correo" para agotar el límite
    await page.getByRole('button', { name: 'Enviar enlace' }).click();

    // El límite es 3, así que con el primer click + 3 reenvíos llegamos al bloqueo
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Reenviar correo' }).click();
    }

    // 4. Verify 429 error and UI message
    await expect(page.getByText(/No se pudo reenviar el correo/i)).toBeVisible({ timeout: 10000 });
  });

  test('SC-04: User Throttle - Authenticated Flow', async ({ page }) => {
    // Mock de productos para devolver 429
    await page.route('**/api/marketplace/products/**', async (route: Route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Límite de usuario excedido. Intenta de nuevo en 60 segundos."
          }
        })
      });
    });

    // 3. Navegar a /products
    await page.goto('/products');

    // 4. Verificar que el UI maneja el error 429
    await expect(page.getByText(/Límite de usuario excedido|Demasiadas solicitudes/i)).toBeVisible({ timeout: 10000 });
  });

  test('SC-05: Anon Throttle - Public Flow', async ({ page }) => {
    // 1. Interceptar un endpoint público para devolver 429 (Anon Throttle)
    await page.route('**/api/marketplace/products/**', async (route: Route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Demasiadas solicitudes anónimas. Intenta de nuevo en 60 segundos."
          }
        })
      });
    });

    // 2. Navegar a la página de productos sin estar logueado
    await page.goto('/products');

    // 3. Verificar UI
    await expect(page.getByText(/Demasiadas solicitudes/i)).toBeVisible({ timeout: 10000 });
  });

  test('SC-06: Recovery - Bucket Reset', async ({ page }) => {
    let isBlocked = true;

    await page.route('**/api/auth/signin/', async (route: Route) => {
      if (isBlocked) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Bloqueado temporalmente. Intenta de nuevo en 60 segundos."
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: "Credenciales inválidas" })
        });
      }
    });

    // 1. Ir a signin
    await page.goto('/auth/signin');
    await page.locator('#email').fill('recovery@iteso.mx');
    await page.locator('#password').fill('pass');

    // 2. Verificar que está bloqueado
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText(/Bloqueado temporalmente|Demasiadas solicitudes/i)).toBeVisible({ timeout: 10000 });

    // 3. Simular recuperación de bucket
    isBlocked = false;

    // 4. Intentar de nuevo
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // 5. El mensaje de error de rate limit debería desaparecer
    await expect(page.getByText(/Bloqueado temporalmente|Demasiadas solicitudes/i)).not.toBeVisible({ timeout: 10000 });
    // Pero ahora debería mostrar error de credenciales (401)
    await expect(page.getByText(/Correo o contraseña incorrectos/i)).toBeVisible();
  });

});
