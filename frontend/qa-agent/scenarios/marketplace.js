'use strict';

const env = require('../utils/env');
const { randomProductTitle, randomProductDescription, randomPrice, randomSearchTerm, randomItem, randomBool } = require('../utils/faker');

// Helper: login rápido antes de un escenario autenticado
async function quickLogin(ex) {
  await ex.navigate('/auth/signin', 'Login previo');
  await ex.fillByLabel(/Correo ITESO/i, env.EMAIL);
  await ex.fillByLabel(/Contrase/i, env.PASSWORD);
  await Promise.all([
    ex.page.waitForURL('**/products', { timeout: 15000 }),
    ex.clickByRole('button', /Iniciar sesi[oó]n/i),
  ]);
}

/**
 * Explora la lista de productos sin autenticación
 */
async function explorarListaProductosSinSesion(ctx) {
  const { ex, val, rep } = ctx;

  rep.startScenario('Explorar lista de productos (sin sesión)');
  try {
    await ex.navigate('/products', 'Ir al marketplace');
    await val.assertRoleVisible('heading', /Productos disponibles/i);
    await ex.screenshot('mkt_lista_productos');

    // Contar tarjetas de productos
    await ex.pause(1500);
    const productCards = await ex.page.locator('article, [data-testid*="product"], .card').count();
    rep.info(`Productos visibles en pantalla: ${productCards}`);

    // Scroll para ver más
    await ex.scrollDown();
    await ex.screenshot('mkt_lista_scroll');

    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_lista_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Ver detalle de un producto específico (ID configurado en .env)
 */
async function verDetalleProducto(ctx) {
  const { ex, val, rep } = ctx;
  const productId = env.COMMENT_PRODUCT_ID;

  rep.startScenario(`Ver detalle de producto #${productId}`);
  try {
    await ex.navigate(`/products/${productId}`, `Abrir producto ${productId}`);
    await ex.pause(2000);

    // Verificar que no redirige a error o 404
    const url = ex.page.url();
    if (url.includes('/404') || url.includes('/not-found')) {
      throw new Error(`Producto ${productId} no encontrado (404)`);
    }

    // Verificar sección de comentarios
    const hasComments = await ex.page.getByRole('heading', { name: /Comentarios/i }).first().isVisible().catch(() => false);
    if (hasComments) {
      rep.ok('Sección de comentarios visible');
    }

    // Verificar botones de reacción
    const hasLike = await ex.page.getByRole('button', { name: /Me gusta/i }).first().isVisible().catch(() => false);
    if (hasLike) {
      rep.ok('Botón de reacción visible');
    }

    await ex.screenshot('mkt_detalle_producto');
    val.reportNetworkErrors();
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_detalle_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Publicar un nuevo artículo (autenticado)
 */
async function publicarProducto(ctx) {
  const { ex, val, rep } = ctx;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Publicar nuevo artículo', 'Faltan credenciales de prueba');
    return;
  }

  const title = randomProductTitle();
  const description = randomProductDescription();
  const price = randomPrice();
  const transactionTypes = ['Venta', 'Donación', 'Intercambio'];
  const txType = randomItem(transactionTypes);

  rep.startScenario(`Publicar artículo (${txType}): "${title}"`);
  try {
    await quickLogin(ex);
    await ex.navigate('/products/new', 'Ir a formulario de publicación');
    await val.assertRoleVisible('heading', /Publicar art[ií]culo/i);

    await ex.fillByLabel(/T[ií]tulo/i, title, 'Título del producto');
    await ex.fillByLabel(/Descripci[oó]n/i, description, 'Descripción');

    // Seleccionar tipo de transacción aleatoria
    await ex.clickByRole('button', new RegExp(txType, 'i'), `Tipo: ${txType}`);
    await ex.pause(500);

    // Solo llenar precio si aplica (Venta)
    if (txType === 'Venta') {
      const priceLabel = ex.page.getByLabel(/Precio \(MXN\)/i);
      const priceVisible = await priceLabel.isVisible().catch(() => false);
      if (priceVisible) {
        await ex.fill(priceLabel, price, `Precio: $${price}`);
      }
    }

    await ex.screenshot('mkt_publicar_form');

    // Escuchar la respuesta de creación
    const createResponsePromise = ex.page.waitForResponse(
      response =>
        response.url().includes('/api/marketplace/products') &&
        response.request().method() === 'POST',
      { timeout: 15000 }
    ).catch(() => null);

    await ex.clickByRole('button', /Publicar art[ií]culo/i, 'Enviar formulario');

    const createResponse = await createResponsePromise;
    if (createResponse && createResponse.status() !== 201) {
      const body = await createResponse.text().catch(() => '(no body)');
      throw new Error(`API respondió ${createResponse.status()}: ${body}`);
    }

    // Esperar redirección a lista
    await ex.page.waitForURL('**/products', { timeout: 12000 });
    await val.assertRoleVisible('heading', /Productos disponibles/i);

    // Verificar que el título aparece en la lista
    const productVisible = await ex.page.getByText(title, { exact: false }).first().isVisible().catch(() => false);
    if (productVisible) {
      rep.ok(`Producto "${title}" aparece en el listado`);
    } else {
      rep.warn(`Producto publicado pero no visible inmediatamente en listado`);
    }

    await ex.screenshot('mkt_publicar_exito');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_publicar_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Intentar publicar artículo sin autenticación → debe redirigir
 */
async function publicarSinSesion(ctx) {
  const { ex, val, rep } = ctx;

  rep.startScenario('Intento de publicar sin sesión activa');
  try {
    await ex.navigate('/products/new', 'Ir a /products/new sin sesión');
    await ex.pause(2000);

    await val.assertUrlContains('/auth/signin', { timeout: 8000 });
    await val.assertVisible('input, [type="email"]', 'Campo de email de login');
    await ex.screenshot('mkt_publicar_sin_sesion');

    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_publicar_sin_sesion_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Agregar comentario a un producto
 */
async function comentarProducto(ctx) {
  const { ex, val, rep } = ctx;
  const productId = env.COMMENT_PRODUCT_ID;

  if (!env.EMAIL || !env.PASSWORD) {
    rep.skipScenario('Comentar en producto', 'Faltan credenciales');
    return;
  }

  const commentText = `Comentario QA ${Date.now()} 🤖`;

  rep.startScenario(`Comentar en producto #${productId}`);
  try {
    await quickLogin(ex);
    await ex.navigate(`/products/${productId}`, `Abrir producto ${productId}`);

    await val.assertRoleVisible('heading', /Comentarios/i);

    const commentResponsePromise = ex.page.waitForResponse(
      response =>
        response.url().includes(`/api/marketplace/products/${productId}/comments`) &&
        response.request().method() === 'POST',
      { timeout: 12000 }
    ).catch(() => null);

    await ex.fillByPlaceholder(/Escribe un comentario/i, commentText, 'Escribir comentario');
    await ex.clickByRole('button', /^Comentar$/i, 'Enviar comentario');

    const commentResponse = await commentResponsePromise;
    if (commentResponse && commentResponse.status() !== 201) {
      const body = await commentResponse.text().catch(() => '');
      throw new Error(`Comentario rechazado por API: ${commentResponse.status()} — ${body}`);
    }

    // Verificar que el comentario aparece
    await val.assertTextVisible(commentText);
    await ex.screenshot('mkt_comentario_exito');

    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_comentario_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Verificar que comentarios están deshabilitados sin sesión
 */
async function comentariosSinSesion(ctx) {
  const { ex, val, rep } = ctx;
  const productId = env.COMMENT_PRODUCT_ID;

  rep.startScenario(`Comentarios deshabilitados sin sesión (producto #${productId})`);
  try {
    await ex.navigate(`/products/${productId}`);
    await ex.pause(2000);

    // Verificar que NO hay campo de comentario
    const hasInput = await ex.page.getByPlaceholder(/Escribe un comentario/i).isVisible().catch(() => false);
    if (hasInput) {
      throw new Error('El campo de comentario está visible sin autenticación');
    }

    // Verificar mensaje de "inicia sesión"
    const hasLoginMsg = await ex.page.getByText(/Inicia sesi[oó]n/i).first().isVisible().catch(() => false);
    if (hasLoginMsg) {
      rep.ok('Mensaje "Inicia sesión" visible para usuario no autenticado');
    }

    await ex.screenshot('mkt_comentario_sin_sesion');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_comentario_sin_sesion_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

/**
 * Dar reacción a un producto
 */
async function reaccionarProducto(ctx) {
  const { ex, val, rep } = ctx;
  const productId = env.REACTION_PRODUCT_ID;

  if (!env.EMAIL || !env.PASSWORD || !productId) {
    rep.skipScenario('Reaccionar a producto', 'Faltan credenciales o PLAYWRIGHT_REACTION_PRODUCT_ID');
    return;
  }

  rep.startScenario(`Reaccionar a producto #${productId} (Me gusta)`);
  try {
    await quickLogin(ex);
    await ex.navigate(`/products/${productId}`);

    const likeBtn = ex.page.getByRole('button', { name: /^Me gusta:/i });
    await likeBtn.waitFor({ state: 'visible', timeout: 8000 });

    // Si ya tiene la reacción activa, quitarla primero
    const currentClass = await likeBtn.getAttribute('class').catch(() => '');
    if (currentClass && currentClass.includes('text-success')) {
      rep.info('Reacción ya activa, limpiando primero...');
      await likeBtn.click();
      await ex.pause(1000);
    }

    const reactionPromise = ex.page.waitForResponse(
      response =>
        response.url().includes(`/api/marketplace/products/${productId}/reactions`) &&
        ['POST', 'DELETE'].includes(response.request().method()),
      { timeout: 10000 }
    ).catch(() => null);

    await ex.click(likeBtn, 'Dar Me gusta');

    const reaction = await reactionPromise;
    if (reaction && reaction.status() !== 200) {
      const body = await reaction.text().catch(() => '');
      throw new Error(`Reacción rechazada: ${reaction.status()} — ${body}`);
    }

    // Verificar clase activa
    await ex.pause(500);
    const updatedClass = await likeBtn.getAttribute('class').catch(() => '');
    if (updatedClass && updatedClass.includes('text-success')) {
      rep.ok('Botón "Me gusta" marcado como activo');
    } else {
      rep.warn('Reacción enviada pero estado visual no confirmado');
    }

    await ex.screenshot('mkt_reaccion_exito');
    rep.endScenario(true);
  } catch (err) {
    await ex.screenshot('mkt_reaccion_error');
    rep.endScenario(false, err.message);
    throw err;
  }
}

module.exports = {
  explorarListaProductosSinSesion,
  verDetalleProducto,
  publicarProducto,
  publicarSinSesion,
  comentarProducto,
  comentariosSinSesion,
  reaccionarProducto,
};
