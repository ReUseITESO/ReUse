## Reporte de Pruebas E2E - Defectos de la Aplicación
Tras implementar las correcciones en el bot (force: true para sortear intercepciones de clics y validación estricta de elementos <input>), el bot pudo avanzar más profundo en los flujos. A continuación, se documentan los defectos encontrados en la aplicación web para las historias de usuario evaluadas:

📝 Defectos Encontrados
1. Defectos Funcionales (Backend / Integración)
Durante la navegación del bot (específicamente en la prueba HU-MKT-08), el listener automático de red capturó un fallo de funcionalidad directo del servidor:

Error 404 en Notificaciones: El sistema está haciendo peticiones a una ruta que no existe o está caída en el entorno de producción.
Tipo: HTTP_ERROR
Status: 404
URL fallida: https://frontend-674659739241.us-central1.run.app/notifications?_rsc=1o6nf
Impacto: Posible fallo en el sistema de alertas/campanita del usuario al iniciar sesión.
2. Defectos de Interfaz / Accesibilidad (UI/UX)
Nota importante: Estos defectos actuaron como "bloqueadores". Al no permitir que el bot seleccionara las opciones del formulario, impidieron que se probara el botón final de "Enviar". Por lo tanto, la funcionalidad de guardado en la base de datos no pudo ser alcanzada.

### HU-MKT-08: Calificar y reseñar transacción
Menú de Perfil inestable: Al hacer clic en el botón del perfil de usuario, el menú desplegable que contiene "Mis Compras" presenta problemas de renderizado. Las opciones tardan en estar interactivas o el portal del componente desaparece inmediatamente.
Sugerencia: Revisar el manejo de estados (open/onOpenChange) en el componente DropdownMenu de Radix/Shadcn.
### HU-MKT-09: Reportar ítem o usuario
Defecto de Componente Select (Motivo de Reporte): El formulario de reporte utiliza un menú desplegable para el "Motivo". Las opciones se renderizan en un div con rol de opción, pero el DOM subyacente intercepta los eventos de puntero. Si el bot no puede hacer clic en la opción debido a un div invisible superpuesto, usuarios en dispositivos móviles o con lectores de pantalla enfrentarán el mismo problema.
Sugerencia: Verificar las capas (z-index) del Modal de Reporte respecto a los sub-componentes SelectPortal.
### HU-MKT-10: Ordenar resultados del marketplace
Defecto en el Filtro de Ordenamiento (Precio): Similar al reporte anterior, el componente que permite cambiar el orden (ej. de "Más recientes" a "Precio: Menor a Mayor") intercepta clics a nivel de DOM. Aunque el bot aplique fuerza bruta (force: true), la interfaz no procesa el cambio de estado correctamente y los resultados no se reordenan.

## Conclusión del QA
La funcionalidad base de inicio de sesión opera correctamente. Sin embargo:

- Hay un Error 404 funcional en el endpoint de notificaciones que debe ser reparado en el Backend/Frontend.
- La librería de componentes UI elegida (Radix/Shadcn) tiene defectos graves de interacción en sus menús desplegables (Selects y Dropdowns) que actúan como bloqueadores. Es indispensable arreglar estas capas invisibles en el código React para que tanto el bot como los usuarios reales puedan completar los formularios de reportes y calificaciones.

## Plan de Implementación: Corrección de Defectos (UI y API)
Este documento detalla las correcciones a implementar para resolver los defectos reportados durante las pruebas End-to-End del bot autónomo.

User Review Required
IMPORTANT

Cambios en UI (Menú y Selects): Los ajustes propuestos modificarán ligeramente la forma en que los menús flotantes se comportan en la interfaz (pasando a usar Popovers de Radix en lugar de divs fijos, y cambiando la estrategia de anclaje de los selects). Por favor, revisa el plan antes de proceder.

Proposed Changes
Backend (Core / Notifications)
Existe un conflicto de rutas en Django. Actualmente se registran las notificaciones manualmente (path("notifications/")) y a través del DefaultRouter (router.register("notifications")), lo que provoca que Django pierda el mapeo de ciertas rutas o se confunda con las barras diagonales (trailing slashes), causando errores 404 intermitentes al consultar la API.

[MODIFY] backend/core/urls.py
Eliminar la línea router.register(r"notifications", views.NotificationViewSet).
Dejar intactas las vistas manuales (NotificationListView, NotificationCountView, etc.) que ya manejan todo el flujo de notificaciones.
[MODIFY] backend/core/views.py
Eliminar la clase NotificationViewSet que está duplicando la funcionalidad de las vistas manuales.
Frontend (UI Components)
Los componentes de Radix UI / Shadcn están interceptando eventos del puntero o bloqueándose por capas invisibles, lo que impide que el Bot (y ocasionalmente usuarios móviles) puedan interactuar con ellos.

[MODIFY] frontend/src/components/layout/Navbar.tsx
Problema: El menú del perfil de usuario (profileOpen) utiliza un <div className="fixed inset-0 z-40"> manual como fondo para cerrarse al hacer clic fuera, lo cual causa cierres fantasma o problemas de foco.
Solución: Reemplazar el manejo manual de los div por el componente <Popover> de Radix UI (@/components/ui/popover). Esto delegará el manejo del z-index, portales y accesibilidad al motor de Radix.
[MODIFY] frontend/src/components/ui/select.tsx
Problema: El <SelectContent> usa por defecto position = 'item-aligned', lo cual genera una capa interceptora invisible que cubre toda la pantalla para capturar clics fuera del menú.
Solución: Cambiar el valor por defecto a position = 'popper'. Esto hace que el menú desplegable se comporte como un menú contextual normal debajo del gatillo, sin inyectar overlays obstructivos.
Verification Plan
Automated Tests
Correr de nuevo el bot QA con los comandos:
node agents/botQA.js "..." "HU-MKT-08: Inicia sesión, navega al perfil y luego a Mis Compras o transacciones."
node agents/botQA.js "..." "HU-MKT-09: Reportar ítem."
node agents/botQA.js "..." "HU-MKT-10: Ordenar resultados por Precio."
Manual Verification
Verificar que las notificaciones sigan cargándose correctamente al iniciar sesión sin soltar error 404 en consola.
Abrir el menú del perfil para confirmar que no se cierra de manera inesperada.
Abrir un combo box (Select) y hacer clic en una opción.