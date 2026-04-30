'use strict';

/**
 * Explorer — descubrimiento dinámico del DOM en tiempo real.
 *
 * Detecta en la página actual:
 *  - Formularios con todos sus campos
 *  - Botones interactivos fuera de formularios
 *  - Links navegables
 *
 * Genera un fingerprint único por acción para que Memory
 * pueda evitar repeticiones.
 */
class Explorer {
  constructor(reporter) {
    this.reporter = reporter;
  }

  /**
   * Punto de entrada principal.
   * Devuelve un array de "ActionDescriptor" ordenados por prioridad.
   */
  async discover(page) {
    const currentUrl = page.url();
    const actions = [];

    try {
      const forms   = await this._discoverForms(page, currentUrl);
      const buttons = await this._discoverStandaloneButtons(page, currentUrl);
      const links   = await this._discoverLinks(page, currentUrl);

      actions.push(...forms, ...buttons, ...links);
    } catch (err) {
      this.reporter.warn(`[Explorer] Error al descubrir DOM: ${err.message}`);
    }

    this.reporter.debug(`Descubiertas ${actions.length} acciones (${actions.filter(a=>a.type==='form').length} forms, ${actions.filter(a=>a.type==='button').length} buttons, ${actions.filter(a=>a.type==='link').length} links)`);
    return actions;
  }

  // ── Forms ───────────────────────────────────────────────────────────────────

  async _discoverForms(page, url) {
    const results = [];
    let formHandles;
    try {
      formHandles = await page.locator('form').all();
    } catch {
      return results;
    }

    for (let i = 0; i < formHandles.length; i++) {
      const form = formHandles[i];
      if (!await form.isVisible().catch(() => false)) continue;

      const formAction = await form.getAttribute('action').catch(() => null) || url;
      const method     = ((await form.getAttribute('method').catch(() => 'get')) || 'get').toLowerCase();

      const fields = await this._discoverFields(form, page);
      if (fields.length === 0) continue;

      // Get submit button text for logging
      const submitText = await form.locator('[type="submit"], button:not([type]), button[type="submit"]')
        .first()
        .textContent()
        .catch(() => 'Submit');

      const fieldSig = fields.map(f => f.name || f.type).sort().join(',');
      const fingerprint = `form:${this._normUrl(formAction)}:${fieldSig}`;

      const isLoginForm = fields.some(f => f.type === 'password') &&
        fields.some(f => /email|user|correo/.test((f.name || '') + (f.label || '')));

      results.push({
        type:        'form',
        index:       i,
        formAction,
        method,
        fields,
        submitText:  (submitText || 'Submit').trim(),
        fingerprint,
        isLoginForm,
        priority:    isLoginForm ? 20 : 10,
      });
    }

    return results;
  }

  async _discoverFields(form, page) {
    const fields = [];

    // ── Inputs ──────────────────────────────────────────────────────────────
    const inputSel = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])';
    const inputs = await form.locator(inputSel).all();

    for (const el of inputs) {
      if (!await el.isVisible().catch(() => false)) continue;
      const field = await this._fieldMeta(el, 'input', page);
      if (field) fields.push(field);
    }

    // ── Textareas ────────────────────────────────────────────────────────────
    for (const el of await form.locator('textarea').all()) {
      if (!await el.isVisible().catch(() => false)) continue;
      const field = await this._fieldMeta(el, 'textarea', page);
      if (field) fields.push(field);
    }

    // ── Selects ──────────────────────────────────────────────────────────────
    for (const el of await form.locator('select').all()) {
      if (!await el.isVisible().catch(() => false)) continue;
      const field = await this._fieldMeta(el, 'select', page);
      if (field) {
        // Extract option values
        field.options = await el.locator('option:not([disabled])').evaluateAll(
          opts => opts.map(o => ({ value: o.value, text: o.textContent?.trim() })).filter(o => o.value)
        ).catch(() => []);
        if (field) fields.push(field);
      }
    }

    return fields;
  }

  async _fieldMeta(el, kind, page) {
    try {
      const name        = await el.getAttribute('name').catch(() => null);
      const id          = await el.getAttribute('id').catch(() => null);
      const type        = kind === 'input' ? (await el.getAttribute('type').catch(() => 'text') || 'text') : kind;
      const placeholder = await el.getAttribute('placeholder').catch(() => null);
      const required    = (await el.getAttribute('required').catch(() => null)) !== null;

      let label = null;
      if (id) {
        label = await page.locator(`label[for="${id}"]`).textContent().catch(() => null);
      }
      if (!label) {
        label = await el.getAttribute('aria-label').catch(() => null);
      }

      return { kind, name, id, type, placeholder, required, label: label?.trim() || null };
    } catch {
      return null;
    }
  }

  // ── Standalone Buttons ───────────────────────────────────────────────────────

  async _discoverStandaloneButtons(page, url) {
    const results = [];
    let btns;
    try {
      // Buttons NOT inside a <form> element
      btns = await page.locator('button, [role="button"]').all();
    } catch {
      return results;
    }

    for (const btn of btns) {
      if (!await btn.isVisible().catch(() => false)) continue;
      if (!await btn.isEnabled().catch(() => false)) continue;

      const type = await btn.getAttribute('type').catch(() => null);
      if (type === 'submit') continue; // covered by form discovery

      // Check if inside a form
      const insideForm = await btn.evaluate(el => !!el.closest('form')).catch(() => false);
      if (insideForm) continue;

      const text = (await btn.textContent().catch(() => '')).trim();
      if (!text || text.length > 80) continue;

      const fingerprint = `button:${this._normUrl(url)}:${text.slice(0, 40)}`;
      results.push({
        type:        'button',
        text,
        fingerprint,
        priority:    6,
        _locatorKey: text, // used by executor to re-locate
      });
    }

    return results;
  }

  // ── Links ────────────────────────────────────────────────────────────────────

  async _discoverLinks(page, url) {
    const results = [];
    const seen = new Set();
    let links;
    try {
      links = await page.locator('a[href]').all();
    } catch {
      return results;
    }

    for (const link of links) {
      if (!await link.isVisible().catch(() => false)) continue;

      const href = await link.getAttribute('href').catch(() => null);
      if (!href) continue;
      if (/^(#|javascript:|mailto:|tel:|data:)/.test(href)) continue;
      if (/^https?:\/\//.test(href) && !href.includes('localhost')) continue;
      if (seen.has(href)) continue;
      seen.add(href);

      const text = (await link.textContent().catch(() => '')).trim();
      const fingerprint = `link:${href}`;

      results.push({
        type:      'link',
        href,
        text,
        fingerprint,
        priority:  3,
      });
    }

    return results;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _normUrl(url) {
    try { return new URL(url, 'http://localhost').pathname; }
    catch { return url; }
  }

  /** Check if current page shows a login-type form */
  async detectLoginForm(page) {
    const hasPwd = await page.locator('input[type="password"]').first().isVisible().catch(() => false);
    const hasUser = await page.locator(
      'input[type="email"], input[name*="email"], input[name*="user"], input[name*="correo"]'
    ).first().isVisible().catch(() => false);
    return hasPwd && hasUser;
  }
}

module.exports = { Explorer };
