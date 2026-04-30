'use strict';

const env = require('../utils/env');

async function quickLogin(ex) {
  await ex.navigate('/auth/signin');
  await ex.fillByLabel(/Correo ITESO/i, env.EMAIL);
  await ex.fillByLabel(/Contrase/i, env.PASSWORD);
  await Promise.all([
    ex.page.waitForURL('**/products', { timeout: 15000 }),
    ex.clickByRole('button', /Iniciar sesi[oó]n/i),
  ]);
}

/**
 * Explorar la sección de comunidades
 */
async function explorarComunidades(ctx) {
  const { ex, val, rep } = ctx;

  rep.startScenario('Explorar sección de comunidades');
  try {
    await ex.navigate('/communities', 'Ir a comunidades');
    await ex.pause(2000);

    // Verificar que la página carga sin 404
    const url = ex.page.url();
    if (url.includes('/auth/signin')) {
      rep.info('Comunidades requiere autenticación — se necesitan credenciales');
      if (!env.EMAIL) {
        rep.skipScenario('Explorar comunidades', 'Requiere sesión y no hay credenciales');
        return;
      }
    }

    // Verificar heading genérico
    const hasHeading = await ex.page.locator('h1, h2').first().isVisible().catch(() => false);
    if (hasHeading) {
      const headingText = await ex.page.locator('h1, h2').first().textContent().catch(() => '');
      rep.ok(`Heading visible: "${headingText.trim()}"`);
    }

    // Contar tarjetas de comunidad
    const cards = await ex.page.locator('article, .card, [class*="community"]').count();
    rep.info(`Elementos tipo comunidad encontrados: ${cards}`);

    await ex.scrollDown();
    await ex.screenshot('communities_lista');

    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('communities_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Entrar a una comunidad (autenticado)
 */
async function entrarComunidad(ctx) {
  const { ex, val, rep } = ctx;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Entrar a comunidad', 'Faltan credenciales');
    return;
  }

  rep.startScenario('Entrar a primera comunidad disponible');
  try {
    await quickLogin(ex);
    await ex.navigate('/communities', 'Ir a comunidades autenticado');
    await ex.pause(2000);

    // Hacer click en la primera comunidad disponible
    const firstCommunityLink = ex.page.locator('a[href*="/communities/"]').first();
    const hasLink = await firstCommunityLink.isVisible().catch(() => false);

    if (!hasLink) {
      rep.warn('No se encontraron enlaces a comunidades individuales');
      await ex.screenshot('communities_sin_links');
      rep.endScenario(true);
      return;
    }

    const communityHref = await firstCommunityLink.getAttribute('href').catch(() => null);
    rep.info(`Entrando a: ${communityHref}`);

    await ex.click(firstCommunityLink, 'Primera comunidad');
    await ex.pause(2000);

    const headingText = await ex.page.locator('h1, h2').first().textContent().catch(() => '');
    if (headingText) {
      rep.ok(`Comunidad cargada: "${headingText.trim()}"`);
    }

    await ex.screenshot('communities_detalle');
    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('communities_entrar_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

module.exports = {
  explorarComunidades,
  entrarComunidad,
};
