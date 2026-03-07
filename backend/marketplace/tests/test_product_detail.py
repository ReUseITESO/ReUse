"""
Tests for product detail endpoint and product creation with images.
Covers GET /products/{id}/ returning seller_email and images array,
and POST /products/ creating products with multiple images.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.models.user import User
from marketplace.models.category import Category
from marketplace.models.product import Products
from marketplace.models.images import Images


def make_user(email: str = "test@iteso.mx", first_name: str = "Test", last_name: str = "User") -> User:
    return User.objects.create(
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone="3300000000",
    )


def make_category(name: str = "Test Category", icon: str = "tag") -> Category:
    return Category.objects.create(name=name, icon=icon)


def make_product(
    seller: User,
    category: Category,
    title: str = "Test Product",
    description: str = "Test description",
    condition: str = "buen_estado",
    transaction_type: str = "sale",
    price: str = "100.00",
) -> Products:
    return Products.objects.create(
        seller=seller,
        category=category,
        title=title,
        description=description,
        condition=condition,
        transaction_type=transaction_type,
        status="disponible",
        price=price,
    )


class TestProductDetailEndpoint(APITestCase):
    """Tests for GET /api/marketplace/products/{id}/ endpoint."""

    def setUp(self):
        self.user = make_user(email="seller@iteso.mx", first_name="María", last_name="García")
        self.category = make_category(name="Libros", icon="book")
        self.product = make_product(
            seller=self.user,
            category=self.category,
            title="Cálculo Diferencial",
            description="Libro en buen estado",
            price="350.00",
        )

    def test_get_product_detail_returns_200(self):
        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_product_detail_includes_seller_email(self):
        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        assert "seller_email" in response.data

    def test_product_detail_seller_email_matches_user(self):
        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        assert response.data["seller_email"] == "seller@iteso.mx"

    def test_product_detail_includes_images_array(self):
        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        assert "images" in response.data

    def test_product_detail_images_array_is_list(self):
        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        assert isinstance(response.data["images"], list)

    def test_product_detail_with_no_images_returns_empty_array(self):
        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        assert response.data["images"] == []

    def test_product_detail_with_images_returns_ordered_list(self):
        # Create images with order
        Images.objects.create(
            product=self.product,
            image_url="https://example.com/image1.jpg",
            order_number=0
        )
        Images.objects.create(
            product=self.product,
            image_url="https://example.com/image2.jpg",
            order_number=1
        )

        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        
        assert len(response.data["images"]) == 2

    def test_product_detail_images_have_correct_fields(self):
        Images.objects.create(
            product=self.product,
            image_url="https://example.com/image1.jpg",
            order_number=0
        )

        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        
        image = response.data["images"][0]
        assert "id" in image
        assert "image_url" in image
        assert "order_number" in image

    def test_product_detail_images_ordered_by_order_number(self):
        Images.objects.create(
            product=self.product,
            image_url="https://example.com/image2.jpg",
            order_number=1
        )
        Images.objects.create(
            product=self.product,
            image_url="https://example.com/image1.jpg",
            order_number=0
        )

        url = f"/api/marketplace/products/{self.product.id}/"
        response = self.client.get(url)
        
        assert response.data["images"][0]["order_number"] == 0
        assert response.data["images"][1]["order_number"] == 1

    def test_get_nonexistent_product_returns_404(self):
        url = "/api/marketplace/products/99999/"
        response = self.client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestProductCreationWithImages(APITestCase):
    """Tests for POST /api/marketplace/products/ with images array."""

    def setUp(self):
        self.user = make_user(email="creator@iteso.mx", first_name="Test", last_name="Creator")
        self.category = make_category(name="Electrónica", icon="laptop")
        self.client.force_authenticate(user=self.user)

    def test_create_product_without_images_returns_201(self):
        data = {
            "title": "Laptop HP",
            "description": "Laptop en buen estado",
            "category": self.category.id,
            "condition": "usado",
            "transaction_type": "sale",
            "price": 8500.00,
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_product_with_empty_images_array_returns_201(self):
        data = {
            "title": "Mouse Logitech",
            "description": "Mouse inalámbrico",
            "category": self.category.id,
            "condition": "como_nuevo",
            "transaction_type": "donation",
            "images": [],
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_product_with_single_image_returns_201(self):
        data = {
            "title": "Teclado mecánico",
            "description": "Teclado RGB",
            "category": self.category.id,
            "condition": "nuevo",
            "transaction_type": "sale",
            "price": 1200.00,
            "images": ["https://example.com/keyboard.jpg"],
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_product_with_multiple_images_returns_201(self):
        data = {
            "title": "iPhone 13",
            "description": "iPhone en excelente estado",
            "category": self.category.id,
            "condition": "como_nuevo",
            "transaction_type": "sale",
            "price": 12000.00,
            "images": [
                "https://example.com/iphone1.jpg",
                "https://example.com/iphone2.jpg",
                "https://example.com/iphone3.jpg",
            ],
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_created_product_has_correct_image_count(self):
        data = {
            "title": "MacBook Air",
            "description": "MacBook M1",
            "category": self.category.id,
            "condition": "usado",
            "transaction_type": "sale",
            "price": 15000.00,
            "images": [
                "https://example.com/mac1.jpg",
                "https://example.com/mac2.jpg",
            ],
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        
        product = Products.objects.get(id=response.data["id"])
        assert product.images.count() == 2

    def test_created_images_have_correct_order_numbers(self):
        data = {
            "title": "iPad Pro",
            "description": "iPad con Apple Pencil",
            "category": self.category.id,
            "condition": "buen_estado",
            "transaction_type": "sale",
            "price": 10000.00,
            "images": [
                "https://example.com/ipad1.jpg",
                "https://example.com/ipad2.jpg",
                "https://example.com/ipad3.jpg",
            ],
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        
        product = Products.objects.get(id=response.data["id"])
        images = product.images.all().order_by("order_number")
        
        assert images[0].order_number == 0
        assert images[1].order_number == 1
        assert images[2].order_number == 2

    def test_created_images_have_correct_urls(self):
        image_urls = [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg",
        ]
        data = {
            "title": "Test Product",
            "description": "Test description",
            "category": self.category.id,
            "condition": "nuevo",
            "transaction_type": "sale",
            "price": 500.00,
            "images": image_urls,
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        
        product = Products.objects.get(id=response.data["id"])
        saved_urls = list(product.images.values_list("image_url", flat=True).order_by("order_number"))
        
        assert saved_urls == image_urls

    def test_create_product_with_invalid_image_url_returns_400(self):
        data = {
            "title": "Test Product",
            "description": "Test description",
            "category": self.category.id,
            "condition": "nuevo",
            "transaction_type": "sale",
            "price": 500.00,
            "images": ["not-a-valid-url"],
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_product_without_images_field_succeeds(self):
        data = {
            "title": "Test Product",
            "description": "Test description",
            "category": self.category.id,
            "condition": "nuevo",
            "transaction_type": "sale",
            "price": 500.00,
        }
        response = self.client.post("/api/marketplace/products/", data, format="json")
        
        product = Products.objects.get(id=response.data["id"])
        assert response.status_code == status.HTTP_201_CREATED
        assert product.images.count() == 0
