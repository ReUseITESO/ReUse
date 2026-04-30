'use strict';

// ── Context-aware data pools ──────────────────────────────────────────────────
const FIRST_NAMES  = ['Ana','Carlos','María','Luis','Sofía','Diego','Valentina','Andrés','Camila','Rodrigo'];
const LAST_NAMES   = ['García','Martínez','López','González','Pérez','Rodríguez','Sánchez','Torres'];
const DOMAINS      = ['gmail.com','hotmail.com','outlook.com'];
const WORDS_ES     = ['mesa','silla','libro','lámpara','bicicleta','mochila','teclado','cámara','zapatos','ropa'];
const DESCRIPTIONS = ['En excelentes condiciones.','Usado pero funcional.','Casi sin uso.','Precio negociable.','Funciona perfecto.'];
const COMMENTS_ES  = ['Muy interesante!','¿Sigue disponible?','Me interesa.','¿Cuánto cuesta el envío?','¡Excelente precio!'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomStr(len = 7) { return Math.random().toString(36).substring(2, 2 + len); }
function randomDelay(min = 60, max = 350) { return randomInt(min, max); }
function randomBool(p = 0.5) { return Math.random() < p; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = randomInt(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/**
 * Genera un valor apropiado para un campo de formulario
 * basándose en su tipo, nombre y label.
 */
function forField(field, opts = {}) {
  const name  = (field.name  || '').toLowerCase();
  const label = (field.label || '').toLowerCase();
  const ph    = (field.placeholder || '').toLowerCase();
  const type  = (field.type  || 'text').toLowerCase();
  const hint  = `${name} ${label} ${ph}`;

  // ── Use real credentials for login/auth fields ───────────────────────────
  if (opts.useRealCredentials) {
    if (type === 'password')                                           return opts.password || 'QaTest123!';
    if (type === 'email' || /email|correo|usuario|user/.test(hint))   return opts.email    || `qa_${randomStr(5)}@gmail.com`;
  }

  // ── Type-based detection ─────────────────────────────────────────────────
  if (type === 'email')    return `qa_${randomStr(5)}@gmail.com`;
  if (type === 'password') return `QaTest${randomInt(100,999)}!`;
  if (type === 'number')   return String(randomInt(1, 9999));
  if (type === 'tel')      return `+52 ${randomInt(100,999)} ${randomInt(100,999)} ${randomInt(1000,9999)}`;
  if (type === 'url')      return `https://example.com/${randomStr(5)}`;
  if (type === 'date')     return `2025-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`;

  // ── Name-based detection ─────────────────────────────────────────────────
  if (/email|correo/.test(hint))                return `qa_${randomStr(5)}@gmail.com`;
  if (/password|contrase/.test(hint))           return `QaTest${randomInt(100,999)}!`;
  if (/name|nombre/.test(hint))                 return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
  if (/title|titulo/.test(hint))                return `${randomItem(WORDS_ES)} ${randomStr(4)}`;
  if (/price|precio|costo/.test(hint))          return String(randomInt(50, 2000));
  if (/description|descripci|detail/.test(hint)) return randomItem(DESCRIPTIONS);
  if (/comment|comentario/.test(hint))          return randomItem(COMMENTS_ES);
  if (/phone|telefono|tel/.test(hint))          return `33${randomInt(10000000, 99999999)}`;
  if (/zip|postal|cp/.test(hint))               return String(randomInt(10000, 99999));

  if (type === 'textarea') return randomItem(DESCRIPTIONS) + ' ' + randomItem(COMMENTS_ES);

  // ── Generic fallback ─────────────────────────────────────────────────────
  return `qa_${randomStr(8)}`;
}

module.exports = { randomItem, randomInt, randomStr, randomDelay, randomBool, shuffle, forField };
