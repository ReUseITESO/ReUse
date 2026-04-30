'use strict';

const { randomInt, randomBool } = require('./utils/faker');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./utils/env');

/**
 * Planner — decide la SIGUIENTE acción del agente en runtime.
 *
 * Ahora integrado con IA (Gemini) para toma de decisiones basada en 
 * Historias de Usuario.
 */
class Planner {
  constructor(opts = {}) {
    this.focusPath = opts.focusPath || '';
    this.stories   = opts.stories || '';
    this.useAI     = !!(env.GOOGLE_API_KEY && env.GOOGLE_API_KEY !== 'TU_API_KEY_AQUI');
    
    if (this.useAI) {
      const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
      this.model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    }




  }

  /**
   * Elige la siguiente acción.
   * Ahora es ASYNC para permitir llamadas a la IA.
   */
  async choose(discoveredActions, memory, currentUrl, reporter) {
    // Filtrar acciones si hay focus activo
    let actions = discoveredActions;
    if (this.focusPath) {
      actions = this._applyFocusFilter(discoveredActions, currentUrl);
    }

    // ── 1. Si el agente está atascado → escapar ────────────────────────────────────
    if (memory.isStuck()) {
      return this._escape(memory, currentUrl);
    }

    // ── 2. Login form sin autenticar → máxima prioridad (Heurístico) ───────────
    if (!memory.isAuthenticated && !memory.authAttempted) {
      const loginForm = actions.find(a => a.type === 'form' && a.isLoginForm);
      if (loginForm) {
        return { ...loginForm, _useRealCredentials: true };
      }
    }

    // ── 3. Si hay IA disponible y tenemos historias → Preguntar al "Cerebro" ───
    if (this.useAI && this.stories && actions.length > 0) {
      const aiAction = await this._chooseWithAI(actions, memory, currentUrl, reporter);
      if (aiAction) return aiAction;
    }

    // ── 4. Fallback Heurístico (si no hay IA o falló) ──────────────────────────
    const unexplored = actions.filter(a => !memory.hasExecuted(a.fingerprint));
    const explored   = actions.filter(a =>  memory.hasExecuted(a.fingerprint));

    if (unexplored.length > 0) {
      return this._scoreAndPick(unexplored, memory);
    }

    if (explored.length > 0 && randomBool(0.1)) {
      return randomBool(0.5)
        ? explored[randomInt(0, explored.length - 1)]
        : this._escape(memory, currentUrl);
    }

    return this._escape(memory, currentUrl);
  }

  /**
   * Consulta a Gemini para decidir la mejor acción según las historias.
   */
  async _chooseWithAI(actions, memory, currentUrl, reporter) {
    try {
      // Simplificar acciones para el prompt (ahorrar tokens)
      const simplifiedActions = actions.map(a => ({
        type: a.type,
        text: a.text || '',
        href: a.href || '',
        id:   a.fingerprint.slice(0, 8), // usar un ID corto
        priority: a.priority
      }));

      const prompt = `
        Eres el cerebro de un agente de QA que está testeando la app "ReUse".
        
        OBJETIVO (Historias de Usuario):
        ${this.stories}

        ⚠️ PRIORIDADES: 
        1. CREAR PRODUCTO: Ve a "/products/new", llena el formulario y envíalo para ver si falla.
        2. REACCIONES: Busca botones de Like/Dislike (pueden ser iconos o números) y pruébalos.

        ESTADO ACTUAL:
        - URL: ${currentUrl}
        - Acciones ya realizadas: ${memory.executedFingerprints.size}
        - ¿Autenticado?: ${memory.isAuthenticated}


        ACCIONES DISPONIBLES EN ESTA PÁGINA:
        ${JSON.stringify(simplifiedActions, null, 2)}

        TAREA:
        Elige la mejor acción para avanzar en el cumplimiento de las historias de usuario.
        Responde ÚNICAMENTE con el "id" de la acción elegida. 
        Si crees que ninguna acción ayuda o estamos en un loop, responde "FALLBACK".
      `;

      reporter?.info('🧠 IA analizando opciones...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      if (text === 'FALLBACK') return null;

      // Buscar la acción real por el ID corto
      const selected = actions.find(a => a.fingerprint.startsWith(text));
      if (selected) {
        reporter?.ok(`🤖 IA eligió: [${selected.type}] "${selected.text || selected.href}"`);
        return selected;
      }

      return null;
    } catch (error) {
      reporter?.warn(`⚠ Error en Planner IA: ${error.message}`);
      return null;
    }
  }

  // ── Scoring (Fallback Heurístico) ─────────────────────────────────────────

  _scoreAndPick(actions, memory) {
    const scored = actions.map(action => {
      let score = action.priority || 1;

      if (action.type === 'link' && action.href) {
        const visits = memory.getVisitCount(action.href);
        score -= visits * 3;
      }

      if (action.type === 'form')   score += 5;
      if (action.type === 'button') score += 2;

      score += (Math.random() * 6) - 3;
      return { action, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);
    return randomBool(0.8) ? scored[0].action : top3[randomInt(0, top3.length - 1)].action;
  }

  // ── Escape de loops ───────────────────────────────────────────────────────

  _escape(memory, currentUrl = '') {
    if (this.focusPath && currentUrl && !currentUrl.includes(this.focusPath)) {
      return {
        type:        'navigate',
        href:        this.focusPath,
        text:        `Regresar al foco (${this.focusPath})`,
        fingerprint: `nav:${this.focusPath}:${Date.now()}`,
        priority:    10,
      };
    }

    const pendingUrl = this.focusPath
      ? memory.popPendingUrlMatching(this.focusPath)
      : memory.popPendingUrl();
      
    if (pendingUrl) {
      return {
        type:        'navigate',
        href:        pendingUrl,
        text:        'URL pendiente',
        fingerprint: `nav:${pendingUrl}:${Date.now()}`,
        priority:    8,
      };
    }

    return {
      type:        'back',
      text:        'Volver atrás',
      fingerprint: `back:${Date.now()}`,
      priority:    5,
    };
  }

  _applyFocusFilter(actions, currentUrl) {
    return actions.filter(action => {
      if (action.type !== 'link') return true;
      const href = action.href || '';
      return href.startsWith(this.focusPath) || href.includes(this.focusPath);
    });
  }

  registerDiscoveredUrls(actions, memory) {
    for (const action of actions) {
      if (action.type === 'link' && action.href) {
        memory.addPendingUrl(action.href);
      }
    }
  }
}

module.exports = { Planner };
