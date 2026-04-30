'use strict';

/**
 * Memory — estado completo del agente durante la exploración.
 *
 * Responsabilidades:
 *  - Evitar loops infinitos (rastrear acciones ya ejecutadas)
 *  - Ponderar URLs visitadas (deprioritizar las muy visitadas)
 *  - Registrar errores detectados
 *  - Mantener historial de pasos para el reporte final
 */
class Memory {
  constructor() {
    /** @type {Map<string, number>} url → número de visitas */
    this.visitedUrls = new Map();

    /** @type {Set<string>} fingerprints de acciones ya ejecutadas */
    this.executedFingerprints = new Set();

    /** Historial de pasos completo */
    this.steps = [];

    /** Errores detectados (JS, HTTP, DOM) */
    this.errors = [];

    /** URLs descubiertas pero no visitadas aún */
    this.pendingUrls = new Set();

    this.startTime = Date.now();
    this.isAuthenticated = false;
    this.authAttempted   = false;

    /** Últimas N URLs visitadas — para detectar loops */
    this._recentUrls = [];
    this._MAX_RECENT = 6;
  }

  // ── URL tracking ────────────────────────────────────────────────────────────

  recordVisit(url) {
    const clean = this._cleanUrl(url);
    this.visitedUrls.set(clean, (this.visitedUrls.get(clean) || 0) + 1);
    this.pendingUrls.delete(clean);

    this._recentUrls.push(clean);
    if (this._recentUrls.length > this._MAX_RECENT) {
      this._recentUrls.shift();
    }
  }

  getVisitCount(url) {
    return this.visitedUrls.get(this._cleanUrl(url)) || 0;
  }

  addPendingUrl(url) {
    const clean = this._cleanUrl(url);
    if (!this.visitedUrls.has(clean)) {
      this.pendingUrls.add(clean);
    }
  }

  /** Devuelve una URL pendiente que no hemos visitado aún */
  popPendingUrl() {
    const url = this.pendingUrls.values().next().value;
    if (url) this.pendingUrls.delete(url);
    return url || null;
  }

  /** Devuelve una URL pendiente que contenga el path dado (para modo focus) */
  popPendingUrlMatching(path) {
    for (const url of this.pendingUrls) {
      if (url.includes(path)) {
        this.pendingUrls.delete(url);
        return url;
      }
    }
    // Si no hay ninguna con el path, devolver cualquiera
    return this.popPendingUrl();
  }

  /**
   * Detecta si el agente está en un loop:
   * últimas N URLs son todas iguales o son un ciclo corto
   */
  isStuck() {
    if (this._recentUrls.length < this._MAX_RECENT) return false;
    const unique = new Set(this._recentUrls);
    return unique.size <= 2; // Si solo vemos 1-2 URLs en los últimos pasos → stuck
  }

  // ── Action fingerprints ─────────────────────────────────────────────────────

  markExecuted(fingerprint) {
    this.executedFingerprints.add(fingerprint);
  }

  hasExecuted(fingerprint) {
    return this.executedFingerprints.has(fingerprint);
  }

  // ── Steps & errors ──────────────────────────────────────────────────────────

  recordStep(step) {
    this.steps.push({
      ...step,
      ts: Date.now(),
    });
  }

  recordError(error) {
    this.errors.push({ ...error, ts: Date.now() });
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  getSummary() {
    return {
      durationMs:         Date.now() - this.startTime,
      totalSteps:         this.steps.length,
      urlsVisited:        this.visitedUrls.size,
      uniqueActionsExec:  this.executedFingerprints.size,
      errorsDetected:     this.errors.length,
      isAuthenticated:    this.isAuthenticated,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _cleanUrl(url) {
    try {
      const u = new URL(url);
      // Remove trailing slashes and query strings for comparison
      return `${u.origin}${u.pathname}`.replace(/\/$/, '');
    } catch {
      return url;
    }
  }
}

module.exports = { Memory };
