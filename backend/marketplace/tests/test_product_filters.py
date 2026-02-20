"""
Tests para los filtros del marketplace: category, condition, transaction_type.
Cubre filtros individuales, combinados, búsqueda de texto y casos borde.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.models.user import User
from marketplace.models.category import Category
from marketplace.models.product import Products


PRODUCTS_URL = "/api/marketplace/products/"
CATEGORIES_URL = "/api/marketplace/categories/"


def make_user(n: int) -> User:
    return User.objects.create(
        email=f"testuser{n}@iteso.mx",
        name=f"Test User {n}",
        phone="3300000000",
    )


def make_category(name: str, icon: str = "tag") -> Category:
    return Category.objects.create(name=name, icon=icon)


def make_product(
    seller: User,
    category: Category,
    title: str = "Producto Test",
    condition: str = "buen_estado",
    transaction_type: str = "sale",
    status_val: str = "disponible",
    price: str = "100.00",
    description: str = "Descripción de prueba.",
) -> Products:
    return Products.objects.create(
        seller=seller,
        category=category,
        title=title,
        description=description,
        condition=condition,
        transaction_type=transaction_type,
        status=status_val,
        price=price,
    )


class ProductFilterSetupMixin:
    """Mixin que crea datos de prueba reutilizables."""

    @classmethod
    def setUpTestData(cls):
        cls.seller = make_user(1)

        cls.cat_libros = make_category("Libros", "book")
        cls.cat_electronica = make_category("Electrónica", "laptop")
        cls.cat_ropa = make_category("Ropa ITESO", "shirt")

        # Libros – venta, nuevo
        cls.p_libro_nuevo = make_product(
            cls.seller, cls.cat_libros,
            title="Cálculo Stewart 8va",
            condition="nuevo",
            transaction_type="sale",
            price="350.00",
        )
        # Libros – intercambio, buen_estado
        cls.p_libro_swap = make_product(
            cls.seller, cls.cat_libros,
            title="Marketing Kotler",
            condition="buen_estado",
            transaction_type="swap",
            price=None,
        )
        # Electrónica – venta, buen_estado
        cls.p_mouse = make_product(
            cls.seller, cls.cat_electronica,
            title="Mouse Logitech MX Master 3",
            condition="buen_estado",
            transaction_type="sale",
            price="600.00",
        )
        # Electrónica – venta, como_nuevo
        cls.p_teclado = make_product(
            cls.seller, cls.cat_electronica,
            title="Teclado Mecánico Redragon",
            condition="como_nuevo",
            transaction_type="sale",
            price="450.00",
        )
        # Ropa – donación, usado
        cls.p_sudadera = make_product(
            cls.seller, cls.cat_ropa,
            title="Sudadera ITESO Gris",
            condition="usado",
            transaction_type="donation",
            price=None,
        )
        # Producto NO disponible (debe excluirse en todos los filtros)
        cls.p_inactivo = make_product(
            cls.seller, cls.cat_libros,
            title="Libro Inactivo",
            condition="nuevo",
            transaction_type="sale",
            status_val="completado",
        )


# ─────────────────────────────────────────────────────────────────────────────
# 1. Listado general
# ─────────────────────────────────────────────────────────────────────────────
class ProductListTests(ProductFilterSetupMixin, APITestCase):

    def test_list_returns_only_disponible(self):
        """Solo se retornan productos con status='disponible'."""
        response = self.client.get(PRODUCTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data["results"]]
        self.assertNotIn("Libro Inactivo", titles)

    def test_list_returns_five_products(self):
        """Se retornan exactamente los 5 productos disponibles creados."""
        response = self.client.get(PRODUCTS_URL)
        self.assertEqual(response.data["count"], 5)

    def test_response_has_pagination_keys(self):
        """La respuesta incluye las claves de paginación de DRF."""
        response = self.client.get(PRODUCTS_URL)
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def test_product_fields_present(self):
        """Cada producto expone los campos esperados."""
        response = self.client.get(PRODUCTS_URL)
        product = response.data["results"][0]
        expected_fields = {
            "id", "title", "description", "condition",
            "transaction_type", "status", "price",
            "image_url", "category", "seller_name", "created_at",
        }
        self.assertTrue(expected_fields.issubset(product.keys()))


# ─────────────────────────────────────────────────────────────────────────────
# 2. Filtro por categoría
# ─────────────────────────────────────────────────────────────────────────────
class ProductFilterByCategoryTests(ProductFilterSetupMixin, APITestCase):

    def test_filter_by_libros_returns_two_products(self):
        """Filtrar por Libros retorna exactamente los 2 libros disponibles."""
        response = self.client.get(PRODUCTS_URL, {"category": self.cat_libros.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        for p in response.data["results"]:
            self.assertEqual(p["category"]["id"], self.cat_libros.id)

    def test_filter_by_electronica_returns_two_products(self):
        """Filtrar por Electrónica retorna 2 productos."""
        response = self.client.get(PRODUCTS_URL, {"category": self.cat_electronica.id})
        self.assertEqual(response.data["count"], 2)

    def test_filter_by_ropa_returns_one_product(self):
        """Filtrar por Ropa ITESO retorna 1 producto."""
        response = self.client.get(PRODUCTS_URL, {"category": self.cat_ropa.id})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Sudadera ITESO Gris")

    def test_filter_by_nonexistent_category_returns_empty(self):
        """Filtrar por una categoría inexistente retorna lista vacía sin errores."""
        response = self.client.get(PRODUCTS_URL, {"category": 99999})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])


# ─────────────────────────────────────────────────────────────────────────────
# 3. Filtro por condición
# ─────────────────────────────────────────────────────────────────────────────
class ProductFilterByConditionTests(ProductFilterSetupMixin, APITestCase):

    def test_filter_condition_nuevo(self):
        """Filtrar por 'nuevo' retorna solo el libro nuevo."""
        response = self.client.get(PRODUCTS_URL, {"condition": "nuevo"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["condition"], "nuevo")

    def test_filter_condition_buen_estado(self):
        """Filtrar por 'buen_estado' retorna libro swap y mouse."""
        response = self.client.get(PRODUCTS_URL, {"condition": "buen_estado"})
        self.assertEqual(response.data["count"], 2)
        for p in response.data["results"]:
            self.assertEqual(p["condition"], "buen_estado")

    def test_filter_condition_como_nuevo(self):
        """Filtrar por 'como_nuevo' retorna solo el teclado."""
        response = self.client.get(PRODUCTS_URL, {"condition": "como_nuevo"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["condition"], "como_nuevo")

    def test_filter_condition_usado(self):
        """Filtrar por 'usado' retorna solo la sudadera."""
        response = self.client.get(PRODUCTS_URL, {"condition": "usado"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["condition"], "usado")

    def test_filter_invalid_condition_returns_empty(self):
        """Filtrar con un valor de condición inválido retorna lista vacía."""
        response = self.client.get(PRODUCTS_URL, {"condition": "roto"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Filtro por tipo de transacción
# ─────────────────────────────────────────────────────────────────────────────
class ProductFilterByTransactionTypeTests(ProductFilterSetupMixin, APITestCase):

    def test_filter_transaction_sale(self):
        """Filtrar por 'sale' retorna 3 productos (libro nuevo, mouse, teclado)."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "sale"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)
        for p in response.data["results"]:
            self.assertEqual(p["transaction_type"], "sale")

    def test_filter_transaction_swap(self):
        """Filtrar por 'swap' retorna solo el libro de intercambio."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "swap"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Marketing Kotler")

    def test_filter_transaction_donation(self):
        """Filtrar por 'donation' retorna solo la sudadera."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "donation"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Sudadera ITESO Gris")

    def test_filter_invalid_transaction_type_returns_empty(self):
        """Un tipo de transacción desconocido retorna lista vacía."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "renta"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Filtros combinados
# ─────────────────────────────────────────────────────────────────────────────
class ProductCombinedFilterTests(ProductFilterSetupMixin, APITestCase):

    def test_category_and_condition(self):
        """Libros + buen_estado → solo 'Marketing Kotler'."""
        response = self.client.get(PRODUCTS_URL, {
            "category": self.cat_libros.id,
            "condition": "buen_estado",
        })
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Marketing Kotler")

    def test_category_and_transaction_type(self):
        """Electrónica + sale → mouse y teclado (2 productos)."""
        response = self.client.get(PRODUCTS_URL, {
            "category": self.cat_electronica.id,
            "transaction_type": "sale",
        })
        self.assertEqual(response.data["count"], 2)

    def test_condition_and_transaction_type(self):
        """buen_estado + sale → solo el mouse."""
        response = self.client.get(PRODUCTS_URL, {
            "condition": "buen_estado",
            "transaction_type": "sale",
        })
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Mouse Logitech MX Master 3")

    def test_all_three_filters(self):
        """Libros + nuevo + sale → solo 'Cálculo Stewart 8va'."""
        response = self.client.get(PRODUCTS_URL, {
            "category": self.cat_libros.id,
            "condition": "nuevo",
            "transaction_type": "sale",
        })
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Cálculo Stewart 8va")

    def test_filters_with_no_matching_results(self):
        """Combinar filtros sin coincidencias retorna lista vacía sin errores."""
        response = self.client.get(PRODUCTS_URL, {
            "category": self.cat_ropa.id,
            "condition": "nuevo",
            "transaction_type": "sale",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Búsqueda de texto
# ─────────────────────────────────────────────────────────────────────────────
class ProductSearchTests(ProductFilterSetupMixin, APITestCase):

    def test_search_by_title(self):
        """Buscar 'mouse' encuentra el producto Mouse Logitech."""
        response = self.client.get(PRODUCTS_URL, {"search": "mouse"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertIn("Mouse", response.data["results"][0]["title"])

    def test_search_by_category_name(self):
        """Buscar 'electrónica' encuentra los productos de esa categoría."""
        response = self.client.get(PRODUCTS_URL, {"search": "electrónica"})
        self.assertEqual(response.data["count"], 2)

    def test_search_case_insensitive(self):
        """La búsqueda es insensible a mayúsculas."""
        response = self.client.get(PRODUCTS_URL, {"search": "TECLADO"})
        self.assertEqual(response.data["count"], 1)

    def test_search_no_results(self):
        """Buscar un término inexistente retorna lista vacía."""
        response = self.client.get(PRODUCTS_URL, {"search": "xyznonexistent"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_search_combined_with_filter(self):
        """Buscar 'stewart' dentro de Libros retorna exactamente 1 resultado."""
        response = self.client.get(PRODUCTS_URL, {
            "search": "stewart",
            "category": self.cat_libros.id,
        })
        self.assertEqual(response.data["count"], 1)
        self.assertIn("Stewart", response.data["results"][0]["title"])

    def test_search_does_not_return_inactive_products(self):
        """La búsqueda tampoco retorna productos que no estén disponibles."""
        response = self.client.get(PRODUCTS_URL, {"search": "inactivo"})
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 7. Endpoint de categorías
# ─────────────────────────────────────────────────────────────────────────────
class CategoryEndpointTests(ProductFilterSetupMixin, APITestCase):

    def test_list_categories(self):
        """Listar categorías retorna las 3 categorías creadas en el setup."""
        response = self.client.get(CATEGORIES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 3)

    def test_category_fields(self):
        """Cada categoría expone id, name e icon."""
        response = self.client.get(CATEGORIES_URL)
        cat = response.data["results"][0]
        self.assertIn("id", cat)
        self.assertIn("name", cat)
        self.assertIn("icon", cat)

    def test_retrieve_single_category(self):
        """Obtener una categoría por ID retorna los datos correctos."""
        url = f"{CATEGORIES_URL}{self.cat_libros.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Libros")

    def test_retrieve_nonexistent_category_returns_404(self):
        """Intentar obtener una categoría inexistente retorna 404."""
        url = f"{CATEGORIES_URL}99999/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
