# Requisitos del sistema - Marketplace ITESO

---

## HU-MKT-08: Calificar y reseñar transacción

**Como** usuario autenticado del ITESO  
**Quiero** calificar y reseñar una transacción completada  
**Para** evaluar a la otra parte y contribuir a su reputación  

### Descripción
Después de que una transacción es completada, ambas partes pueden calificarse mutuamente con una puntuación de 1 a 5 estrellas y opcionalmente dejar una reseña escrita.  
Las calificaciones contribuyen al puntaje de reputación del usuario, visible en su perfil.

---

### Criterios de aceptación

- El usuario puede acceder a la vista de calificación después de completar una transacción
- Se muestran los datos relevantes de la transacción (usuario, producto, fecha)
- El usuario puede seleccionar una calificación entre 1 y 5 estrellas
- El usuario puede ingresar una reseña opcional
- La calificación se guarda correctamente en el sistema
- La reputación del usuario se actualiza correctamente
- Se muestra confirmación visual al enviar la calificación
- Se muestran estados de carga mientras se envían los datos
- Se muestran mensajes de error claros en caso de fallo

---

### Reglas de negocio

- Solo usuarios autenticados pueden calificar
- Solo se pueden calificar transacciones completadas
- Un usuario no puede calificar más de una vez la misma transacción
- La reseña es opcional pero la calificación es obligatoria

---

---

## HU-MKT-09: Reportar ítem o usuario

**Como** usuario autenticado del ITESO  
**Quiero** reportar un ítem o usuario inapropiado  
**Para** mantener la seguridad y calidad de la plataforma  

### Descripción
Los usuarios pueden reportar ítems que violen las reglas (contenido ofensivo, productos prohibidos, descripciones engañosas) o reportar comportamiento inapropiado de otros usuarios.  
Los reportes incluyen una categoría de motivo y una descripción opcional.  
Los ítems reportados se marcan para revisión por administradores.

---

### Criterios de aceptación

- El usuario puede acceder a la opción de reportar desde un ítem o perfil
- El usuario puede seleccionar una categoría de reporte
- El usuario puede ingresar una descripción opcional
- El reporte se envía correctamente
- El usuario recibe confirmación visual del envío
- El sistema maneja errores correctamente
- Se muestran estados de carga durante el envío

---

### Reglas de negocio

- Solo usuarios autenticados pueden reportar
- El motivo del reporte es obligatorio
- La descripción es opcional
- Un ítem reportado debe quedar marcado para revisión
- El usuario no puede enviar reportes vacíos

---

---

## HU-MKT-10: Ordenar resultados del marketplace

**Como** usuario autenticado del ITESO  
**Quiero** ordenar los resultados del marketplace  
**Para** encontrar productos de manera más eficiente  

### Descripción
El usuario puede ordenar resultados de búsqueda o navegación por diferentes criterios:
- Más recientes  
- Precio (menor a mayor)  
- Precio (mayor a menor)  
- Más populares (por número de favoritos)

El orden seleccionado debe persistir durante la sesión y funcionar junto con filtros activos.

---

### Criterios de aceptación

- El usuario puede seleccionar una opción de ordenamiento
- Los resultados se actualizan correctamente según el criterio seleccionado
- El ordenamiento funciona junto con filtros activos
- La selección de orden persiste durante la sesión
- Se muestran estados de carga al actualizar resultados
- Se manejan errores correctamente

---

### Reglas de negocio

- Solo usuarios autenticados pueden acceder a esta funcionalidad
- El ordenamiento debe aplicarse sobre el conjunto de resultados actual
- Los datos deben reflejar el orden seleccionado correctamente

---

---

## Suposiciones generales

- El usuario está autenticado como miembro del ITESO
- El backend sigue principios REST
- El frontend está desarrollado en Next.js con TypeScript
- La base de datos es PostgreSQL

---

## Consideraciones para pruebas

- Validar inputs válidos e inválidos
- Probar casos límite (strings vacíos, caracteres especiales, inputs largos)
- Validar comportamiento con y sin autenticación
- Verificar estados de carga y errores
- Validar persistencia de datos