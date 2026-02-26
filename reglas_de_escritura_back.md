# Normas de Escritura – Backend (Django REST Framework)

## Propósito

Reglas obligatorias de estilo y escritura de código para el backend de ReUseITESO. Todo PR que no cumpla estas normas será rechazado. Sin excepciones.

---

## 1. Reglas Generales

### Archivos

- **Máximo 350 líneas por archivo.** Si un archivo supera este límite, se divide en archivos más pequeños con responsabilidad clara.
- **Un archivo, una responsabilidad.** No mezclar serializers con views ni models con utils.
- Archivos vacíos o con solo un `pass` no se commitean.
- No se commitean archivos `.pyc`, `__pycache__/`, `.env`, `db.sqlite3` ni `media/`. Deben estar en `.gitignore`.

### Comentarios

- **No se escriben comentarios obvios.** El código debe ser suficientemente claro por sí mismo.
- Si necesitas un comentario para explicar qué hace el código, reescribe el código.
- Los únicos comentarios aceptables son:
  - `# TODO:` con ticket o contexto específico (ej. `# TODO: agregar validación de imagen cuando se defina el límite`)
  - Explicación de una decisión no obvia de negocio (ej. `# Los productos cancelados no se eliminan, se mantienen para historial`)
- **Prohibido:**
  ```python
  # Esto NO se hace:
  # Obtener el usuario
  user = request.user
  # Verificar si es vendedor
  if user.role == 'seller':
      # Crear el producto
      product = Product.objects.create(...)
  ```

### Nombres

- Variables, funciones y métodos: `snake_case`
- Clases: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Nombres descriptivos y en **inglés**:
  ```python
  # Bien
  published_products = Product.objects.filter(status='published')
  
  # Mal
  prods = Product.objects.filter(status='published')
  pp = Product.objects.filter(status='published')
  productos_publicados = Product.objects.filter(status='published')
  ```
- No usar abreviaciones crípticas. `transaction` no `txn`, `message` no `msg`, `product` no `prod`.
- Booleans se nombran como pregunta: `is_active`, `has_badge`, `can_edit`.

### Emojis y decoración

- **Cero emojis** en código, comentarios, docstrings o mensajes de log.
- **Cero arte ASCII** ni separadores decorativos.
- Los prints de debug no se commitean. Usar `logging` si se necesita un log.

---

## 2. Convenciones de Django

### Estructura de una Django App

Cada módulo (core, marketplace, gamification) debe seguir esta estructura:

```
marketplace/
├── __init__.py
├── models/                 # Si hay muchos modelos, dividir en archivos
│   ├── __init__.py         # Importa todos los modelos
│   ├── product.py
│   ├── transaction.py
│   └── message.py
├── serializers/
│   ├── __init__.py
│   ├── product.py
│   └── transaction.py
├── views/
│   ├── __init__.py
│   ├── product.py
│   └── transaction.py
├── services/               # Lógica de negocio
│   ├── __init__.py
│   └── product_service.py
├── urls.py
├── permissions.py
├── filters.py
├── signals.py
├── admin.py
├── apps.py
└── tests/
    ├── __init__.py
    ├── test_product_views.py
    └── test_product_services.py
```

**Regla clave:** si `models.py`, `views.py` o `serializers.py` supera 350 líneas, se convierte en un directorio con archivos separados por recurso.

### Models

```python
class Product(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED)
    seller = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey('Category', on_delete=models.PROTECT, related_name='products')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title
```

**Reglas de modelos:**
- Todo modelo lleva `created_at` y `updated_at`.
- Todo modelo implementa `__str__`.
- Choices se definen como `TextChoices` o `IntegerChoices` de Django, no como tuplas sueltas.
- `related_name` siempre explícito en ForeignKey. No usar el default de Django.
- `on_delete` siempre explícito. Pensar si es `CASCADE`, `PROTECT` o `SET_NULL`.
- No poner lógica de negocio en los modelos. Los modelos son estructura de datos. La lógica va en `services/`.
- `Meta.ordering` definido en los modelos que se listan frecuentemente.

### Views

Se usan **ViewSets** de DRF cuando el recurso tiene CRUD completo. Se usan **APIView** para acciones específicas.

```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('seller', 'category').filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = ProductFilter

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
```

**Reglas de views:**
- **Siempre** usar `select_related` y `prefetch_related` en querysets que involucren relaciones. Prohibido causar N+1 queries.
- Una view no hace lógica de negocio compleja. Si necesita más de 10 líneas de lógica, se mueve a un service.
- Separar serializers de lectura y escritura si difieren significativamente (`ProductListSerializer` vs `ProductDetailSerializer`).
- No usar `@api_view` funcional para endpoints que pertenecen a un recurso con CRUD.

### Serializers

```python
class ProductListSerializer(serializers.ModelSerializer):
    seller = UserSummarySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'status', 'seller', 'created_at']
```

**Reglas de serializers:**
- Siempre listar `fields` explícitamente. **Prohibido** usar `fields = '__all__'`.
- Usar `read_only=True` en campos que no deben modificarse vía API.
- Validaciones de negocio van en el método `validate()` o `validate_{field}()` del serializer.
- Serializers anidados para relaciones que se muestran en la respuesta (`seller`, `category`).

### Services

```python
def change_product_status(product, new_status, user):
    valid_transitions = {
        'published': ['reserved', 'cancelled'],
        'reserved': ['published', 'sold', 'cancelled'],
    }

    allowed = valid_transitions.get(product.status, [])
    if new_status not in allowed:
        raise ValidationError(f'No se puede cambiar de {product.status} a {new_status}')

    if product.seller != user:
        raise PermissionDenied('Solo el vendedor puede cambiar el estado')

    product.status = new_status
    product.save(update_fields=['status', 'updated_at'])
    return product
```

**Reglas de services:**
- Son funciones puras o clases que encapsulan lógica de negocio.
- No acceden a `request` directamente. Reciben los datos que necesitan como parámetros.
- Lanzan excepciones de DRF (`ValidationError`, `PermissionDenied`, `NotFound`) que las views propagan automáticamente.
- Son el lugar correcto para lógica que involucra múltiples modelos o validaciones complejas.

### URLs

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
```

**Reglas de URLs:**
- Usar `DefaultRouter` de DRF para ViewSets.
- Siempre definir `basename`.
- URLs en plural e inglés.

### Tests

```python
class TestProductCreation(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@iteso.mx',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_product_returns_201(self):
        data = {'title': 'MacBook Air', 'price': '8500.00', 'category': self.category.id}
        response = self.client.post('/api/products/', data)
        assert response.status_code == 201

    def test_create_product_without_title_returns_400(self):
        data = {'price': '8500.00'}
        response = self.client.post('/api/products/', data)
        assert response.status_code == 400
```

**Reglas de tests:**
- Nombres de test descriptivos: `test_{qué_hace}_returns_{resultado_esperado}`.
- Un assert por test siempre que sea práctico.
- Usar `force_authenticate` en lugar de generar tokens manualmente.
- Archivos de test siguen el patrón `test_{recurso}_{capa}.py` (ej. `test_product_views.py`, `test_product_services.py`).

---

## 3. Reglas de Python

### Formato

- **PEP 8** es obligatorio.
- Líneas de máximo **88 caracteres** (configuración de Black).
- Se usa **Black** como formatter automático. No se discute estilo de formato: Black decide.
- Se usa **isort** para ordenar imports.
- Se usa **flake8** para linting.

### Imports

Orden obligatorio (isort lo aplica automáticamente):

```python
# 1. Standard library
from datetime import datetime

# 2. Django / third party
from django.db import models
from rest_framework import serializers

# 3. Local / proyecto
from core.models import User
from marketplace.services import change_product_status
```

- **Prohibido** imports con wildcard: `from models import *`
- Imports absolutos siempre. No usar imports relativos (no `from .models import Product`, sí `from marketplace.models import Product`).

### Type hints

Opcionales pero recomendados en services y funciones utilitarias:

```python
def calculate_points(user: User, action: str) -> int:
    ...
```

### Manejo de errores

- No usar `try/except` genéricos. Siempre capturar excepciones específicas.
- No silenciar errores con `except: pass`.
  ```python
  # Mal
  try:
      product = Product.objects.get(id=product_id)
  except:
      pass

  # Bien
  try:
      product = Product.objects.get(id=product_id)
  except Product.DoesNotExist:
      raise NotFound('Producto no encontrado')
  ```

---

## 4. Configuración del Proyecto

### .editorconfig

```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.{js,ts,tsx,json,yml,yaml}]
indent_size = 2
```

### Herramientas de linting (pyproject.toml)

```toml
[tool.black]
line-length = 88
target-version = ['py312']

[tool.isort]
profile = "black"

[tool.flake8]
max-line-length = 88
extend-ignore = ["E203", "W503"]
```

Estas herramientas se ejecutan en CI. Si el código no pasa Black + isort + flake8, el pipeline falla.