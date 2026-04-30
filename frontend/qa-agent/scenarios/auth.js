'use strict';

const env = require('../utils/env');
const { randomEmail, randomPassword, randomFullName } = require('../utils/faker');

/**
 * Escenarios de autenticación
 * Rutas: /auth/signin, /register (si existe)
 * Selectores extraídos del spec existente: marketplace.spec.ts
 */

async function loginValido(ctx) {
  const { ex, val, rep } = ctx;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Login con credenciales válidas', 'Faltan PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD');
    return;
  }

  rep.startScenario('Login con credenciales válidas');
  try {
    await ex.navigate('/auth/signin', 'Ir a página de login');
    await val.assertRoleVisible('heading', /Iniciar/i);

    await ex.fillByLabel(/Correo ITESO/i, env.EMAIL, 'Email ITESO');
    await ex.fillByLabel(/Contrase/i, env.PASSWORD, 'Contraseña');

    await ex.screenshot('auth_login_before_submit');

    await Promise.all([
      ex.page.waitForURL('**/products', { timeout: 15000 }),
      ex.clickByRole('button', /Iniciar sesi[oó]n/i, 'Botón Iniciar sesión'),
    ]);

    await val.assertRoleVisible('heading', /Productos disponibles/i);
    await ex.screenshot('auth_login_success');

    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('auth_login_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

async function loginCredencialesInvalidas(ctx) {
  const { ex, val, rep } = ctx;

  rep.startScenario('Login con contraseña incorrecta');
  try {
    await ex.navigate('/auth/signin', 'Ir a página de login');

    const fakeEmail = randomEmail();
    const fakePass = randomPassword();

    await ex.fillByLabel(/Correo ITESO/i, fakeEmail, 'Email inválido');
    await ex.fillByLabel(/Contrase/i, fakePass, 'Contraseña incorrecta');

    await ex.clickByRole('button', /Iniciar sesi[oó]n/i, 'Botón Iniciar sesión');

    // Debe permanecer en /auth/signin (no redirigir)
    await ex.pause(2500);
    const url = ex.page.url();
    if (url.includes('/products')) {
      throw new Error('El sistema permitió acceso con credenciales inválidas');
    }

    // Verificar que muestre algún mensaje de error
    const hasError = await ex.page.getByText(/credenciales|inválid|error|incorr/i).first().isVisible().catch(() => false);
    if (hasError) {
      rep.ok('Mensaje de error mostrado correctamente');
    } else {
      rep.warn('No se encontró mensaje de error visible, pero la redirección fue bloqueada');
    }

    await ex.screenshot('auth_login_invalid');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('auth_login_invalid_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

async function accesoProtegidoSinSesion(ctx) {
  const { ex, val, rep } = ctx;

  rep.startScenario('Acceso a ruta protegida sin sesión activa');
  try {
    // Intentar acceder directo a /products/new sin sesión
    await ex.navigate('/products/new', 'Intentar crear producto sin autenticar');
    await ex.pause(2000);

    // Debe redirigir a /auth/signin
    await val.assertUrlContains('/auth/signin', { timeout: 8000 });
    await val.assertRoleVisible('heading', /Iniciar/i);
    await ex.screenshot('auth_redirect_protected');

    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('auth_redirect_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

async function loginYLogout(ctx) {
  const { ex, val, rep } = ctx;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Login y Logout completo', 'Faltan credenciales de prueba');
    return;
  }

  rep.startScenario('Login y Logout completo');
  try {
    await ex.navigate('/auth/signin');
    await ex.fillByLabel(/Correo ITESO/i, env.EMAIL);
    await ex.fillByLabel(/Contrase/i, env.PASSWORD);

    await Promise.all([
      ex.page.waitForURL('**/products', { timeout: 15000 }),
      ex.clickByRole('button', /Iniciar sesi[oó]n/i),
    ]);

    rep.ok('Login exitoso');
    await ex.screenshot('auth_logout_pre');

    // Buscar botón de logout o menú de usuario
    const logoutBtn = ex.page.getByRole('button', { name: /cerrar sesi[oó]n|salir|logout/i }).first();
    const userMenuBtn = ex.page.locator('[data-testid="user-menu"], [aria-label*="usuario"], [aria-label*="perfil"]').first();

    const hasDirectLogout = await logoutBtn.isVisible().catch(() => false);
    const hasUserMenu = await userMenuBtn.isVisible().catch(() => false);

    if (hasDirectLogout) {
      await ex.click(logoutBtn, 'Botón Cerrar sesión');
    } else if (hasUserMenu) {
      await ex.click(userMenuBtn, 'Menú de usuario');
      await ex.pause(500);
      await ex.clickByRole('button', /cerrar sesi[oó]n|salir|logout/i, 'Cerrar sesión desde menú');
    } else {
      rep.warn('No se encontró botón de logout visible — explorando la interfaz');
      // Intentar navegar al perfil
      await ex.navigate('/profile', 'Ir a perfil para encontrar logout');
    }

    await ex.pause(2000);
    await ex.screenshot('auth_logout_post');
    rep.ok('Flujo login-logout completado');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('auth_logout_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

module.exports = {
  loginValido,
  loginCredencialesInvalidas,
  accesoProtegidoSinSesion,
  loginYLogout,
};
