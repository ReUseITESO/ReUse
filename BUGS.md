# Hallazgos de testing cruzado — módulo Gamificación (HU-GAM-01, HU-GAM-06, HU-GAM-08)

> Testing cruzado realizado por equipo Core (pelayo) sobre código del equipo Gamificación.
> Branch: `tests/HU-GAM-core-pelayo`. Fecha: 21 abril 2026.
> Suite Playwright: `frontend/tests/gamification/` — 24/24 tests verdes.

---

## 🔴 Bug #1 — HU-GAM-01: `PointsBalance` no consume `/api/gamification/points/`

**Severidad:** Media (contrato de historia incumplido + código muerto + request duplicada en la misma página)
**Ubicación:** `frontend/src/components/gamification/PointsBalance.tsx`
**Hook huérfano:** `frontend/src/hooks/useUserPoints.ts` (existe, funciona, pero no se importa en ningún componente).

### Descripción
La historia HU-GAM-01 especifica que la UI de "puntos acumulados" debe leer del endpoint `GET /api/gamification/points/`. Sin embargo, `PointsBalance` obtiene el valor desde `levelProgression.points` (vía `useLevelProgression`), y el hook `useUserPoints` —que sí consume el endpoint correcto— nunca se importa en ningún lugar del frontend.

### Por qué es un bug (no una optimización)

1. **`PointsBalance` no muestra nivel ni progreso.** Solo muestra el número total y los 3 movimientos más recientes. El argumento "hace una sola llamada a `/level-progression/` porque muestra ambas cosas" no aplica: el componente descarta `current_level`, `next_level`, `progress_percent`, `points_to_next_level`, `is_max_level` — el 85% del payload.

2. **Ya hay otra llamada a `/level-progression/` en la misma página `/profile`**, hecha por `FeaturedGamificationCard`. Resultado: dos llamadas al endpoint más pesado en la misma vista, cuando una de ellas podría ser al endpoint dedicado y liviano (`/points/` devuelve `{ points: N }`, `/level-progression/` devuelve un objeto con nivel, siguiente, porcentaje, iconos, etc.).

3. **`useUserPoints` es código muerto.** `grep -rn "useUserPoints" frontend/src/` devuelve solo la declaración del hook, cero usos. No es una decisión de diseño — es refactor incompleto.

4. **Contrato de la historia incumplido.** HU-GAM-01 documenta explícitamente `GET /api/gamification/points/` como endpoint fuente. El comportamiento actual es inconsistente con esa especificación.

### Consecuencias
- Código muerto en el frontend (hook `useUserPoints`).
- Si el backend cambia la shape de `/level-progression/` (renombra `points`, anida el campo, etc.), `PointsBalance` se rompe por una razón no obvia.
- El endpoint `/points/` queda sin consumidores en el frontend — cualquier cambio a su contrato puede pasar desapercibido.
- Request duplicada al endpoint pesado en `/profile`.

### Evidencia
Test `gam-01-view-points.spec.ts` #2 (`authenticated › 2. UI points equal API response (BUG: PointsBalance uses /level-progression/ instead of /points/)`). El test incluye una anotación Playwright que reporta:
```
HU-GAM-01 endpoint /api/gamification/points/ is NOT consumed by PointsBalance
```

### Fix propuesto
Cambiar `PointsBalance.tsx` a usar `useUserPoints` en lugar de `useLevelProgression`:

```diff
- import { useLevelProgression } from '@/hooks/useLevelProgression';
+ import { useUserPoints } from '@/hooks/useUserPoints';
...
-  const { levelProgression, isLoading, error, refetch } = useLevelProgression(
-    isAuthenticated, refreshTrigger,
-  );
+  const { points, isLoading, error, refetch } = useUserPoints(
+    isAuthenticated, refreshTrigger,
+  );
...
-  {(levelProgression.points || 0).toLocaleString('es-MX')}
+  {(points ?? 0).toLocaleString('es-MX')}
```

**Estado:** ⚠️ No aplicado en esta branch. Como `PointsBalance` es código del equipo Gamificación y el fix cambia la fuente de datos, se documenta aquí para que el equipo Gam confirme antes del merge a `dev`.

---

## 🟡 Bug #2 — HU-GAM-06: El tipo `UserImpact` del frontend tiene un campo inexistente en el backend

**Severidad:** Baja (no rompe UI, pero produce valores `undefined` silenciosos si alguien los usa)
**Ubicación:** `frontend/src/hooks/useUserImpact.tsx` líneas 6-12

### Descripción
El tipo TypeScript local declara:
```ts
type UserImpact = {
  items_reused: number;
  items_saved_from_waste: number; // ❌ no existe en backend
  co2_avoided: number;
  community_average_items: number;
  community_average_co2: number;
};
```
Pero `ImpactSerializer` en `backend/gamification/serializers/impact.py` solo expone:
- `items_reused`
- `co2_avoided`
- `community_average_items`
- `community_average_co2`

Consecuencias:
- TypeScript no puede detectar mal uso porque el tipo no es `strict` contra la respuesta real.
- Si algún componente futuro intenta `data.items_saved_from_waste`, obtiene `undefined` en runtime sin error de compilación.

### Fix aplicado en esta branch
Eliminar el campo del tipo. Cambio de una sola línea en `useUserImpact.tsx`.

---

## 🟢 Observación #1 — Lógica de niveles: no hay off-by-one en la frontera exacta de 100 pts

**Severidad:** Ninguna (no es un bug, es una validación que confirma corrección)
**Ubicación:** `backend/gamification/services/level_progression.py`

Se añadió un test específico con un usuario de **exactamente 100 puntos** (`rodrigo@iteso.mx`) para descartar el off-by-one común en este tipo de lógica. El servicio resuelve correctamente: `100 pts → Active Reuser` (no Beginner). La comparación `points >= level.min_points` en `_resolve_current_level` es la correcta.

### Evidencia
Test `gam-08-level-progression.spec.ts` #2 (`off-by-one boundary › 100 pts exactos → "Active Reuser" (NOT Beginner)`): ✅ pasa.

---

## 🟢 Observación #2 — Normalización de puntos negativos

**Severidad:** Ninguna (comportamiento correcto)
**Ubicación:** `backend/gamification/services/level_progression.py:49` (`safe_points = max(points, 0)`)

Si el backend recibiera un `points < 0` por cualquier motivo (corrupción, migración), el servicio lo normaliza a 0 y la barra de progreso no queda negativa. Test `gam-08 #7` confirma que la UI tampoco renderiza anchos negativos aunque el backend enviara valores inválidos.

---

## Resumen

| ID   | Historia | Tipo | Fix aplicado |
|------|----------|------|--------------|
| #1   | HU-GAM-01 | 🔴 Bug medio | ❌ Documentado (requiere coordinación con equipo Gam) |
| #2   | HU-GAM-06 | 🟡 Bug bajo | ✅ Sí |
| Obs. #1 | HU-GAM-08 | 🟢 Validación positiva (off-by-one 100 pts) | — |
| Obs. #2 | HU-GAM-08 | 🟢 Validación positiva (normalización negativos) | — |

## Cobertura de tests

- **HU-GAM-01:** 6 casos (happy path, consistencia UI/API, /profile + /dashboard, no-session, error 500, localización es-MX)
- **HU-GAM-08:** 7 casos (beginner, **100 pts off-by-one**, progress bar bounds, champion, max level, UI⇔API, normalización de negativos)
- **HU-GAM-06:** 7 casos (zero state, UI⇔API, sufijo kg, community avg ≥ 0, singular/plural, redondeo 2 decimales, error 500)

**Total:** 24 tests ✅ (20 casos de negocio + 4 setups de auth).

## Cómo correr los tests

```bash
# Backend (puerto 8000) y frontend (puerto 3000) deben estar corriendo.
# Usuarios determinísticos en la DB: 0, 100, 300, 600 pts.
cd frontend
npm run test:e2e      # headless
npm run test:e2e:ui   # modo interactivo
```
