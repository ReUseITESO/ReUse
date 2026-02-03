# 🤖 User Story Generator Agent

## Equipo: Core

## 🎯 Objetivo

Generar **historias de usuario completas y listas para producción**, evitando duplicaciones y considerando dependencias técnicas y funcionales dentro del proyecto **ReUseITESO**.

Este agente ayuda al equipo a **pensar antes de programar**, produciendo historias detalladas que pueden ir directamente al backlog sin necesidad de refinamiento adicional.

---

## 📋 ¿Qué hace este agente?

El agente genera historias de usuario que incluyen:

- ✅ Título claro y descriptivo
- ✅ User story en formato estándar
- ✅ Descripción detallada con contexto
- ✅ Criterios de aceptación verificables (checklist)
- ✅ Detalles de implementación (Backend, Frontend, Database)
- ✅ Notas de testing
- ✅ Datos de prueba requeridos
- ✅ Mocks potenciales
- ✅ Verificación de dependencias y duplicaciones

---

## 🚀 Cómo usar el agente

### Opción 1: Uso interactivo (recomendado)

```bash
cd agents/user-story-generator
python src/generator.py
```

El agente te guiará paso a paso para generar la historia.

### Opción 2: Uso con archivo de entrada

```bash
python src/generator.py --input examples/input-example.json --output my-story.md
```

### Opción 3: Uso programático

```python
from src.generator import UserStoryGenerator

generator = UserStoryGenerator()
story = generator.generate(
    title="User can publish an item",
    domain="Marketplace",
    description="Allow users to create and publish items for reuse",
    existing_stories=[]  # opcional: lista de historias existentes
)

print(story.to_markdown())
```

---

## 📂 Estructura del agente

```
user-story-generator/
├── README.md                    # Este archivo
├── src/
│   ├── generator.py             # Lógica principal del generador
│   ├── models.py                # Modelos de datos
│   ├── validators.py            # Validadores y checkers
│   └── templates.py             # Templates de salida
├── examples/
│   ├── input-example.json       # Ejemplo de entrada
│   ├── output-example.md        # Ejemplo de salida
│   └── existing-stories.json    # Ejemplo de historias existentes
├── templates/
│   └── story-template.md        # Template base
└── requirements.txt             # Dependencias Python
```

---

## 📥 Formato de entrada

El agente acepta entrada en formato JSON:

```json
{
  "title": "User can publish an item for reuse",
  "domain": "Marketplace",
  "description": "Users need to be able to create and publish items so other community members can see them",
  "context": {
    "user_type": "authenticated ITESO user",
    "platform": "web",
    "priority": "high"
  },
  "existing_stories": [
    {
      "id": "US-001",
      "title": "User authentication",
      "domain": "Core"
    }
  ]
}
```

---

## 📤 Formato de salida

El agente genera un archivo Markdown con la siguiente estructura obligatoria:

1. **Title**
2. **User Story** (formato: As a... I want... so that...)
3. **Descripción detallada**
4. **Acceptance Criteria** (checklist)
5. **Implementation Details** (Backend, Frontend, Database)
6. **Testing Notes**
7. **Test Data Required**
8. **Potential Mocks**
9. **Dependencies & Duplication Check**

Ver `examples/output-example.md` para un ejemplo completo.

---

## ⚙️ Configuración

### Requisitos

- Python 3.9+
- pip

### Instalación

```bash
cd agents/user-story-generator
pip install -r requirements.txt
```

### Variables de entorno (opcional)

Crea un archivo `.env` si necesitas configuración adicional:

```env
# Opcional: ruta a archivo de historias existentes
EXISTING_STORIES_PATH=../../docs/backlog/stories.json

# Opcional: nivel de detalle (basic, detailed, comprehensive)
DETAIL_LEVEL=detailed
```

---

## 🎯 Principios del agente

### ✅ Lo que el agente HACE

- Genera historias completas y detalladas
- Valida que no falten secciones obligatorias
- Identifica dependencias con otras historias
- Alerta sobre posibles duplicaciones
- Sugiere división de historias muy grandes
- Documenta suposiciones explícitamente

### ❌ Lo que el agente NO HACE

- No usa formato Given/When/Then
- No genera historias genéricas sin contexto
- No inventa reglas institucionales del ITESO
- No asume tecnologías no definidas
- No crea épicas disfrazadas de historias

---

## 📖 Ejemplos de uso

### Ejemplo 1: Historia simple

```bash
python src/generator.py \
  --title "User can view item details" \
  --domain "Marketplace" \
  --description "Users need to see full details of an item before requesting it"
```

### Ejemplo 2: Con validación de duplicados

```bash
python src/generator.py \
  --input examples/input-example.json \
  --existing-stories ../../docs/backlog/stories.json \
  --output generated-story.md
```

### Ejemplo 3: Modo interactivo

```bash
python src/generator.py --interactive
```

---

## 🧪 Testing del agente

Para verificar que el agente funciona correctamente:

```bash
# Ejecutar tests unitarios
python -m pytest tests/

# Generar historia de ejemplo
python src/generator.py --example

# Validar formato de salida
python src/validator.py examples/output-example.md
```

---

## 🤝 Contribuir al agente

Si necesitas mejorar o extender el agente:

1. Crea un branch: `agent/story-generator-<feature>`
2. Haz tus cambios
3. Actualiza los ejemplos si es necesario
4. Abre un Pull Request

---

## 📚 Referencias

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [ReUseITESO README](../../README.md)
- [Documentación de dominios](../../docs/)

---

## ⚠️ Notas importantes

- Este agente es una **herramienta de desarrollo**, no parte del producto
- Las historias generadas deben ser revisadas por el equipo
- El agente hace suposiciones que deben validarse
- Prioriza claridad sobre cantidad

---

## 📞 Contacto

Para dudas o mejoras del agente, contacta al **Equipo Core**.
