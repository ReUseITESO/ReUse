'use strict';

const { chromium } = require('@playwright/test');

const { Reporter }  = require('./reporter');
const { Validator } = require('./validator');
const { Executor }  = require('./executor');
const { Explorer }  = require('./explorer');
const { Planner }   = require('./planner');
const { Memory }    = require('./memory');
const { loadStories } = require('./utils/stories');
const env = require('./utils/env');


/**
 * Agent — loop principal de exploración autónoma.
 *
 * Ciclo de vida por cada paso:
 *  1. Registrar URL actual en Memory
 *  2. Explorer descubre acciones disponibles en el DOM
 *  3. Planner elige la siguiente acción
 *  4. Executor ejecuta la acción (con delays humanos)
 *  5. Validator verifica resultado
 *  6. Reporter loguea el paso
 *  7. Memory registra el paso y marca la acción como ejecutada
 *  8. Repetir hasta MAX_STEPS
 */
class Agent {
  constructor(options = {}) {
    this.runId  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    this.opts   = {
      headless:   options.headless   ?? env.HEADLESS,
      slowMo:     options.slowMo     ?? env.SLOW_MO,
      maxSteps:   options.maxSteps   ?? env.MAX_STEPS,
      baseUrl:    options.baseUrl    ?? env.BASE_URL,
      focusPath:  options.focusPath  ?? env.FOCUS_PATH,
    };

    const stories = loadStories();
    this.reporter  = new Reporter(this.runId);
    this.memory    = new Memory();
    this.explorer  = new Explorer(this.reporter);
    this.planner   = new Planner({ 
      focusPath: this.opts.focusPath,
      stories:   stories
    });
    this.browser   = null;
    this.page      = null;
  }


  // ── Main entry point ─────────────────────────────────────────────────────────

  async run() {
    this.reporter.printHeader(this.opts.maxSteps, this.opts.focusPath);

    await this._initBrowser();

    const executor  = new Executor(this.page, this.reporter);
    const validator = new Validator(this.page, this.reporter, this.memory);

    // ── Navegación inicial ───────────────────────────────────────────────────
    // Si hay focus, iniciar directo en esa ruta
    const startUrl = this.opts.focusPath
      ? `${this.opts.baseUrl}${this.opts.focusPath}`
      : this.opts.baseUrl;
    this.reporter.info(`Iniciando exploración en: ${startUrl}`);
    await this.page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await this.page.waitForTimeout(1000);
    this.memory.recordVisit(this.page.url());

    // ── Login directo via API (sin depender del form React) ──────────────────
    if (env.EMAIL && env.PASSWORD) {
      await this._loginDirect();
    }

    // ── Loop principal ───────────────────────────────────────────────────────
    for (let step = 1; step <= this.opts.maxSteps; step++) {
      const currentUrl = this.page.url();
      this.reporter.stepHeader(step, this.opts.maxSteps, currentUrl);

      try {
        await this._runStep(step, executor, validator);
      } catch (err) {
        this.reporter.error(`Error en paso ${step}: ${err.message}`);
        this.memory.recordError({ type: 'agent', step, message: err.message });

        // Screenshot en error grave
        await this.reporter.captureScreenshot(this.page, `error_step${step}`);

        // Intentar recuperación: navegar al inicio
        if (step < this.opts.maxSteps) {
          this.reporter.info('Recuperando: navegando al inicio...');
          await this.page.goto(this.opts.baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
          await this.page.waitForTimeout(800);
        }
      }
    }

    // ── Fin ──────────────────────────────────────────────────────────────────
    this.reporter.printSummary(this.memory);
    const reportPath = this.reporter.saveReport(this.memory);

    await this.browser.close();

    return {
      runId:      this.runId,
      reportPath,
      errors:     this.memory.errors.length,
      urlsVisited: this.memory.visitedUrls.size,
    };
  }

  // ── Single step ──────────────────────────────────────────────────────────────

  async _runStep(stepNum, executor, validator) {
    const currentUrl = this.page.url();
    this.memory.recordVisit(currentUrl);

    // 1. Descubrir acciones
    const discovered = await this.explorer.discover(this.page);

    // Registrar URLs de links como pending (para escape de loops)
    this.planner.registerDiscoveredUrls(discovered, this.memory);

    // 2. Elegir acción
    const action = await this.planner.choose(discovered, this.memory, currentUrl, this.reporter);


    if (!action) {
      this.reporter.info('Sin acciones disponibles — navegando al inicio');
      await this.page.goto(this.opts.baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      return;
    }

    // Marcar como ejecutada ANTES (evita que se vuelva a elegir si falla)
    this.memory.markExecuted(action.fingerprint);

    // Manejar intento de login especialmente
    if (action._useRealCredentials) {
      this.memory.authAttempted = true;
    }

    // 3. Ejecutar
    const execResult = await executor.execute(action);

    // 4. Validar
    const valResult = await validator.validate(execResult);

    // 5. Detectar autenticación exitosa
    if (action._useRealCredentials && execResult.success) {
      // Esperar hasta 3s a que Next.js complete la navegación post-login
      try {
        await this.page.waitForURL(
          url => !url.includes('/auth/') && !url.includes('/login') && !url.includes('/signin'),
          { timeout: 3000 }
        );
      } catch { /* no navegó — puede seguir en /auth/ por credenciales incorrectas */ }

      const nowUrl = this.page.url();
      if (!nowUrl.includes('/auth/') && !nowUrl.includes('/login') && !nowUrl.includes('/signin')) {
        this.memory.isAuthenticated = true;
        this.reporter.ok('✅ Autenticación exitosa');
      } else {
        this.reporter.warn('⚠ Login ejecutado pero la URL sigue en /auth/ — credenciales incorrectas o error');
      }
    }

    // 6. Screenshot en errores graves
    if (valResult.isErrorPage || (valResult.httpErrors.some(e => e.status >= 500))) {
      await this.reporter.captureScreenshot(this.page, `error_${action.type}_step${stepNum}`);
    }

    // Screenshot ocasional en acciones importantes (forms)
    if (action.type === 'form' && execResult.success) {
      await this.reporter.captureScreenshot(this.page, `form_submit_step${stepNum}`);
    }

    // 7. Registrar en reporter y memory
    const stepData = {
      step:       stepNum,
      action:     action.type,
      target:     action.text || action.href || action.formAction || '',
      fingerprint: action.fingerprint,
      urlBefore:  execResult.urlBefore,
      urlAfter:   execResult.urlAfter,
      success:    execResult.success,
      severity:   valResult.severity,
      notes:      valResult.notes,
      formErrors: valResult.formErrors,
    };

    this.reporter.recordStep(stepData);
    this.memory.recordStep(stepData);

    // 8. Log de resultado
    const icon = execResult.success ? '✓' : '✗';
    const sev  = valResult.severity === 'error' ? '🔴' : valResult.severity === 'warn' ? '🟡' : '🟢';
    this.reporter.info(`${sev} Paso ${stepNum} ${icon} [${action.type}] → ${execResult.urlAfter?.replace(/^https?:\/\/[^/]+/, '') || '?'}`);

    // Pequeña pausa entre pasos
    await this.page.waitForTimeout(200 + Math.floor(Math.random() * 300));
  }

  // ── Browser init ─────────────────────────────────────────────────────────────

  async _initBrowser() {
    this.browser = await chromium.launch({
      headless: this.opts.headless,
      slowMo:   this.opts.slowMo,
      args:     ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await this.browser.newContext({
      baseURL:    this.opts.baseUrl,
      viewport:   { width: 1280, height: 800 },
      locale:     'es-MX',
      timezoneId: 'America/Mexico_City',
      userAgent:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
    });

    this.page = await context.newPage();

    // Registrar crashes de página
    this.page.on('pageerror', err => {
      this.reporter.warn(`[PageError] ${err.message}`);
      this.memory.recordError({ type: 'page_crash', message: err.message });
    });
  }

  // ── Login directo via API + localStorage ──────────────────────────────────────

  async _loginDirect() {
    this.reporter.info(`🔑 Intentando login directo como: ${env.EMAIL}`);
    try {
      // Llamar al API de login desde el contexto del browser (misma origin = sin CORS)
      const result = await this.page.evaluate(
        async ({ apiBase, email, password }) => {
          try {
            const res = await fetch(`${apiBase}/auth/signin/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              return { success: false, error: body?.error?.message ?? `HTTP ${res.status}` };
            }
            const data = await res.json();
            // Guardar tokens igual que hace storeTokens() en auth.ts
            localStorage.setItem('reuse_access_token',  data.tokens.access);
            localStorage.setItem('reuse_refresh_token', data.tokens.refresh);
            return { success: true, user: data.user?.email };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        {
          apiBase:  'http://localhost:8000/api',
          email:    env.EMAIL,
          password: env.PASSWORD,
        }
      );

      if (result.success) {
        this.memory.isAuthenticated = true;
        this.memory.authAttempted   = true;
        this.reporter.ok(`✅ Login exitoso como: ${result.user}`);
        // Recargar para que Next.js lea los tokens del localStorage
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
        await this.page.waitForTimeout(1500);
      } else {
        this.reporter.warn(`⚠ Login fallido: ${result.error}`);
        this.memory.authAttempted = true;
      }
    } catch (err) {
      this.reporter.warn(`⚠ Error en login directo: ${err.message}`);
      this.memory.authAttempted = true;
    }
  }
}

module.exports = { Agent };
