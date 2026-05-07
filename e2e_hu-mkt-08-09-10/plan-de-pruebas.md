

# Plan de Pruebas: Marketplace ITESO

**Versión:** 1.0  
**Responsable:** Experto QA  
**Tecnologías:** Next.js, TypeScript, PostgreSQL, REST API.

---

## 1. Estrategia de Pruebas

La estrategia se centra en garantizar la integridad de los datos, la experiencia de usuario (UX) y el cumplimiento de las reglas de negocio institucionales.

*   **Pruebas Funcionales:** Verificación de que cada criterio de aceptación se cumpla rigurosamente.
*   **Pruebas de Integración:** Asegurar que la calificación afecte la reputación y que los reportes lleguen a la base de datos de administración.
*   **Pruebas de UI/UX:** Validar estados de carga (skeletons/spinners), mensajes de confirmación y feedback visual.
*   **Pruebas de Seguridad:** Verificar que solo usuarios autenticados con sesión activa en ITESO puedan realizar acciones de escritura.

---

## 2. Escenarios de Prueba Detallados

### HU-MKT-08: Calificar y reseñar transacción

| ID | Descripción | Pasos | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-08-01** | Calificación exitosa con reseña | 1. Iniciar sesión.<br>2. Ir a "Mis Compras".<br>3. Seleccionar transacción completada.<br>4. Seleccionar 4 estrellas.<br>5. Escribir "Excelente vendedor".<br>6. Click en "Enviar". | Confirmación visual "Calificación enviada". El registro aparece en el perfil del vendedor y su promedio de reputación se actualiza. |
| **TC-08-02** | Calificación exitosa sin reseña | 1. Ir a una transacción completada.<br>2. Seleccionar 5 estrellas.<br>3. Dejar campo de reseña vacío.<br>4. Click en "Enviar". | El sistema permite el envío. La calificación se guarda correctamente. |
| **TC-08-03** | Visualización de datos de transacción | 1. Acceder al formulario de calificación. | Se muestran claramente: Nombre del producto, imagen, fecha de transacción y nombre de la contraparte. |
| **TC-08-04** | Persistencia de reputación | 1. Consultar reputación actual del usuario B.<br>2. Usuario A califica con 1 estrella.<br>3. Consultar reputación del usuario B nuevamente. | El promedio de estrellas del usuario B debe haber bajado proporcionalmente en la base de datos y UI. |

### HU-MKT-09: Reportar ítem o usuario

| ID | Descripción | Pasos | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-09-01** | Reporte de ítem exitoso | 1. Ir a la página de un producto.<br>2. Click en "Reportar".<br>3. Seleccionar categoría "Producto Prohibido".<br>4. Escribir descripción.<br>5. Click en "Enviar Reporte". | Confirmación de envío. El ítem se marca internamente con flag `under_review: true`. |
| **TC-09-02** | Reporte de usuario desde perfil | 1. Ir al perfil de un usuario.<br>2. Seleccionar "Reportar Usuario".<br>3. Seleccionar motivo y enviar. | El reporte se vincula al ID del usuario reportado y se muestra feedback de éxito. |

### HU-MKT-10: Ordenar resultados del marketplace

| ID | Descripción | Pasos | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-10-01** | Ordenar por precio (Menor a Mayor) | 1. Ir al Marketplace.<br>2. Seleccionar orden: "Precio: Menor a Mayor". | Los productos se reorganizan mostrando primero los de menor precio. |
| **TC-10-02** | Ordenar por popularidad | 1. Seleccionar orden: "Más populares". | Los productos con más "Favoritos" aparecen al inicio de la lista. |
| **TC-10-03** | Combinación de Filtro + Orden | 1. Filtrar por categoría "Libros".<br>2. Ordenar por "Más recientes". | Se muestran solo libros, ordenados por fecha de publicación descendente. |

---

## 3. Pruebas Negativas

| ID | Escenario Negativo | Pasos | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TN-08-01** | Envío de calificación sin estrellas | 1. En el formulario de calificación, no marcar ninguna estrella.<br>2. Intentar enviar. | El botón "Enviar" está deshabilitado o muestra error: "La calificación es obligatoria". |
| **TN-08-02** | Duplicidad de calificación | 1. Intentar acceder vía URL directa al formulario de una transacción ya calificada. | El sistema redirige al Home o muestra mensaje: "Esta transacción ya ha sido calificada". |
| **TN-09-01** | Reporte sin categoría | 1. Abrir modal de reporte.<br>2. Intentar enviar sin seleccionar motivo/categoría. | El sistema impide el envío y resalta el campo obligatorio en rojo. |
| **TN-10-01** | Acceso anónimo a ordenamiento | 1. Intentar acceder a la URL del marketplace sin login (si la regla es estricta para autenticados). | Redirección automática al Login del ITESO. |

---

## 4. Casos Edge (Casos Límite)

| ID | Descripción | Pasos | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **CE-08-01** | Reseña con máximo de caracteres | 1. Ingresar texto de 2000+ caracteres en la reseña (o el límite definido). | El sistema debe truncar el texto, mostrar contador de caracteres o validar el límite en el backend para evitar errores de buffer. |
| **CE-08-02** | Calificación simultánea | 1. Usuario A y Usuario B califican al mismo milisegundo la misma transacción. | El sistema procesa ambos mediante transacciones de DB (ACID) sin corromper el promedio de reputación. |
| **CE-10-01** | Persistencia tras Refresh | 1. Aplicar orden "Precio mayor a menor".<br>2. Recargar la página (F5). | El orden seleccionado debe persistir (vía URL params o SessionStorage). |
| **CE-10-02** | Marketplace vacío | 1. Aplicar ordenamiento en una búsqueda que no arroja resultados. | Se muestra mensaje "No se encontraron productos" en lugar de un error de sistema. |

---

## 5. Criterios de Aceptación (Checklist Final)

Para que las funcionalidades se consideren **"Done"**, deben cumplir:

- [ ] **Seguridad:** Todas las peticiones POST/PUT requieren un token JWT de ITESO válido.
- [ ] **Feedback:** Se muestra un `Spinner` durante el guardado y un `Toast` de éxito/error al finalizar.
- [ ] **Consistencia:** El puntaje de reputación es el promedio aritmético exacto de las calificaciones recibidas.
- [ ] **UI Responsiva:** Los formularios de reporte y calificación son usables en dispositivos móviles.
- [ ] **Manejo de Errores:** Si el backend falla (500), el frontend captura el error y permite al usuario reintentar sin perder la información escrita.
- [ ] **Estado de Transacción:** Solo las transacciones con estado `COMPLETED` habilitan el botón de "Calificar".