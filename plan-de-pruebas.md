Como experto en QA, he revisado los requisitos proporcionados para las historias de usuario de la plataforma de marketplace ITESO. A continuación, presento un Plan de Pruebas exhaustivo, estructurado para cubrir la estrategia, escenarios de prueba positivos y negativos, y los criterios de aceptación para cada característica.

---

# Plan de Pruebas: Plataforma Marketplace ITESO - Core Functionality

## 1. Información General

*   **Proyecto:** Plataforma Marketplace ITESO
*   **Módulo/Área:** Búsqueda, Filtrado y Establecimiento de Precios de Artículos
*   **Versión de la Aplicación:** [Especificar Versión]
*   **Fecha de Preparación:** 24 de Mayo de 2024
*   **Autor:** Experto QA
*   **Estado:** Borrador / Aprobado [Seleccionar]

## 2. Introducción y Alcance

Este Plan de Pruebas describe el enfoque y las actividades de prueba para las funcionalidades principales de búsqueda, filtrado y establecimiento de precios del marketplace ITESO. El objetivo es asegurar que estas características cumplan con los requisitos definidos en las Historias de Usuario 1, 2 y 3, operando de manera robusta, intuitiva y sin defectos significativos.

El alcance de este plan se centra en las funcionalidades detalladas en las historias de usuario, incluyendo la interfaz de usuario, la lógica de negocio y la validación de datos. No incluye pruebas de rendimiento, seguridad avanzada (más allá de la autenticación básica y validación de entrada), o compatibilidad exhaustiva con todas las combinaciones posibles de navegadores/dispositivos, aunque se realizarán pruebas básicas de compatibilidad en los navegadores principales. Las "características avanzadas, casos de borde y optimizaciones" mencionadas en las historias de usuario quedan fuera del alcance de este plan y se abordarán en futuras historias de usuario y planes de prueba.

## 3. Objetivos de las Pruebas

*   Validar que la funcionalidad de búsqueda de artículos funcione según lo especificado.
*   Asegurar que los filtros de categoría, condición y tipo de transacción operen correctamente, individualmente y en combinación.
*   Verificar que el establecimiento de precios para artículos en venta cumpla con las reglas de validación y formato.
*   Confirmar que la interfaz de usuario sea intuitiva y muestre la información de manera precisa.
*   Garantizar que se proporcione retroalimentación adecuada al usuario para todas las interacciones y errores.
*   Identificar y documentar cualquier defecto o desviación de los requisitos.
*   Asegurar que las características sean accesibles solo para usuarios autenticados de ITESO.

## 4. Estrategia de Pruebas

La estrategia de pruebas adoptará un enfoque basado en riesgos, priorizando las funcionalidades críticas de las historias de usuario de alta prioridad. Se combinarán diferentes tipos de pruebas para garantizar una cobertura exhaustiva.

### 4.1. Tipos de Pruebas

*   **Pruebas Funcionales:** Verificación de que cada característica cumple con los requisitos especificados en las historias de usuario. Esto incluye la lógica de búsqueda, la aplicación de filtros, la validación de precios y la visualización de resultados.
*   **Pruebas de UI/UX:** Evaluación de la interfaz de usuario para asegurar que sea intuitiva, visualmente coherente y que la información se presente de manera clara y comprensible (ej. formato de precios, disposición de resultados).
*   **Pruebas de Integración:** Verificación de que los componentes individuales (ej. búsqueda y filtrado) interactúen correctamente entre sí y con el sistema subyacente (base de datos, servicios de backend).
*   **Pruebas de Usabilidad:** Evaluación de la facilidad de uso del sistema desde la perspectiva del usuario final (flujo de búsqueda, aplicación de filtros).
*   **Pruebas de Datos:** Verificación de la integridad, exactitud y consistencia de los datos manejados por las funcionalidades (ej. resultados de búsqueda correctos, ítems filtrados correctamente, precios almacenados y mostrados con precisión).
*   **Pruebas de Seguridad (Básica):** Confirmar que las características solo sean accesibles para usuarios autenticados y que la validación de entrada básica prevenga inyecciones o entradas maliciosas (ej. en el campo de búsqueda o precio).
*   **Pruebas de Compatibilidad:** Verificación del comportamiento de la aplicación en los navegadores web principales (Chrome, Firefox, Edge, Safari) y sistemas operativos.

### 4.2. Enfoque de Pruebas

1.  **Priorización:** Se dará prioridad a las funcionalidades de las Historias de Usuario 1, 2 y 3, que son de alta prioridad.
2.  **Pruebas Incrementales:** Se comenzará probando cada característica de forma aislada, para luego pasar a la integración entre ellas (ej. búsqueda y luego aplicar filtros sobre los resultados de búsqueda).
3.  **Pruebas Manuales:** La mayor parte de las pruebas iniciales serán manuales para una exploración profunda de la funcionalidad y la interfaz de usuario.
4.  **Automatización (Futura):** Después de la estabilización inicial de las características, se considerará la automatización de un conjunto de pruebas de regresión clave para asegurar la continuidad del correcto funcionamiento en futuras iteraciones.
5.  **Pruebas Exploratorias:** Se dedicará tiempo a pruebas exploratorias para descubrir defectos no previstos y mejorar la cobertura de los casos de uso.

## 5. Criterios de Inicio y Fin

### 5.1. Criterios de Inicio

*   El ambiente de pruebas está configurado y estable.
*   El código fuente de las funcionalidades a probar ha sido desplegado en el ambiente de pruebas.
*   Los datos de prueba están disponibles y preparados.
*   Las dependencias externas (ej. autenticación de usuarios ITESO) están operativas.
*   La funcionalidad básica de autenticación de usuario ITESO funciona correctamente.
*   Todos los test cases están diseñados y revisados.

### 5.2. Criterios de Fin

*   Todos los escenarios de prueba planificados (positivos y negativos) han sido ejecutados.
*   Se han corregido y re-testeado todos los defectos críticos y de alta prioridad.
*   El número de defectos pendientes de prioridad media y baja está dentro de los límites aceptables acordados con el Product Owner.
*   Los criterios de aceptación para cada historia de usuario se han cumplido.
*   El Product Owner ha dado su aprobación para el lanzamiento.
*   Se ha generado un informe de resumen de pruebas.

## 6. Entregables de Pruebas

*   Plan de Pruebas (este documento)
*   Casos de Prueba detallados (en una herramienta de gestión de pruebas)
*   Informes de Defectos (en una herramienta de seguimiento de defectos)
*   Matriz de Trazabilidad (requisitos vs. casos de prueba)
*   Informe de Resumen de Pruebas (al final del ciclo)

## 7. Roles y Responsabilidades

*   **Equipo QA:** Diseño, ejecución y reporte de pruebas. Gestión de defectos.
*   **Equipo de Desarrollo:** Implementación de funcionalidades, corrección de defectos.
*   **Product Owner:** Aclaración de requisitos, priorización de defectos, aprobación final.

## 8. Ambiente de Pruebas

*   **Plataforma:** Web (Navegador)
*   **Navegadores Soportados:** Google Chrome (versión más reciente -2), Mozilla Firefox (versión más reciente -2), Microsoft Edge (versión más reciente -2), Apple Safari (versión más reciente -2).
*   **Sistemas Operativos:** Windows 10/11, macOS (versión más reciente -1), Linux (Ubuntu LTS).
*   **Conectividad:** Acceso a internet para autenticación y base de datos del marketplace.
*   **Datos:** Base de datos con un conjunto diverso de artículos de prueba que cubran diferentes títulos, descripciones, categorías, condiciones y tipos de transacción.

## 9. Datos de Prueba

Se prepararán datos de prueba que incluyan:

*   **Artículos con diferentes atributos:**
    *   Títulos que incluyan palabras clave comunes, nombres de categorías, y descripciones.
    *   Descripciones variadas en longitud y contenido.
    *   Artículos de todas las categorías (libros, electrónica, ropa, útiles escolares).
    *   Artículos en todas las condiciones (nuevo, como nuevo, bueno, justo).
    *   Artículos para venta, donación e intercambio.
    *   Artículos con imágenes y sin imágenes.
    *   Artículos con precios válidos y para los que el precio es N/A (donación/intercambio).
*   **Artículos específicos para casos de borde:**
    *   Artículos con títulos muy largos o muy cortos.
    *   Artículos que no coinciden con ninguna búsqueda/filtro.
    *   Artículos que coinciden con múltiples criterios de búsqueda/filtro.
*   **Usuarios:** Al menos un usuario ITESO autenticado.

---

## 10. Escenarios de Prueba Detallados

### Historia de Usuario 1: Búsqueda de Artículos

**Descripción de la HU:** Como usuario autenticado de ITESO, quiero buscar artículos en el marketplace introduciendo palabras clave en una barra de búsqueda. La búsqueda debe coincidir con los títulos, descripciones y categorías de los artículos. Los resultados deben mostrarse en una vista de lista o cuadrícula con información básica del artículo (título, imagen, precio/tipo, condición).

**Prerequisito para todos los escenarios de la HU1:** El usuario está autenticado y ha navegado a la página principal del marketplace.

#### Escenarios de Prueba Positivos (Happy Path)

| ID TC | Descripción del Escenario | Pasos de Prueba | Resultado Esperado |
| :---- | :------------------------ | :-------------- | :----------------- |
| **H1-P01** | Búsqueda por palabra clave en Título | 1. Ingresar "computadora" en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | Los resultados muestran todos los artículos con "computadora" en su título. Cada resultado muestra título, imagen, precio/tipo y condición. |
| **H1-P02** | Búsqueda por palabra clave en Descripción | 1. Ingresar "manual universitario" en la barra de búsqueda (asumiendo que hay artículos con esa frase en su descripción pero no en el título). <br> 2. Clic en el botón de búsqueda / Presionar Enter. | Los resultados muestran artículos con "manual universitario" en su descripción. Cada resultado muestra título, imagen, precio/tipo y condición. |
| **H1-P03** | Búsqueda por palabra clave en Categoría | 1. Ingresar "libros" en la barra de búsqueda (asumiendo que 'libros' es una categoría pero también puede aparecer en títulos/descripciones). <br> 2. Clic en el botón de búsqueda / Presionar Enter. | Los resultados muestran todos los artículos de la categoría "Libros", además de cualquier artículo con "libros" en título/descripción. Cada resultado muestra título, imagen, precio/tipo y condición. |
| **H1-P04** | Búsqueda combinada (Título y Descripción) | 1. Ingresar "teléfono inteligente" en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | Los resultados muestran artículos que coinciden con la palabra clave en título Y/O descripción. Cada resultado muestra título, imagen, precio/tipo y condición. |
| **H1-P05** | Búsqueda con resultados múltiples | 1. Ingresar una palabra clave común como "libro" en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | La página muestra una lista o cuadrícula de múltiples resultados de artículos que contienen "libro". |
| **H1-P06** | Verificación de información básica en resultados | 1. Realizar una búsqueda que genere resultados. <br> 2. Examinar los primeros resultados mostrados. | Cada resultado de artículo muestra claramente el título, una imagen (si está disponible), el precio o tipo de transacción (venta, donación, intercambio) y su condición. |
| **H1-P07** | Cambio de vista de resultados (lista/cuadrícula) | 1. Realizar una búsqueda que genere resultados. <br> 2. Clic en el icono para cambiar a vista de "cuadrícula". <br> 3. Clic en el icono para cambiar a vista de "lista". | Los resultados se muestran correctamente en vista de cuadrícula. Los resultados se muestran correctamente en vista de lista. |
| **H1-P08** | Búsqueda parcial de palabra clave | 1. Ingresar "computa" en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | Los resultados muestran artículos que contienen la palabra "computadora" o similares. |
| **H1-P09** | Búsqueda insensible a mayúsculas/minúsculas | 1. Ingresar "Libros" en la barra de búsqueda. <br> 2. Ingresar "libros" en la barra de búsqueda. | Los resultados son los mismos para ambas búsquedas, demostrando insensibilidad a mayúsculas/minúsculas. |

#### Escenarios de Prueba Negativos y Casos de Borde

| ID TC | Descripción del Escenario | Pasos de Prueba | Resultado Esperado |
| :---- | :------------------------ | :-------------- | :----------------- |
| **H1-N01** | Búsqueda sin resultados | 1. Ingresar una palabra clave inexistente (ej. "xyz123abc") en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | El sistema muestra un mensaje claro de "No se encontraron resultados" o similar. |
| **H1-N02** | Búsqueda con barra vacía | 1. Dejar la barra de búsqueda vacía. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | El sistema muestra todos los artículos disponibles (comportamiento por defecto) o un mensaje de error/advertencia que no se puede buscar con campo vacío. (Definir comportamiento esperado con PO). |
| **H1-N03** | Búsqueda con caracteres especiales | 1. Ingresar "!@#$" o "select * from" en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | Los caracteres especiales deben ser manejados sin errores (ej. ignorados o escapar el input) y no deben romper la aplicación ni ejecutar comandos maliciosos. No deben mostrarse resultados si no hay coincidencia directa. |
| **H1-N04** | Búsqueda con string muy largo | 1. Ingresar una cadena de texto extremadamente larga (ej. 1000+ caracteres) en la barra de búsqueda. <br> 2. Clic en el botón de búsqueda / Presionar Enter. | El sistema debe manejar la entrada sin errores de rendimiento o fallos. Se deben mostrar resultados si hay coincidencia, o "no resultados" si no los hay. |
| **H1-N05** | Acceso a búsqueda sin autenticación | 1. Cerrar sesión o intentar acceder a la URL del marketplace directamente sin iniciar sesión. <br> 2. Intentar usar la barra de búsqueda. | El sistema debe redirigir al usuario a la página de inicio de sesión o mostrar un mensaje indicando que se requiere autenticación para usar la funcionalidad de búsqueda. |

---

### Historia de Usuario 2: Filtrado de Artículos

**Descripción de la HU:** Como usuario autenticado de ITESO, quiero filtrar artículos por categoría, condición y tipo de transacción para filtrar listados del marketplace por múltiples criterios: categoría de artículo (libros, electrónica, ropa, útiles escolares), condición (nuevo, como nuevo, bueno, justo) y tipo de transacción (venta, donación, intercambio). Los filtros deben funcionar en combinación y actualizar los resultados dinámicamente.

**Prerequisito para todos los escenarios de la HU2:** El usuario está autenticado y ha navegado a la página principal del marketplace. Hay una lista inicial de artículos visible.

#### Escenarios de Prueba Positivos (Happy Path)

| ID TC | Descripción del Escenario | Pasos de Prueba | Resultado Esperado |
| :---- | :------------------------ | :-------------- | :----------------- |
| **H2-P01** | Filtrar por una Categoría | 1. Seleccionar "Electrónica" del filtro de categorías. | Los resultados de artículos se actualizan dinámicamente mostrando solo artículos de la categoría "Electrónica". |
| **H2-P02** | Filtrar por una Condición | 1. Seleccionar "Como Nuevo" del filtro de condiciones. | Los resultados de artículos se actualizan dinámicamente mostrando solo artículos en condición "Como Nuevo". |
| **H2-P03** | Filtrar por un Tipo de Transacción | 1. Seleccionar "Donación" del filtro de tipos de transacción. | Los resultados de artículos se actualizan dinámicamente mostrando solo artículos para "Donación". |
| **H2-P04** | Combinar dos filtros (Categoría + Condición) | 1. Seleccionar "Ropa" del filtro de categorías. <br> 2. Seleccionar "Nuevo" del filtro de condiciones. | Los resultados se actualizan dinámicamente mostrando solo artículos de "Ropa" que están en condición "Nuevo". |
| **H2-P05** | Combinar dos filtros (Categoría + Transacción) | 1. Seleccionar "Útiles Escolares" del filtro de categorías. <br> 2. Seleccionar "Venta" del filtro de tipos de transacción. | Los resultados se actualizan dinámicamente mostrando solo artículos de "Útiles Escolares" que son para "Venta". |
| **H2-P06** | Combinar tres filtros (Categoría + Condición + Transacción) | 1. Seleccionar "Libros" del filtro de categorías. <br> 2. Seleccionar "Bueno" del filtro de condiciones. <br> 3. Seleccionar "Venta" del filtro de tipos de transacción. | Los resultados se actualizan dinámicamente mostrando solo "Libros" en condición "Bueno" que son para "Venta". |
| **H2-P07** | Filtrar y luego quitar un filtro | 1. Seleccionar "Electrónica" del filtro de categorías. <br> 2. Deseleccionar "Electrónica" (o restablecer ese filtro). | Los resultados vuelven a mostrar todos los artículos disponibles (o los resultados anteriores si había otros filtros aplicados). |
| **H2-P08** | Restablecer todos los filtros | 1. Aplicar varios filtros (ej. categoría, condición, tipo de transacción). <br> 2. Clic en un botón "Restablecer Filtros" (si existe) o deseleccionar todos los filtros manualmente. | La lista de artículos vuelve a su estado inicial sin filtros aplicados. |
| **H2-P09** | Filtros funcionando con resultados de búsqueda | 1. Realizar una búsqueda (ej. "teléfono"). <br> 2. Seleccionar "Electrónica" del filtro de categorías. <br> 3. Seleccionar "Como Nuevo" del filtro de condiciones. | Los resultados filtrados son un subconjunto de los resultados de la búsqueda original que coinciden con ambos filtros aplicados. |
| **H2-P10** | Verificación de valores de filtro correctos | 1. Abrir los desplegables/listas de selección de filtros. | Las opciones de categoría son: "libros, electrónica, ropa, útiles escolares". <br> Las opciones de condición son: "nuevo, como nuevo, bueno, justo". <br> Las opciones de transacción son: "venta, donación, intercambio". |

#### Escenarios de Prueba Negativos y Casos de Borde

| ID TC | Descripción del Escenario | Pasos de Prueba | Resultado Esperado |
| :---- | :------------------------ | :-------------- | :----------------- |
| **H2-N01** | Aplicar filtros que no producen resultados | 1. Seleccionar una combinación de filtros para la cual no existen artículos (ej. "Libros" + "Nuevo" + "Intercambio" si no hay ninguno). | El sistema muestra un mensaje claro de "No se encontraron resultados" o similar. |
| **H2-N02** | Acceso a filtros sin autenticación | 1. Cerrar sesión o intentar acceder a la URL del marketplace directamente sin iniciar sesión. <br> 2. Intentar interactuar con los filtros. | El sistema debe redirigir al usuario a la página de inicio de sesión o mostrar un mensaje indicando que se requiere autenticación para usar la funcionalidad de filtrado. |
| **H2-N03** | Interacción con filtros vacíos (si aplica) | 1. Si los filtros tienen opción de búsqueda interna, intentar buscar un filtro que no existe. | El filtro no debe aplicar y no debe mostrar errores. |
| **H2-N04** | Impacto en la URL al aplicar filtros (opcional, para verificación) | 1. Aplicar varios filtros. <br> 2. Observar la URL. | Los parámetros de los filtros aplicados deberían reflejarse en la URL, permitiendo compartir la URL con filtros preaplicados (si es un requisito futuro). Esto es más de una verificación de implementación que un error funcional. |

---

### Historia de Usuario 3: Establecimiento de Precios para Artículos en Venta

**Descripción de la HU:** Como usuario autenticado de ITESO, quiero establecer un precio para los artículos listados para la venta para establecer un precio en MXN. El campo de precio debe validar la entrada numérica, aplicar un valor mínimo y mostrar el precio formateado en la tarjeta del artículo y en la página de detalles.

**Prerequisito para todos los escenarios de la HU3:** El usuario está autenticado y está en el formulario de publicación de un nuevo artículo o editando uno existente, y ha seleccionado 'Venta' como el tipo de transacción.

#### Escenarios de Prueba Positivos (Happy Path)

| ID TC | Descripción del Escenario | Pasos de Prueba | Resultado Esperado |
| :---- | :------------------------ | :-------------- | :----------------- |
| **H3-P01** | Establecer un precio válido | 1. Ingresar "150.75" en el campo de precio. <br> 2. Guardar/Publicar el artículo. | El artículo se guarda correctamente. El precio se muestra como "$150.75 MXN" (o formato equivalente) en la tarjeta del artículo y en la página de detalles. |
| **H3-P02** | Establecer el precio mínimo | 1. Ingresar el valor mínimo permitido (ej. "1.00") en el campo de precio. <br> 2. Guardar/Publicar el artículo. | El artículo se guarda correctamente. El precio se muestra como "$1.00 MXN" (o formato equivalente) en la tarjeta del artículo y en la página de detalles. |
| **H3-P03** | Establecer un precio con números enteros | 1. Ingresar "200" en el campo de precio. <br> 2. Guardar/Publicar el artículo. | El artículo se guarda correctamente. El precio se muestra como "$200.00 MXN" (o formato equivalente) en la tarjeta del artículo y en la página de detalles. |
| **H3-P04** | Verificación de formato de precio | 1. Ingresar un precio válido (ej. "99.99"). <br> 2. Guardar el artículo. <br> 3. Navegar a la tarjeta del artículo y a la página de detalles del artículo. | El precio se muestra consistentemente con el formato de moneda MXN (ej. "$99.99 MXN") en ambos lugares. |
| **H3-P05** | Edición de un precio existente | 1. Publicar un artículo con un precio válido. <br> 2. Editar el artículo y cambiar el precio (ej. de 150.00 a 120.50). <br> 3. Guardar los cambios. | El precio se actualiza correctamente y se muestra el nuevo precio formateado en la tarjeta y página de detalles. |

#### Escenarios de Prueba Negativos y Casos de Borde

| ID TC | Descripción del Escenario | Pasos de Prueba | Resultado Esperado |
| :---- | :------------------------ | :-------------- | :----------------- |
| **H3-N01** | Campo de precio vacío | 1. Dejar el campo de precio vacío. <br> 2. Intentar guardar/publicar el artículo. | El sistema muestra un mensaje de error indicando que el campo de precio es obligatorio. El artículo no debe publicarse/guardarse. |
| **H3-N02** | Entrada no numérica | 1. Ingresar "cien pesos" o "abc" en el campo de precio. <br> 2. Intentar guardar/publicar el artículo. | El sistema muestra un mensaje de error indicando que la entrada debe ser un valor numérico. El artículo no debe publicarse/guardarse. |
| **H3-N03** | Precio por debajo del mínimo | 1. Ingresar un valor menor al mínimo permitido (ej. "0.50" si el mínimo es "1.00"). <br> 2. Intentar guardar/publicar el artículo. | El sistema muestra un mensaje de error indicando que el precio debe ser mayor o igual al valor mínimo. El artículo no debe publicarse/guardarse. |
| **H3-N04** | Precio cero | 1. Ingresar "0.00" en el campo de precio. <br> 2. Intentar guardar/publicar el artículo. | El sistema debe tratarlo como un precio inválido (si el mínimo es > 0) y mostrar el mensaje de error de valor mínimo. (Si el mínimo es 0, debería aceptarse y mostrarse como $0.00 MXN). |
| **H3-N05** | Precio negativo | 1. Ingresar "-10.00" en el campo de precio. <br> 2. Intentar guardar/publicar el artículo. | El sistema debe mostrar un mensaje de error indicando que el precio no puede ser negativo. El artículo no debe publicarse/guardarse. |
| **H3-N06** | Demasiados decimales | 1. Ingresar "100.123" en el campo de precio (más de dos decimales). <br> 2. Intentar guardar/publicar el artículo. | El sistema debe redondear automáticamente a dos decimales o mostrar un error pidiendo un formato válido. (Comportamiento a definir con PO). Idealmente, se valida y se permite solo 2 decimales. |
| **H3-N07** | Intento de establecer precio en tipo de transacción no "Venta" | 1. Seleccionar 'Donación' o 'Intercambio' como tipo de transacción. <br> 2. Verificar el estado del campo de precio. | El campo de precio debe estar deshabilitado o no visible cuando el tipo de transacción no es 'Venta'. |
| **H3-N08** | Precio con formato incorrecto de separador decimal | 1. Ingresar "100,50" (usando coma en lugar de punto, si la aplicación espera punto). <br> 2. Intentar guardar/publicar el artículo. | El sistema debe mostrar un mensaje de error indicando el formato numérico esperado (ej. "Use un punto como separador decimal"). O, si la localización lo permite, aceptarlo. (Definir estándar con PO). |
| **H3-N09** | Acceso a función de publicación/precio sin autenticación | 1. Cerrar sesión o intentar acceder a la URL de publicación de artículo sin iniciar sesión. <br> 2. Intentar establecer un precio. | El sistema debe redirigir al usuario a la página de inicio de sesión o mostrar un mensaje indicando que se requiere autenticación. |

---

## 11. Criterios de Aceptación (Consolidado)

Los siguientes criterios de aceptación se derivan de las historias de usuario y se utilizarán para determinar si las características cumplen con los requisitos y están listas para su lanzamiento.

*   **Accesibilidad para Usuarios Autorizados:**
    *   Todas las funcionalidades (búsqueda, filtros, establecimiento de precio) son accesibles y operativas solo para usuarios autenticados de ITESO.
    *   Intentar acceder o utilizar estas funcionalidades sin autenticación redirige al usuario a la página de inicio de sesión o muestra un mensaje de error apropiado.
*   **Funcionalidad Completa y Esperada:**
    *   **Búsqueda:**
        *   La barra de búsqueda permite ingresar texto.
        *   La búsqueda coincide correctamente con títulos, descripciones y categorías de los artículos.
        *   Los resultados de la búsqueda se muestran en vista de lista o cuadrícula, con la opción de cambiar entre ellas.
        *   Cada resultado de búsqueda muestra título, imagen (si disponible), precio/tipo de transacción y condición del artículo.
    *   **Filtros:**
        *   Los filtros por categoría (libros, electrónica, ropa, útiles escolares), condición (nuevo, como nuevo, bueno, justo) y tipo de transacción (venta, donación, intercambio) están disponibles.
        *   Los filtros funcionan individualmente y en cualquier combinación.
        *   Los resultados de los artículos se actualizan dinámicamente cada vez que se aplica o modifica un filtro.
        *   Existe una forma clara de restablecer los filtros.
    *   **Establecimiento de Precios:**
        *   Cuando el tipo de transacción es 'Venta', se habilita un campo para introducir el precio en MXN.
        *   El campo de precio valida que la entrada sea numérica.
        *   El campo de precio impone un valor mínimo permitido.
        *   El precio se muestra formateado como moneda MXN (ej. "$150.75 MXN") en la tarjeta del artículo y en la página de detalles.
*   **Retroalimentación Adecuada al Usuario:**
    *   Se muestran mensajes claros cuando no hay resultados para una búsqueda o una combinación de filtros.
    *   Se proporcionan mensajes de error descriptivos para entradas inválidas en el campo de precio (ej. no numérico, por debajo del mínimo, vacío).
    *   Los cambios de filtro o búsqueda se reflejan visualmente y dinámicamente en la lista de resultados.
    *   Las acciones exitosas (ej. artículo publicado con precio) son confirmadas visualmente.
*   **Manejo Elegante de Errores:**
    *   Las entradas inválidas o maliciosas en los campos de búsqueda o precio no causan fallos en la aplicación ni exposición de información sensible.
    *   Los mensajes de error son informativos y amigables para el usuario, no mostrando detalles técnicos internos.

---