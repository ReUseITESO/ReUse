# Reporte Extendido de Ejecución de Pruebas Automatizadas

**Fecha de ejecución:** 7/5/2026, 5:53:21 p.m.
**Objetivo:** Validar exhaustivamente las Historias de Usuario 1 (Búsqueda), 2 (Filtros) y 3 (Precios).
**Total de pruebas ejecutadas:** 19

## Resumen de Resultados por Historia de Usuario

| ID Caso de Prueba | Descripción | Estado | Notas Adicionales |
| --- | --- | --- | --- |
| **H1-P01** | Búsqueda por palabra clave válida | ✅ Éxito | - |
| **H1-P05** | Búsqueda de término común (libro) | ✅ Éxito | - |
| **H1-P09** | Búsqueda insensible a mayúsculas (LIBRO) | ✅ Éxito | - |
| **H1-N01** | Búsqueda sin resultados muestra mensaje correcto | ✅ Éxito | - |
| **H1-N03** | Manejo de búsqueda con caracteres especiales | ✅ Éxito | - |
| **H1-P07** | Restablecer barra de búsqueda | ✅ Éxito | - |
| **H2-P01** | Aplicar filtro por Categoría | ✅ Éxito | - |
| **H2-P02** | Aplicar filtro por Condición | ✅ Éxito | - |
| **H2-P03** | Aplicar filtro por Tipo de Transacción | ✅ Éxito | - |
| **H2-P06** | Aplicar múltiples filtros combinados (3 al mismo tiempo) | ✅ Éxito | - |
| **H2-N01** | Filtros combinados sin resultados | ✅ Éxito | - |
| **H2-P08** | Limpiar todos los filtros | ✅ Éxito | - |
| **H3-N05** | Rechazar precio negativo | ✅ Éxito | Input simulado |
| **H3-N02** | Rechazar entrada no numérica | ❌ Fallo | - |
| **H3-N04** | Validar comportamiento con precio cero | ✅ Éxito | - |
| **H3-N06** | Manejo de múltiples decimales | ✅ Éxito | - |
| **H3-N08** | Validación de separador decimal incorrecto | ❌ Fallo | - |
| **H3-P01** | Establecer un precio válido final | ✅ Éxito | - |
| **H3-N01** | Validar campo de precio vacío como requerido | ✅ Éxito | - |

## Estadísticas de la Ejecución
- **✅ Pasadas:** 17
- **❌ Fallidas:** 2
- **⚠️ Advertencias:** 0
- **Tasa de Éxito:** 89%

## Conclusión
El agente ha ejecutado una suite extendida de pruebas validando casos positivos (happy path), casos negativos y de borde estipulados en el Plan de Pruebas. Cualquier caso con advertencia sugiere que un elemento de la interfaz gráfica no respondió exactamente como se esperaba pero la prueba no bloqueó la ejecución.
