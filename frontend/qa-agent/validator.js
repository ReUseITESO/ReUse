'use strict';

/**
 * Validator — valida el resultado de cada acción en tiempo real.
 *
 * Detecta:
 *  1. Cambios de URL tras submit (POST → redirect)
 *  2. Errores HTTP 4xx/5xx en respuestas de red
 *  3. Errores en el HTML (patrones Django + genéricos)
 *  4. Mensajes de éxito en el HTML
 *  5. Errores de consola JavaScript
 *  6. Páginas de error del servidor (500, 403, 404)
 *  7. Cambios en el DOM (aparición/desaparición de elementos)
 */
class Validator {
  constructor(page, reporter, memory) {
    this.page     = page;
    this.reporter = reporter;
    this.memory   = memory;

    // Acumular errores de consola en tiempo real
    this._jsErrors = [];
    this._httpErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignorar errores de hot-reload de Next.js y recursos normales
        if (!text.includes('webpack') && !text.includes('_next')) {
          this._jsErrors.push(text);
        }
      }
    });

    page.on('response', response => {
      const status = response.status();
      const url    = response.url();
      // Solo reportar errores en rutas de la app (no assets estáticos)
      if (status >= 400 && !url.includes('_next/') && !url.includes('favicon')) {
        this._httpErrors.push({ status, url });
      }
    });
  }

  // ── Validación principal post-acción ────────────────────────────────────────

  async validate(execResult) {
    const validation = {
      urlChanged:   execResult.urlBefore !== execResult.urlAfter,
      isErrorPage:  false,
      formErrors:   [],
      successMsgs:  [],
      jsErrors:     [...this._jsErrors],
      httpErrors:   [...this._httpErrors],
      severity:     'ok', // ok | warn | error
      notes:        [],
    };

    // Limpiar buffers después de leer
    this._jsErrors   = [];
    this._httpErrors = [];

    try {
      // ── 1. Detectar página de error del servidor ─────────────────────────
      validation.isErrorPage = await this._detectErrorPage();
      if (validation.isErrorPage) {
        validation.severity = 'error';
        validation.notes.push('Página de error del servidor detectada');
        this.reporter.warn('⚠ Página de error detectada');
      }

      // ── 2. Detectar mensajes de error en formularios ─────────────────────
      validation.formErrors = await this._detectFormErrors();
      if (validation.formErrors.length > 0) {
        validation.severity = 'warn';
        validation.notes.push(`Errores de formulario: ${validation.formErrors.join(' | ')}`);
        this.reporter.warn(`Errores de form: ${validation.formErrors.slice(0, 2).join(', ')}`);
      }

      // ── 3. Detectar mensajes de éxito ────────────────────────────────────
      validation.successMsgs = await this._detectSuccessMessages();
      if (validation.successMsgs.length > 0) {
        validation.notes.push(`Éxito: ${validation.successMsgs[0]}`);
        this.reporter.ok(`Mensaje de éxito: "${validation.successMsgs[0]}"`);
      }

      // ── 4. Reportar errores HTTP ─────────────────────────────────────────
      for (const err of validation.httpErrors) {
        if (err.status >= 500) {
          validation.severity = 'error';
          this.reporter.warn(`HTTP ${err.status} → ${err.url}`);
          this.memory.recordError({ type: 'http', ...err });
        } else if (err.status >= 400) {
          if (validation.severity === 'ok') validation.severity = 'warn';
          this.reporter.warn(`HTTP ${err.status} → ${err.url}`);
        }
      }

      // ── 5. Reportar errores JS ────────────────────────────────────────────
      for (const jsErr of validation.jsErrors.slice(0, 2)) {
        if (validation.severity === 'ok') validation.severity = 'warn';
        this.reporter.warn(`JS Error: ${jsErr.slice(0, 100)}`);
        this.memory.recordError({ type: 'js', message: jsErr });
      }

      // ── 6. Cambio de URL confirmado ──────────────────────────────────────
      if (validation.urlChanged) {
        this.reporter.ok(`URL: ${execResult.urlBefore.split('/').pop() || '/'} → ${execResult.urlAfter.split('/').pop() || '/'}`);
        // Registrar la nueva URL como visitada
        this.memory.recordVisit(execResult.urlAfter);
      }

    } catch (err) {
      validation.notes.push(`Error en validación: ${err.message}`);
    }

    return validation;
  }

  // ── Detección de página de error ─────────────────────────────────────────────

  async _detectErrorPage() {
    try {
      const title   = await this.page.title();
      const titleLc = title.toLowerCase();

      if (/500|server error|error interno/.test(titleLc)) return true;
      if (/404|not found|no encontrado/.test(titleLc)) {
        this.reporter.debug('Página 404 detectada');
        return false; // 404 es informativo, no es un crash
      }

      // Buscar el "yellow screen of death" de Django
      const hasDjangoError = await this.page.locator('#summary, #traceback, .django-error').first()
        .isVisible().catch(() => false);
      if (hasDjangoError) return true;

      // Buscar textos genéricos de error 500
      const bodyText = await this.page.locator('body').textContent().catch(() => '');
      if (/server error|internal server error|traceback \(most recent call\)/i.test(bodyText)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // ── Detección de errores de formulario ───────────────────────────────────────

  async _detectFormErrors() {
    const errors = [];
    try {
      // Django form errors: <ul class="errorlist">
      const djangoErrors = await this.page.locator('.errorlist li').allTextContents().catch(() => []);
      errors.push(...djangoErrors.map(t => t.trim()).filter(Boolean));

      // Bootstrap / genérico: .invalid-feedback, .alert-danger, .error
      const genericErrors = await this.page.locator(
        '.invalid-feedback, .alert-danger, .alert-error, [class*="error-message"], [role="alert"]'
      ).allTextContents().catch(() => []);
      errors.push(...genericErrors.map(t => t.trim()).filter(t => t.length > 2 && t.length < 200));

      // Atributos de validación HTML5 que fallaron
      const invalidInputs = await this.page.locator('input:invalid, select:invalid, textarea:invalid')
        .count().catch(() => 0);
      if (invalidInputs > 0) {
        errors.push(`${invalidInputs} campo(s) con validación HTML5 fallida`);
      }

    } catch { /* ignorar */ }

    return [...new Set(errors)].slice(0, 5); // deduplicar, máximo 5
  }

  // ── Detección de mensajes de éxito ────────────────────────────────────────────

  async _detectSuccessMessages() {
    const msgs = [];
    try {
      const successEls = await this.page.locator(
        '.alert-success, .alert-info, [class*="success"], .messages .success, [role="status"]'
      ).allTextContents().catch(() => []);
      msgs.push(...successEls.map(t => t.trim()).filter(t => t.length > 2 && t.length < 200));

      // Texto que indica éxito en operaciones comunes
      const bodyText = await this.page.locator('body').textContent().catch(() => '');
      const successPatterns = [/publicado con éxito/i, /creado correctamente/i, /guardado/i, /enviado/i];
      for (const pattern of successPatterns) {
        const match = bodyText.match(pattern);
        if (match) msgs.push(match[0]);
      }
    } catch { /* ignorar */ }

    return [...new Set(msgs)].slice(0, 3);
  }

  /** Toma snapshot del estado actual del DOM para comparar cambios */
  async snapshotDom() {
    try {
      const elCount = await this.page.locator('button, input, a, form').count();
      const url     = this.page.url();
      return { elCount, url };
    } catch {
      return { elCount: 0, url: '' };
    }
  }
}

module.exports = { Validator };
