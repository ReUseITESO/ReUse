'use strict';

const env = require('../utils/env');
const { randomItem, shuffle } = require('../utils/faker');

async function quickLogin(ex) {
  await ex.navigate('/auth/signin');
  await ex.fillByLabel(/Correo ITESO/i, env.EMAIL);
  await ex.fillByLabel(/Contrase/i, env.PASSWORD);
  await Promise.all([
    ex.page.waitForURL('**/products', { timeout: 15000 }),
    ex.clickByRole('button', /Iniciar sesi[oó]n/i),
  ]);
}

// Rutas públicas (no requieren sesión)
const PUBLIC_ROUTES = ['/products'];

// Rutas protegidas (requieren sesión)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/communities',
  '/friends',
  '/transactions',
  '/transaction-history',
  '/products/new',
];

/**
 * Tour de rutas públicas — verifica que cargan sin errores 500
 */
async function tourRutasPublicas(ctx) {
  const { ex, val, rep } = ctx;

  rep.startScenario('Tour de rutas públicas');
  try {
    for (const route of PUBLIC_ROUTES) {
      await ex.navigate(route, `Ruta: ${route}`);
      await ex.pause(1500);

      const url = ex.page.url();
      const is404 = url.includes('/404') || url.includes('/not-found');
      const isError = url.includes('/error') || url.includes('/500');

      if (is404 || isError) {
        rep.warn(`Ruta ${route} devolvió error: ${url}`);
      } else {
        rep.ok(`Ruta ${route} cargó correctamente`);
      }

      await ex.scrollDown();
    }

    await ex.screenshot('nav_rutas_publicas');
    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('nav_rutas_publicas_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Tour de rutas protegidas (autenticado) — orden aleatorio para variabilidad
 */
async function tourRutasProtegidas(ctx) {
  const { ex, val, rep } = ctx;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Tour rutas protegidas', 'Faltan credenciales');
    return;
  }

  const routeSubset = shuffle(PROTECTED_ROUTES).slice(0, 4); // Toma 4 rutas en orden random

  rep.startScenario(`Tour rutas protegidas: [${routeSubset.join(', ')}]`);
  try {
    await quickLogin(ex);

    for (const route of routeSubset) {
      // Saltar /products/new — ya está cubierto en marketplace
      if (route === '/products/new') {
        rep.info(`Saltando ${route} (cubierto en marketplace)`);
        continue;
      }

      await ex.navigate(route, `Ruta protegida: ${route}`);
      await ex.pause(1500);

      const url = ex.page.url();

      // Si redirige de vuelta a login = ruta incorrectamente protegida / bug
      if (url.includes('/auth/signin') && route !== '/auth/signin') {
        rep.warn(`Ruta ${route} redirigió a login (¿sesión expiró?)`);
        continue;
      }

      const is404 = url.includes('/404') || url.includes('/not-found');
      if (is404) {
        rep.warn(`Ruta ${route} → 404`);
      } else {
        rep.ok(`Ruta ${route} accesible`);
        await ex.scrollDown();
      }
    }

    await ex.screenshot('nav_tour_protegidas');
    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('nav_tour_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Verificar que rutas protegidas redirigen si no hay sesión
 */
async function verificarRedireccionesProtegidas(ctx) {
  const { ex, val, rep } = ctx;

  const routesToTest = ['/dashboard', '/profile', '/products/new'];

  rep.startScenario('Verificar redirecciones de rutas protegidas');
  try {
    for (const route of routesToTest) {
      await ex.navigate(route, `Acceso sin sesión: ${route}`);
      await ex.pause(2000);

      const url = ex.page.url();
      if (url.includes('/auth/signin')) {
        rep.ok(`${route} → redirige correctamente a /auth/signin`);
      } else if (!url.includes(route)) {
        rep.ok(`${route} → redirigido a ${url}`);
      } else {
        rep.warn(`${route} accesible sin sesión (¿falta protección?)`);
      }
    }

    await ex.screenshot('nav_redirecciones');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('nav_redirecciones_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Verificar página 404 personalizada
 */
async function verificar404(ctx) {
  const { ex, val, rep } = ctx;

  const fakePath = `/ruta-inexistente-${Date.now()}`;

  rep.startScenario(`Verificar página 404 (${fakePath})`);
  try {
    await ex.navigate(fakePath, 'Ruta inexistente');
    await ex.pause(2000);

    // Verificar que hay algún contenido de 404
    const has404Text = await ex.page.getByText(/404|no encontr|not found/i).first().isVisible().catch(() => false);
    if (has404Text) {
      rep.ok('Página 404 personalizada mostrada');
    } else {
      rep.warn('La ruta no devuelve un 404 reconocible');
    }

    await ex.screenshot('nav_404');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('nav_404_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Exploración del dashboard autenticado
 */
async function explorarDashboard(ctx) {
  const { ex, val, rep } = ctx;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Explorar dashboard', 'Faltan credenciales');
    return;
  }

  rep.startScenario('Explorar dashboard autenticado');
  try {
    await quickLogin(ex);
    await ex.navigate('/dashboard', 'Ir al dashboard');
    await ex.pause(2000);

    const url = ex.page.url();
    if (url.includes('/auth/signin')) {
      throw new Error('Dashboard redirigió a login tras autenticación exitosa');
    }

    const headingText = await ex.page.locator('h1, h2').first().textContent().catch(() => '');
    if (headingText) {
      rep.ok(`Dashboard heading: "${headingText.trim()}"`);
    }

    await ex.scrollDown();
    await ex.screenshot('nav_dashboard');

    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('nav_dashboard_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

module.exports = {
  tourRutasPublicas,
  tourRutasProtegidas,
  verificarRedireccionesProtegidas,
  verificar404,
  explorarDashboard,
};
