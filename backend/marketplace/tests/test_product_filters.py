"""
Tests for marketplace filters: category, condition, transaction_type.
Covers individual filters, combined filters, text search, and edge cases.
"""

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
        first_name="Test",
        last_name=f"User{n}",
        phone="3300000000",
    )


def make_category(name: str, icon: str = "tag") -> Category:
    return Category.objects.create(name=name, icon=icon)


def make_product(
    seller: User,
    category: Category,
    title: str = "Test Product",
    condition: str = "buen_estado",
    transaction_type: str = "sale",
    status_val: str = "disponible",
    price: str = "100.00",
    description: str = "Test description.",
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
    """Mixin that provides reusable test data."""

    @classmethod
    def setUpTestData(cls):
        cls.seller = make_user(1)

        cls.cat_libros = make_category("Libros", "book")
        cls.cat_electronica = make_category("Electrónica", "laptop")
        cls.cat_ropa = make_category("Ropa ITESO", "shirt")

        # Books - sale, nuevo
        cls.p_libro_nuevo = make_product(
            cls.seller,
            cls.cat_libros,
            title="Cálculo Stewart 8va",
            condition="nuevo",
            transaction_type="sale",
            price="350.00",
        )
        # Books - swap, buen_estado
        cls.p_libro_swap = make_product(
            cls.seller,
            cls.cat_libros,
            title="Marketing Kotler",
            condition="buen_estado",
            transaction_type="swap",
            price=None,
        )
        # Electronics - sale, buen_estado
        cls.p_mouse = make_product(
            cls.seller,
            cls.cat_electronica,
            title="Mouse Logitech MX Master 3",
            condition="buen_estado",
            transaction_type="sale",
            price="600.00",
        )
        # Electronics - sale, como_nuevo
        cls.p_teclado = make_product(
            cls.seller,
            cls.cat_electronica,
            title="Teclado Mecánico Redragon",
            condition="como_nuevo",
            transaction_type="sale",
            price="450.00",
        )
        # Clothing - donation, usado
        cls.p_sudadera = make_product(
            cls.seller,
            cls.cat_ropa,
            title="Sudadera ITESO Gris",
            condition="usado",
            transaction_type="donation",
            price=None,
        )
        # Inactive product (must be excluded from all filters)
        cls.p_inactivo = make_product(
            cls.seller,
            cls.cat_libros,
            title="Libro Inactivo",
            condition="nuevo",
            transaction_type="sale",
            status_val="completado",
        )
        cls.p_pausado = make_product(
            cls.seller,
            cls.cat_libros,
            title="Libro Pausado",
            condition="buen_estado",
            transaction_type="sale",
            status_val="pausado",
        )


# ─────────────────────────────────────────────────────────────────────────────
# 1. General listing
# ─────────────────────────────────────────────────────────────────────────────
class ProductListTests(ProductFilterSetupMixin, APITestCase):
    def test_list_returns_only_available(self):
        """Only products with status='available' are returned."""
        response = self.client.get(PRODUCTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data["results"]]
        self.assertNotIn("Libro Inactivo", titles)
        self.assertNotIn("Libro Pausado", titles)

    def test_list_returns_five_products(self):
        """Exactly 5 available products created in setup are returned."""
        response = self.client.get(PRODUCTS_URL)
        self.assertEqual(response.data["count"], 5)

    def test_response_has_pagination_keys(self):
        """The response includes DRF pagination keys."""
        response = self.client.get(PRODUCTS_URL)
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def test_product_fields_present(self):
        """Each product exposes the expected fields."""
        response = self.client.get(PRODUCTS_URL)
        product = response.data["results"][0]
        expected_fields = {
            "id",
            "title",
            "description",
            "condition",
            "transaction_type",
            "status",
            "price",
            "images",
            "category",
            "seller_name",
            "created_at",
        }
        self.assertTrue(expected_fields.issubset(product.keys()))


# ─────────────────────────────────────────────────────────────────────────────
# 2. Filter by category
# ─────────────────────────────────────────────────────────────────────────────
class ProductFilterByCategoryTests(ProductFilterSetupMixin, APITestCase):
    def test_filter_by_libros_returns_two_products(self):
        """Filtering by Books returns exactly 2 available books."""
        response = self.client.get(PRODUCTS_URL, {"category": self.cat_libros.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        for p in response.data["results"]:
            self.assertEqual(p["category"]["id"], self.cat_libros.id)

    def test_filter_by_electronica_returns_two_products(self):
        """Filtering by Electronics returns 2 products."""
        response = self.client.get(PRODUCTS_URL, {"category": self.cat_electronica.id})
        self.assertEqual(response.data["count"], 2)

    def test_filter_by_ropa_returns_one_product(self):
        """Filtering by Clothing returns 1 product."""
        response = self.client.get(PRODUCTS_URL, {"category": self.cat_ropa.id})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Sudadera ITESO Gris")

    def test_filter_by_nonexistent_category_returns_empty(self):
        """Filtering by a non-existent category returns an empty list without errors."""
        response = self.client.get(PRODUCTS_URL, {"category": 99999})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])


# ─────────────────────────────────────────────────────────────────────────────
# 3. Filter by condition
# ─────────────────────────────────────────────────────────────────────────────
class ProductFilterByConditionTests(ProductFilterSetupMixin, APITestCase):
    def test_filter_condition_nuevo(self):
        """Filtering by 'nuevo' returns only the new book."""
        response = self.client.get(PRODUCTS_URL, {"condition": "nuevo"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["condition"], "nuevo")

    def test_filter_condition_good(self):
        """Filtering by 'buen_estado' returns the swap book and the mouse."""
        response = self.client.get(PRODUCTS_URL, {"condition": "buen_estado"})
        self.assertEqual(response.data["count"], 2)
        for p in response.data["results"]:
            self.assertEqual(p["condition"], "buen_estado")

    def test_filter_condition_like_new(self):
        """Filtering by 'como_nuevo' returns only the keyboard."""
        response = self.client.get(PRODUCTS_URL, {"condition": "como_nuevo"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["condition"], "como_nuevo")

    def test_filter_condition_usado(self):
        """Filtering by 'usado' returns only the hoodie."""
        response = self.client.get(PRODUCTS_URL, {"condition": "usado"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["condition"], "usado")

    def test_filter_invalid_condition_returns_empty(self):
        """Filtering with an invalid condition value returns an empty list."""
        response = self.client.get(PRODUCTS_URL, {"condition": "broken"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Filter by transaction type
# ─────────────────────────────────────────────────────────────────────────────
class ProductFilterByTransactionTypeTests(ProductFilterSetupMixin, APITestCase):
    def test_filter_transaction_sale(self):
        """Filtering by 'sale' returns 3 products (new book, mouse, keyboard)."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "sale"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)
        for p in response.data["results"]:
            self.assertEqual(p["transaction_type"], "sale")

    def test_filter_transaction_swap(self):
        """Filtering by 'swap' returns only the swap book."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "swap"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Marketing Kotler")

    def test_filter_transaction_donation(self):
        """Filtering by 'donation' returns only the hoodie."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "donation"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Sudadera ITESO Gris")

    def test_filter_invalid_transaction_type_returns_empty(self):
        """An unknown transaction type returns an empty list."""
        response = self.client.get(PRODUCTS_URL, {"transaction_type": "rental"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Combined filters
# ─────────────────────────────────────────────────────────────────────────────
class ProductCombinedFilterTests(ProductFilterSetupMixin, APITestCase):
    def test_category_and_condition(self):
        """Books + buen_estado -> only 'Marketing Kotler'."""
        response = self.client.get(
            PRODUCTS_URL,
            {
                "category": self.cat_libros.id,
                "condition": "buen_estado",
            },
        )
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Marketing Kotler")

    def test_category_and_transaction_type(self):
        """Electronics + sale -> mouse and keyboard (2 products)."""
        response = self.client.get(
            PRODUCTS_URL,
            {
                "category": self.cat_electronica.id,
                "transaction_type": "sale",
            },
        )
        self.assertEqual(response.data["count"], 2)

    def test_condition_and_transaction_type(self):
        """buen_estado + sale -> only the mouse."""
        response = self.client.get(
            PRODUCTS_URL,
            {
                "condition": "buen_estado",
                "transaction_type": "sale",
            },
        )
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["title"], "Mouse Logitech MX Master 3"
        )

    def test_all_three_filters(self):
        """Books + nuevo + sale -> only 'Calculo Stewart 8va'."""
        response = self.client.get(
            PRODUCTS_URL,
            {
                "category": self.cat_libros.id,
                "condition": "nuevo",
                "transaction_type": "sale",
            },
        )
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Cálculo Stewart 8va")

    def test_filters_with_no_matching_results(self):
        """Combining filters with no matches returns an empty list without errors."""
        response = self.client.get(
            PRODUCTS_URL,
            {
                "category": self.cat_ropa.id,
                "condition": "nuevo",
                "transaction_type": "sale",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Text search
# ─────────────────────────────────────────────────────────────────────────────
class ProductSearchTests(ProductFilterSetupMixin, APITestCase):
    def test_search_by_title(self):
        """Searching 'mouse' finds the Mouse Logitech product."""
        response = self.client.get(PRODUCTS_URL, {"search": "mouse"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertIn("Mouse", response.data["results"][0]["title"])

    def test_search_by_category_name(self):
        """Searching 'electronica' finds products in that category."""
        response = self.client.get(PRODUCTS_URL, {"search": "electrónica"})
        self.assertEqual(response.data["count"], 2)

    def test_search_case_insensitive(self):
        """Search is case-insensitive."""
        response = self.client.get(PRODUCTS_URL, {"search": "TECLADO"})
        self.assertEqual(response.data["count"], 1)

    def test_search_no_results(self):
        """Searching a non-existent term returns an empty list."""
        response = self.client.get(PRODUCTS_URL, {"search": "xyznonexistent"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_search_combined_with_filter(self):
        """Searching 'stewart' within Books returns exactly 1 result."""
        response = self.client.get(
            PRODUCTS_URL,
            {
                "search": "stewart",
                "category": self.cat_libros.id,
            },
        )
        self.assertEqual(response.data["count"], 1)
        self.assertIn("Stewart", response.data["results"][0]["title"])

    def test_search_does_not_return_inactive_products(self):
        """Search also does not return products that are not available."""
        response = self.client.get(PRODUCTS_URL, {"search": "inactivo"})
        self.assertEqual(response.data["count"], 0)


# ─────────────────────────────────────────────────────────────────────────────
# 7. Categories endpoint
# ─────────────────────────────────────────────────────────────────────────────
class CategoryEndpointTests(ProductFilterSetupMixin, APITestCase):
    def test_list_categories(self):
        """Listing categories returns the 3 categories created in setup."""
        response = self.client.get(CATEGORIES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 3)

    def test_category_fields(self):
        """Each category exposes id, name and icon."""
        response = self.client.get(CATEGORIES_URL)
        cat = response.data["results"][0]
        self.assertIn("id", cat)
        self.assertIn("name", cat)
        self.assertIn("icon", cat)

    def test_retrieve_single_category(self):
        """Retrieving a category by ID returns the correct data."""
        url = f"{CATEGORIES_URL}{self.cat_libros.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Libros")

    def test_retrieve_nonexistent_category_returns_404(self):
        """Attempting to retrieve a non-existent category returns 404."""
        url = f"{CATEGORIES_URL}99999/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
