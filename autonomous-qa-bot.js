const { chromium } = require('playwright');
const { faker } = require('@faker-js/faker');

// ==========================================
// CONFIGURACIÓN DEL BOT
// ==========================================
const MAX_ITERATIONS = 50;
const START_URL = 'http://localhost:3001'; // Cambia esto por la URL de tu app local o de staging

// Memoria del bot
const visitedUrls = new Set();
const errorsLog = [];

/**
 * Función para llenar un formulario con datos aleatorios usando Faker
 */
async function fillForm(page, formHandle) {
    console.log("📝 Llenando formulario con datos aleatorios...");
    // Buscar inputs dentro del formulario
    const inputs = await formHandle.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea');
    
    for (const input of inputs) {
        try {
            const type = await input.getAttribute('type');
            const name = (await input.getAttribute('name')) || '';
            
            let randomData = faker.lorem.word(); // Por defecto texto corto
            
            if (type === 'email' || name.toLowerCase().includes('email')) {
                randomData = faker.internet.email();
            } else if (type === 'number' || name.toLowerCase().includes('phone') || name.toLowerCase().includes('telefono')) {
                randomData = faker.number.int({ min: 1000000000, max: 9999999999 }).toString();
            } else if (type === 'password' || name.toLowerCase().includes('password')) {
                randomData = faker.internet.password() + "1A!"; // Asegurar complejidad
            } else if (name.toLowerCase().includes('name') || name.toLowerCase().includes('nombre')) {
                randomData = faker.person.fullName();
            } else if (await input.evaluate(el => el.tagName.toLowerCase()) === 'textarea') {
                randomData = faker.lorem.paragraph();
            }

            await input.fill(randomData);
        } catch (e) {
            // Ignorar si un elemento específico no se puede llenar
        }
    }

    // Intentar enviar el formulario
    try {
        const submitBtn = await formHandle.$('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            await submitBtn.click({ timeout: 5000 });
            console.log("✅ Formulario enviado vía botón de submit.");
        } else {
            await formHandle.evaluate(form => form.submit());
            console.log("✅ Formulario enviado forzando submit().");
        }
    } catch (e) {
        console.log("⚠️ No se pudo enviar el formulario automáticamente.");
    }
}

/**
 * Función principal del bot explorador
 */
async function runBot() {
    console.log("🚀 Iniciando Bot Autónomo de QA...");
    // Lanzamos en modo visible (headless: false) para que veas qué está haciendo
    const browser = await chromium.launch({ headless: false, slowMo: 500 }); 
    const context = await browser.newContext();
    const page = await context.newPage();

    // ==========================================
    // DETECCIÓN DE ERRORES (Console & HTTP)
    // ==========================================
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const errorText = msg.text();
            console.error(`❌ [JS Error] ${errorText}`);
            errorsLog.push({ type: 'JS_ERROR', url: page.url(), message: errorText });
        }
    });

    page.on('response', response => {
        const status = response.status();
        // Detectar errores 4xx o 5xx
        if (status >= 400 && status < 600) {
            console.error(`🚨 [HTTP Error ${status}] en la URL: ${response.url()}`);
            errorsLog.push({ type: 'HTTP_ERROR', status: status, url: response.url() });
        }
    });

    try {
        await page.goto(START_URL);
        
        // --- LOGIN EXPLÍCITO ---
        console.log("🔐 Intentando iniciar sesión con el bot de prueba...");
        try {
            await page.goto(`${START_URL}/auth/signin`);
            // Esperar a que cargue el formulario
            await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
            
            // Llenar credenciales (Superusuario creado)
            await page.fill('input[type="email"], input[name="email"]', 'bot@test.com');
            await page.fill('input[type="password"], input[name="password"]', 'QA_Bot_Password123!');
            
            // Hacer click en el botón submit
            const submitBtn = await page.$('button[type="submit"]');
            if (submitBtn) {
                await submitBtn.click();
            } else {
                await page.evaluate(() => document.querySelector('form').submit());
            }
            
            // Esperar que procese el login y redirija
            await page.waitForTimeout(4000); 
            console.log("✅ Inicio de sesión completado. Procediendo con la exploración...");
            
            // Regresar al inicio para empezar la ruta
            await page.goto(START_URL);
            await page.waitForTimeout(2000);
        } catch (e) {
            console.log("⚠️ No se encontró el formulario de login o falló el inicio de sesión. Explorando como invitado...");
            await page.goto(START_URL);
        }
        
        // Bucle de exploración
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            console.log(`\n--- Iteración ${i + 1} de ${MAX_ITERATIONS} ---`);
            
            // 1. Añadir a memoria y esperar estabilidad
            const currentUrl = page.url().split('?')[0].split('#')[0]; // Limpiar la URL de hashes/queryparams básicos
            visitedUrls.add(currentUrl);
            await page.waitForTimeout(2000); // Esperar que animaciones o peticiones terminen

            // 2. Escáner de la página actual
            const forms = await page.$$('form:visible');
            const buttons = await page.$$('button:visible');
            const links = await page.$$('a:visible');

            const availableActions = [];
            
            // Clasificamos lo encontrado
            for (const f of forms) availableActions.push({ type: 'form', element: f });
            for (const b of buttons) availableActions.push({ type: 'button', element: b });
            
            // Filtramos enlaces para priorizar los que no hemos visitado
            for (const l of links) {
                try {
                    const href = await l.getAttribute('href');
                    if (href && !href.startsWith('javascript') && !href.startsWith('#')) {
                        const absoluteUrl = new URL(href, page.url()).href.split('?')[0].split('#')[0];
                        // Solo agregamos enlaces que apuntan a lugares no visitados
                        if (!visitedUrls.has(absoluteUrl)) {
                            availableActions.push({ type: 'link', element: l, href: absoluteUrl });
                        }
                    }
                } catch(e) { } // Ignorar enlaces rotos
            }

            // Si estamos atrapados sin opciones, volvemos atrás
            if (availableActions.length === 0) {
                console.log("🔄 No hay elementos nuevos. Intentando volver atrás...");
                try {
                    await page.goBack();
                } catch (e) {
                    await page.goto(START_URL); // Si no puede volver, reinicia
                }
                continue;
            }

            // 3. Decisión Aleatoria
            const randomPick = availableActions[Math.floor(Math.random() * availableActions.length)];
            console.log(`🤖 Decisión: Interactuar con un <${randomPick.type}>`);

            // 4. Interacción
            try {
                if (randomPick.type === 'form') {
                    await fillForm(page, randomPick.element);
                } else if (randomPick.type === 'link') {
                    console.log(`🔗 Navegando hacia: ${randomPick.href}`);
                    await randomPick.element.click({ timeout: 5000 });
                } else if (randomPick.type === 'button') {
                    const btnText = await randomPick.element.innerText();
                    console.log(`🔘 Haciendo clic en botón: ${btnText.substring(0, 30).trim()}`);
                    await randomPick.element.click({ timeout: 5000 });
                }
            } catch (error) {
                console.log(`⚠️ Elemento interceptado o no clickeable. Pasando al siguiente ciclo.`);
            }
        }
        
        // Resumen final
        console.log("\n==========================================");
        console.log("✅ EXPLORACIÓN FINALIZADA");
        console.log(`Páginas únicas visitadas: ${visitedUrls.size}`);
        console.log(`Errores detectados: ${errorsLog.length}`);
        
        if (errorsLog.length > 0) {
            console.log("📋 Resumen de Errores:");
            console.table(errorsLog);
        } else {
            console.log("🎉 ¡El bot no encontró ningún error HTTP ni de JS en consola!");
        }
        console.log("==========================================");

    } catch (error) {
        console.error("❌ Error crítico en el agente explorador:", error);
    } finally {
        await browser.close();
    }
}

runBot();
