# Documentación del Proceso de QA Autónomo (ReUseITESO)

Este documento centraliza y describe todo el esfuerzo, las herramientas, los flujos y las correcciones realizadas durante la fase de validación **End-to-End (E2E)** del proyecto ReUseITESO.

---

## 1. Fase de Planeación (`requirements.md` y `index.js`)

El proceso de calidad comenzó definiendo explícitamente las Historias de Usuario críticas en texto plano.
- **`e2e_hu-mkt-08-09-10/requirements.md`**: Archivo que contiene los criterios de aceptación y las reglas de negocio para 3 flujos clave:
  - **HU-MKT-08**: Calificar y reseñar transacciones.
  - **HU-MKT-09**: Reportar ítem o usuario.
  - **HU-MKT-10**: Ordenar resultados del marketplace.

- **`e2e_hu-mkt-08-09-10/index.js`**: Para agilizar la creación de casos de prueba, desarrollamos un script en Node.js que integra la API de **Gemini 3.1 Flash Lite Preview**. Este script:
  1. Lee el archivo `e2e_hu-mkt-08-09-10/requirements.md`.
  2. Instruye al LLM para actuar como un Ingeniero QA experto.
  3. Genera automáticamente casos de prueba exhaustivos, validaciones de casos límite (*edge cases*) y pruebas negativas.
  4. Guarda el resultado en `e2e_hu-mkt-08-09-10/plan-de-pruebas.md`.

## 2. Fase de Ejecución Automatizada (`agents/botQA.js`)

En lugar de utilizar scripts estáticos y frágiles (como Selenium estándar) o de realizar pruebas manuales, se desarrolló un **Agente de QA Autónomo** basado en IA (`botQA.js`).

### ¿Cómo funciona el Agente QA?
El bot utiliza **Playwright** para controlar un navegador Chromium y la API de **Gemini** como "cerebro". 
1. **Percepción**: El bot escanea el DOM de la página (`document.body.outerHTML`) y se lo envía a la IA junto con la Historia de Usuario objetivo.
2. **Razonamiento**: La IA analiza qué elementos interactivos existen (botones, inputs, links) y deduce cuál es el paso lógico a tomar según la misión (ej. "Hacer clic en el input de email para iniciar sesión").
3. **Acción**: El bot ejecuta la instrucción en el navegador (hace clic, escribe texto, navega).
4. **Ciclo**: Este bucle se repite hasta que la IA determina que se ha cumplido el objetivo o se ha encontrado un defecto irrecuperable.

El bot fue ejecutado contra el entorno de producción (`https://frontend-674659739241.us-central1.run.app/`) produciendo los resultados y logs documentados.

---

## 3. Fase de Resultados y Hallazgos (`E2E_Test.md`)

Durante las ejecuciones (documentadas en archivos como `test_10.log`), el bot encontró bloqueos severos que impedían cumplir los flujos. Estos fallos fueron capturados tanto por los observadores de red (`listeners` HTTP) como por bloqueos físicos en la UI.

### Defectos Identificados:
1. **Error 404 (Funcional/Backend)**: 
   - Al iniciar sesión, la UI intentaba pedir notificaciones, pero el endpoint fallaba de forma silenciosa devolviendo un error HTTP 404 (`/notifications?_rsc=...`).
2. **Bloqueo del Menú de Perfil (UI/UX)**: 
   - En **HU-MKT-08**, el menú desplegable en el `Navbar` causaba inconsistencias. Utilizaba un fondo transparente estático que causaba cierres involuntarios al intentar hacer clic en las opciones.
3. **Interceptación de Clics en Selectores (UI/UX)**: 
   - En **HU-MKT-09** y **HU-MKT-10**, los componentes tipo `<Select>` de Radix UI/Shadcn (Filtro de precios y Select de motivos de reporte) generaban una capa invisible ("Portal" o "Viewport") que **interceptaba físicamente los clics**. Playwright registraba el error: `subtree intercepts pointer events`.

---

## 4. Fase de Correcciones (Fixes Implementados)

Se ejecutó un plan de implementación técnico (`implementation_plan.md`) para erradicar las causas raíz de estos tres defectos.

### Fix 1: Resolución del Error 404 en la API
**Problema:** Django estaba enrutando mal la API de notificaciones por un conflicto entre la declaración estática de URLs y el `DefaultRouter`.
**Solución:** 
- Se eliminó el registro de `NotificationViewSet` del `DefaultRouter` en `backend/core/urls.py` y se removió la clase redundante en `backend/core/views.py`. Esto unificó todo el tráfico hacia las vistas manuales dedicadas (ej. `NotificationListView`), restaurando la funcionalidad.

### Fix 2: Refactorización del Navbar (Perfil)
**Problema:** El manejo manual del menú desplegable del perfil en React era frágil y perdía el foco fácilmente.
**Solución:**
- Se refactorizó `frontend/src/components/layout/Navbar.tsx` para importar y utilizar el componente `<Popover>` de Radix UI. 
- Se reemplazó la lógica manual por `<Popover open={...}>`, `<PopoverTrigger>` y `<PopoverContent>`, asegurando completa accesibilidad y gestión impecable de las capas z-index.

### Fix 3: Desbloqueo de Componentes `Select`
**Problema:** El valor por defecto de Shadcn inyectaba una capa para medir la pantalla que estropeaba las herramientas de E2E y dispositivos móviles.
**Solución:**
- En `frontend/src/components/ui/select.tsx`, se modificó el componente `SelectContent` cambiando la propiedad `position = 'item-aligned'` por `position = 'popper'`.
- Esto obliga a los selects a renderizarse como menús contextuales normales debajo del botón gatillo, eliminando la intercepción de eventos de ratón.

---

## Conclusión

El ciclo de **QA impulsado por IA** demostró ser altamente efectivo. No solo se automatizó la planeación de pruebas desde los requerimientos brutos, sino que el agente autónomo logró identificar problemas complejos de z-index y rutas backend superpuestas que scripts rígidos hubieran tardado más en depurar. Con las correcciones implementadas, la plataforma es significativamente más accesible, estable y testeable.
