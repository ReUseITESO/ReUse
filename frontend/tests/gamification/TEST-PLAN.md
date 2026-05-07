# Plan de pruebas — Gamificación (Core team)

**Autor:** Rodrigo León
**Equipo evaluado:** Gamificación
**Fecha:** 2026-04-22
**Rama:** `tests/HU-GAM-core-leon`

---

## 1. Contexto

Siguiendo la dinámica de testing cruzado de la fase final del proyecto, este documento describe el plan de pruebas automatizadas que el equipo Core (yo) ejecutará sobre dos historias del módulo de **Gamificación**.

---

## 2. Historias asignadas

| ID | Título | Issue |
|---|---|---|
| HU-GAM-07 | User can view points history and breakdown | #21 |
| HU-GAM-03 | User can view their earned achievements and badges | #17 |

---

## 3. Estrategia

- **Herramienta:** Playwright (`@playwright/test`) + TypeScript.
- **Browser:** Chromium.
- **Tipo de pruebas:** End-to-end (E2E) desde el navegador contra la app corriendo en `http://localhost:3500` y el backend Django en `http://localhost:8000`.
- **Autenticación:** se reutiliza el fixture compartido (`fixtures/auth.ts`) que hace login vía API y persiste `storageState` con los tokens en `localStorage`. Para nuestros tests usamos la clave `gam02a` (apunta a `jose.chavez@iteso.mx`, password `ReUse2026!`).
- **Mocks:** `page.route()` de Playwright para simular estados de error (500) y estados vacíos que no se pueden reproducir con el seed.
- **Alcance:** UI + integración con el endpoint real cuando aplica; lógica de backend no se reprueba (ya cubierta por tests unitarios de Django).

---

## 4. Alcance por historia

### HU-GAM-07 — Points History
**Ruta:** `/profile/points-history`
**Componente:** `PointsHistoryCard`
**Endpoint:** `GET /api/gamification/points-history/`

**Cubre:**
- Render de la vista autenticada (heading, contador de movimientos).
- Controles de filtrado (rango de fechas, acción, orden).
- Botones de rango rápido (últimos 7 y 30 días).
- Validación client-side de rango de fechas inverso.
- Controles de paginación.
- Manejo de error HTTP 500 del endpoint.
- Bloqueo/redirección para usuarios no autenticados.

### HU-GAM-03 — Achievements & Badges
**Ruta:** `/profile` (sección de badges al pie)
**Componente:** `BadgesList`
**Endpoint:** `GET /api/gamification/badges/status/`

**Cubre:**
- Render de las dos secciones (`Desbloqueados` y `Bloqueados`).
- Controles de paginación del carrusel (aria-label por sección).
- Coincidencia entre respuesta de API y badges renderizados en DOM.
- Estado vacío (ambas listas sin elementos).
- Diferenciación visual de badge desbloqueado (fecha) vs bloqueado (tag "Bloqueado").
- Manejo de error HTTP 500.

---

## 5. Casos de prueba

Total: **14 casos** distribuidos en 2 archivos.

### `gam-07-points-history.spec.ts` (8 casos)
1. Page loads with heading and counter.
2. Filter controls visible (date range, action, order).
3. Quick range buttons clickable y populan inputs.
4. Rango de fechas inverso → error de validación client-side.
5. Pagination controls presentes.
6. Link "Volver al perfil" visible.
7. **Mock 500:** mensaje de error con instrucción "verifica filtros".
8. **No sesión:** redirect o CTA de sign-in.

### `gam-03-achievements-badges.spec.ts` (6 casos)
1. Secciones `Desbloqueados` y `Bloqueados` visibles.
2. Paginación del carrusel (4 botones por sección).
3. Datos del API coinciden con DOM (primer badge visible).
4. **Mock vacío:** ambos mensajes de empty state.
5. **Mock con badges fijos:** desbloqueado muestra fecha, bloqueado muestra tag.
6. **Mock 500:** mensaje de error visible.

---

## 6. Precondiciones

1. Base de datos levantada (Docker Compose `db`).
2. Migraciones aplicadas: `python manage.py migrate`.
3. Seed de desarrollo: `python manage.py seed_dev_data`.
4. Backend Django corriendo en `:8000`.
5. Frontend Next.js corriendo en `:3500` (Windows bloquea `:3000` por rango reservado).

---

## 7. Cómo ejecutar

Desde `frontend/`:

```bash
npx playwright test           # todos los tests, headless
npx playwright test --ui      # UI interactiva para debugging
npx playwright show-report    # abre el reporte HTML de la última corrida
```

Los `storageState` de autenticación se generan automáticamente por la fase `setup` (declarada en `playwright.config.ts`).

---

## 8. Riesgos y supuestos

- **Puerto del frontend:** dev fija `baseURL` en `http://localhost:3000`. Si se corre en Windows 11 con el puerto 3000 bloqueado por Hyper-V, hay que arrancar Next.js con otro puerto y ajustar `playwright.config.ts` localmente (no commitear el cambio).
- **Fixture compartido:** se usa el `fixtures/auth.ts` ya existente en dev. Nuestros tests usan la clave `gam02a` que apunta al usuario `jose.chavez@iteso.mx` del seed.
- **Mocks vs datos reales:** los estados de error y vacío se prueban con `page.route()` porque disparar un 500 real es frágil. El "happy path" se corre contra datos reales del seed.