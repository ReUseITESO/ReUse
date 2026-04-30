# 🤖 ReUse QA Explorer

Agente autónomo de exploración que navega la app **sin escenarios predefinidos**. Descubre el DOM en tiempo real, elige acciones inteligentemente y detecta errores en cada paso.

## Inicio rápido

```bash
# Desde /frontend — con localhost:3000 activo
npm run qa:agent
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run qa:agent` | 40 pasos, headless |
| `npm run qa:agent:headed` | Browser visible |
| `npm run qa:agent:debug` | Visible + logs DOM detallados + slowMo 300ms |
| `npm run qa:agent:fast` | 60 pasos, headless |

## CLI avanzado

```bash
node qa-agent/index.js --steps 80 --slow 150 --url http://localhost:8000
node qa-agent/index.js --headed --debug
node qa-agent/index.js --headless --steps 100
```

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `QA_BASE_URL` | `http://localhost:3000` | URL de la app |
| `QA_HEADLESS` | `false` | Browser headless |
| `QA_SLOW_MO` | `80` | Delay entre acciones (ms) |
| `QA_MAX_STEPS` | `40` | Número de pasos |
| `QA_DEBUG` | `false` | Logs detallados de DOM |
| `PLAYWRIGHT_TEST_EMAIL` | — | Email para auto-login |
| `PLAYWRIGHT_TEST_PASSWORD` | — | Password para auto-login |

## Arquitectura

```
qa-agent/
├── index.js      ← Entry point + CLI
├── agent.js      ← Loop principal (discover→plan→execute→validate)
├── explorer.js   ← Descubrimiento dinámico del DOM
├── planner.js    ← Selección de acciones (sin escenarios)
├── executor.js   ← Ejecución Playwright con delays humanos
├── validator.js  ← Detección de errores (HTTP, JS, DOM, Django)
├── memory.js     ← Estado: URLs visitadas, acciones ejecutadas
├── reporter.js   ← Logs + JSON + screenshots
├── utils/
│   ├── env.js    ← Variables de entorno
│   └── faker.js  ← Datos contextuales por tipo de campo
└── reports/      ← Generado automáticamente
    ├── report-<runId>.json
    └── screenshots/
```

## Cómo funciona el loop

```
START → navegar a BASE_URL
  └─ por cada paso (1..MAX_STEPS):
       1. Explorer escanea el DOM actual
          → forms (todos los campos)
          → buttons (fuera de forms)
          → links (href internos)
       2. Planner elige la siguiente acción:
          → si hay login form sin auth → login con credenciales reales
          → si hay forms sin explorar → form (prioridad máxima)
          → si hay buttons → button
          → si hay links → link a URL menos visitada
          → si todo explorado → URL pendiente o volver atrás
       3. Executor ejecuta con delays humanos (80-400ms)
          → rellena TODOS los campos del form (tipo-aware)
          → detecta POST→redirect (Django)
       4. Validator verifica:
          → cambio de URL
          → errores HTTP 4xx/5xx
          → errores de form Django (.errorlist)
          → errores JS de consola
          → páginas de error 500
       5. Memory registra → evita loops
       6. Reporter loguea paso
END → reporte JSON + screenshots
```

## Output de consola

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  🤖  ReUse QA Explorer — Agente Autónomo
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

[01/40] /auth/signin
  ℹ Descubiertas 5 acciones (1 forms, 0 buttons, 4 links)
  → form: Llenando formulario (2 campos) → "Iniciar sesión"
    fill [email] type=email → "qa_abc12@gmail.com"
    fill [password] type=password → "QaTest456!"
  → submit: Enviando formulario "Iniciar sesión"
  ✓ URL: signin → products
  ✅ Autenticación exitosa
  🟢 Paso 1 ✓ [form] → /products
```
