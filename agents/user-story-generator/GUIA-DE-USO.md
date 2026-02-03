# 📖 Guía de Uso - User Story Generator Agent

## Introducción

Este agente te ayuda a generar historias de usuario completas y listas para producción para el proyecto **ReUseITESO**. 

El objetivo es que **pienses antes de programar** y tengas historias detalladas que puedan ir directamente al backlog.

---

## 🚀 Inicio Rápido

### Opción 1: Script de inicio rápido (recomendado)

```bash
./quick-start.sh
```

Este script te guiará paso a paso.

### Opción 2: Generar historia de ejemplo

```bash
python3 src/generator.py --example
```

### Opción 3: Modo interactivo

```bash
python3 src/generator.py --interactive
```

El agente te hará preguntas y generará la historia.

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Historia simple desde línea de comandos

```bash
python3 src/generator.py \
  --title "User can view item details" \
  --domain "Marketplace" \
  --description "Users need to see full information about an item before requesting it"
```

### Ejemplo 2: Generar desde archivo JSON

Crea un archivo `my-story.json`:

```json
{
  "title": "User can filter items by category",
  "domain": "Marketplace",
  "description": "Users want to filter items by category to find what they need faster",
  "context": {
    "user_type": "authenticated ITESO user",
    "platform": "web",
    "priority": "medium"
  }
}
```

Luego ejecuta:

```bash
python3 src/generator.py \
  --input my-story.json \
  --output US-012-filter-by-category.md
```

### Ejemplo 3: Con validación de duplicados

```bash
python3 src/generator.py \
  --input examples/input-example.json \
  --existing-stories examples/existing-stories.json \
  --output generated-story.md
```

---

## 🎯 Estructura de la Historia Generada

Cada historia incluye **9 secciones obligatorias**:

### 1. Title
Título claro y descriptivo.

### 2. User Story
Formato: `As a [user], I want to [action] so that [benefit]`

### 3. Descripción detallada
Contexto completo de la funcionalidad.

### 4. Acceptance Criteria
Lista de criterios verificables (checklist).

### 5. Implementation Details
Dividido en:
- **Backend**: endpoints, validaciones, lógica de negocio
- **Frontend**: componentes, estados, validaciones
- **Database**: entidades, campos, relaciones

### 6. Testing Notes
Casos de prueba a considerar.

### 7. Test Data Required
Datos necesarios para probar.

### 8. Potential Mocks
Servicios que pueden requerir mocks.

### 9. Dependencies & Duplication Check
Dependencias identificadas y posibles duplicados.

---

## ⚙️ Configuración Avanzada

### Variables de entorno

Crea un archivo `.env`:

```env
EXISTING_STORIES_PATH=../../docs/backlog/stories.json
DETAIL_LEVEL=detailed
OUTPUT_DIR=./generated-stories
```

### Archivo de historias existentes

Para validar duplicados, crea un archivo JSON con tus historias existentes:

```json
[
  {
    "id": "US-001",
    "title": "User authentication",
    "domain": "Core",
    "description": "Users authenticate with ITESO credentials"
  },
  {
    "id": "US-002",
    "title": "User profile management",
    "domain": "Core"
  }
]
```

---

## 🎨 Personalización

### Modificar templates

Edita `templates/story-template.md` para cambiar el formato de salida.

### Ajustar validadores

Edita `src/validators.py` para:
- Cambiar el umbral de similitud para duplicados
- Agregar nuevas palabras clave para dependencias
- Modificar reglas de validación

### Extender el generador

Edita `src/generator.py` para:
- Agregar nuevas secciones
- Modificar la lógica de generación
- Agregar nuevos dominios

---

## ✅ Buenas Prácticas

### 1. Revisa la historia generada
El agente hace suposiciones. Siempre revisa y ajusta según sea necesario.

### 2. Valida dependencias
Verifica que las dependencias identificadas sean correctas.

### 3. Divide historias grandes
Si el agente advierte que la historia es muy grande, divídela.

### 4. Mantén el archivo de historias existentes actualizado
Esto ayuda a evitar duplicados.

### 5. Documenta suposiciones
Si el agente hace suposiciones incorrectas, documéntalas.

---

## 🐛 Solución de Problemas

### El agente no encuentra dependencias

**Solución:** Proporciona el archivo de historias existentes con `--existing-stories`.

### La historia es muy genérica

**Solución:** Proporciona más contexto en la descripción y usa el campo `context`.

### El formato no es el esperado

**Solución:** Verifica que estés usando la última versión del agente.

### Error de validación

**Solución:** Revisa los warnings generados y ajusta la entrada.

---

## 📚 Ejemplos por Dominio

### Core Domain

```bash
python3 src/generator.py \
  --title "User can reset password" \
  --domain "Core" \
  --description "Users need to reset their password if they forget it"
```

### Marketplace Domain

```bash
python3 src/generator.py \
  --title "User can request an item" \
  --domain "Marketplace" \
  --description "Users can request items from other users for exchange or donation"
```

### Gamification Domain

```bash
python3 src/generator.py \
  --title "User can view their achievements" \
  --domain "Gamification" \
  --description "Users want to see their earned achievements and badges"
```

---

## 🤝 Contribuir al Agente

Si encuentras bugs o quieres mejorar el agente:

1. Crea un branch: `agent/story-generator-mejora`
2. Haz tus cambios
3. Actualiza esta guía si es necesario
4. Abre un Pull Request

---

## 📞 Ayuda

Para dudas o problemas:
- Revisa los ejemplos en `examples/`
- Consulta el README principal
- Contacta al Equipo Core

---

## 🎓 Tips para Escribir Buenas Historias

### ✅ Hacer

- Ser específico en el título
- Incluir el beneficio en el user story
- Usar criterios de aceptación verificables
- Pensar en casos de error
- Documentar suposiciones

### ❌ Evitar

- Títulos genéricos ("Manage items")
- Historias muy grandes (épicas disfrazadas)
- Criterios de aceptación vagos
- Asumir tecnologías no definidas
- Inventar reglas del ITESO

---

## 📊 Checklist de Calidad

Antes de llevar una historia al backlog, verifica:

- [ ] El título es claro y específico
- [ ] El user story sigue el formato correcto
- [ ] La descripción tiene contexto suficiente
- [ ] Los criterios de aceptación son verificables
- [ ] Los detalles de implementación están completos
- [ ] Se incluyen notas de testing
- [ ] Se especifican datos de prueba
- [ ] Se identificaron dependencias
- [ ] No hay duplicados
- [ ] Las suposiciones están documentadas

---

¡Listo! Ahora puedes generar historias de usuario completas y profesionales para ReUseITESO. 🚀
