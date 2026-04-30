'use strict';

const { forField, randomDelay, randomInt, randomBool, randomItem } = require('./utils/faker');
const env = require('./utils/env');

/**
 * Executor — ejecuta las acciones elegidas por el Planner.
 *
 * Soporta:
 *  - Formularios completos (fill todos los campos → submit)
 *  - Clicks en botones
 *  - Navegación por links
 *  - Navegación directa (URL)
 *  - Ir atrás
 *  - Scroll ocasional (comportamiento humano)
 *
 * Django-aware:
 *  - CSRF: Playwright maneja cookies automáticamente (no requiere acción especial)
 *  - POST→Redirect: espera cambio de URL tras submit
 *  - Formularios server-rendered: re-localiza elementos antes de cada acción
 */
class Executor {
  constructor(page, reporter) {
    this.page     = page;
    this.reporter = reporter;
  }

  // ── Entry point ─────────────────────────────────────────────────────────────

  async execute(action) {
    const result = {
      action:     action.type,
      target:     action.text || action.href || action.formAction || '',
      urlBefore:  this.page.url(),
      urlAfter:   null,
      success:    false,
      details:    '',
    };

    try {
      // Scroll ocasional antes de actuar (comportamiento humano)
      if (randomBool(0.25)) await this._humanScroll();

      switch (action.type) {
        case 'form':     await this._executeForm(action);     break;
        case 'button':   await this._executeButton(action);   break;
        case 'link':     await this._executeLink(action);     break;
        case 'navigate': await this._executeNavigate(action); break;
        case 'back':     await this._executeBack();           break;
        default:
          result.details = `Tipo de acción desconocido: ${action.type}`;
          return result;
      }

      await this._waitForSettle();
      result.urlAfter = this.page.url();
      result.success  = true;
    } catch (err) {
      result.urlAfter = this.page.url();
      result.details  = err.message;
      result.success  = false;
    }

    return result;
  }

  // ── Form execution ───────────────────────────────────────────────────────────

  async _executeForm(action) {
    this.reporter.step('form', `Llenando formulario (${action.fields.length} campos) → "${action.submitText}"`);

    const isLoginForm = action._useRealCredentials || action.isLoginForm;
    const credOpts = isLoginForm
      ? { useRealCredentials: true, email: env.EMAIL, password: env.PASSWORD }
      : {};

    // Re-localizar el formulario en el DOM actual (puede haber cambiado)
    const form = this.page.locator('form').nth(action.index);

    for (const field of action.fields) {
      await this._humanDelay(40, 120);
      const value = forField(field, credOpts);
      await this._fillField(form, field, value);
    }

    this.reporter.step('submit', `Enviando formulario "${action.submitText}"`);
    await this._humanDelay(100, 300);

    // Timeout más largo para login (Next.js SPA hace router.push async)
    const navTimeout = isLoginForm ? 15000 : 10000;

    const submitBtn = form.locator('[type="submit"], button[type="submit"], button:not([type])').first();
    const urlBefore = this.page.url();

    // 1. Esperar a que el botón esté habilitado (React lo deshabilita con disabled={isSubmitting})
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    try {
      await submitBtn.evaluate(el => {
        // Esperar hasta 2s a que el botón no esté disabled
        return new Promise((resolve) => {
          const check = () => el.disabled ? setTimeout(check, 100) : resolve();
          check();
          setTimeout(resolve, 2000); // timeout fallback
        });
      });
    } catch { /* ignorar */ }

    // 2. Click en el botón de submit
    await submitBtn.click({ timeout: 8000 }).catch(async () => {
      // Fallback: submit via keyboard
      await this.page.keyboard.press('Enter').catch(() => {});
    });

    // 2. Esperar que la app reaccione
    //    Login SPA: esperar que la URL salga de /auth/ o que la red se calme
    try {
      await Promise.race([
        this.page.waitForURL(url => url !== urlBefore, { timeout: navTimeout }),
        this.page.waitForLoadState('networkidle',        { timeout: navTimeout }),
      ]);
    } catch {
      // Sin navegación → quedó en la misma página (error de validación, etc.)
    }

    // 3. Para login: esperar un poco más por el router.push de Next.js
    if (isLoginForm) {
      await this._humanDelay(500, 1000);
    }
  }

  async _fillField(form, field, value) {
    try {
      let locator;

      if (field.id) {
        locator = this.page.locator(`#${CSS.escape(field.id)}`);
      } else if (field.name) {
        const tag = field.kind === 'textarea' ? 'textarea' : field.kind === 'select' ? 'select' : 'input';
        locator = form.locator(`${tag}[name="${field.name}"]`);
      } else {
        return; // No podemos localizar el campo
      }

      if (!await locator.isVisible().catch(() => false)) return;

      if (field.kind === 'select') {
        if (field.options && field.options.length > 0) {
          const opt = randomItem(field.options.filter(o => o.value));
          if (opt) {
            await locator.selectOption({ value: opt.value });
            this.reporter.debug(`  select [${field.name}] → "${opt.text}"`);
          }
        }
        return;
      }

      // Input / Textarea — usar pressSequentially para disparar el onChange de React
      await locator.click().catch(() => {});
      await this._humanDelay(30, 80);
      // Limpiar primero (triple-click selecciona todo, luego sobreescribimos)
      await locator.press('Control+a');
      await locator.pressSequentially(value, { delay: 30 });
      this.reporter.debug(`  fill [${field.name || field.id}] type=${field.type} → "${value.slice(0, 30)}"`);
    } catch (err) {
      this.reporter.warn(`  No se pudo llenar campo [${field.name}]: ${err.message}`);
    }
  }

  // ── Button execution ─────────────────────────────────────────────────────────

  async _executeButton(action) {
    this.reporter.step('click', `Botón: "${action.text}"`);
    await this._humanDelay(80, 250);

    // Re-localizar por texto (más robusto que guardar el locator)
    const btn = this.page.getByRole('button', { name: action.text, exact: false }).first();
    const fallback = this.page.getByText(action.text, { exact: false }).first();

    const target = await btn.isVisible().catch(() => false) ? btn : fallback;
    await target.click({ timeout: 6000 });
  }

  // ── Link execution ────────────────────────────────────────────────────────────

  async _executeLink(action) {
    this.reporter.step('navigate', `Link: "${action.text || action.href}" → ${action.href}`);
    await this._humanDelay(100, 300);

    // Prefer direct navigation (faster and more reliable than click for SPAs)
    const href = action.href;
    if (href.startsWith('http')) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded', timeout: 12000 });
    } else {
      await this.page.goto(href, { waitUntil: 'domcontentloaded', timeout: 12000 });
    }
  }

  // ── Direct navigation ─────────────────────────────────────────────────────────

  async _executeNavigate(action) {
    this.reporter.step('navigate', `Directo → ${action.href}`);
    await this._humanDelay(150, 400);
    await this.page.goto(action.href, { waitUntil: 'domcontentloaded', timeout: 12000 });
  }

  // ── Back ──────────────────────────────────────────────────────────────────────

  async _executeBack() {
    this.reporter.step('back', 'Navegando atrás');
    await this._humanDelay(200, 500);
    await this.page.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
  }

  // ── Human-like helpers ────────────────────────────────────────────────────────

  async _humanScroll() {
    const direction = randomBool(0.7) ? 'down' : 'up';
    const amount = randomInt(150, 600);
    await this.page.evaluate(
      ({ dir, px }) => window.scrollBy(0, dir === 'down' ? px : -px),
      { dir: direction, px: amount }
    ).catch(() => {});
    await this._humanDelay(100, 300);
  }

  async _humanDelay(min = 60, max = 300) {
    await this.page.waitForTimeout(randomDelay(min, max));
  }

  async _waitForSettle() {
    // Wait for any pending network requests to complete (max 4s)
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    await this._humanDelay(100, 250);
  }
}

// CSS.escape polyfill for Node.js
if (typeof CSS === 'undefined') {
  global.CSS = {
    escape: (str) => str.replace(/([^\w-])/g, '\\$1'),
  };
}

module.exports = { Executor };
