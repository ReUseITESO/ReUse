from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Comment, Products


def _comments_url(product_id):
    return f"/api/marketplace/products/{product_id}/comments/"


def _comment_detail_url(product_id, comment_id):
    return f"/api/marketplace/products/{product_id}/comments/{comment_id}/"


class CommentListCreateTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create(
            email="seller@iteso.mx",
            first_name="Ana",
            last_name="Seller",
            phone="3311111111",
        )
        self.buyer = User.objects.create(
            email="buyer@iteso.mx",
            first_name="Luis",
            last_name="Buyer",
            phone="3322222222",
        )
        self.other = User.objects.create(
            email="other@iteso.mx",
            first_name="Mia",
            last_name="Other",
            phone="3333333333",
        )
        self.category = Category.objects.create(name="Libros")
        self.product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Libro de Cálculo",
            description="Sin notas al margen.",
            condition="buen_estado",
            transaction_type="sale",
            status="disponible",
            price="150.00",
        )
        self.url = _comments_url(self.product.pk)

    # --- List ---

    def test_list_returns_200_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_is_paginated(self):
        response = self.client.get(self.url)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)

    def test_list_empty_returns_zero_count(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_list_returns_comments_in_chronological_order(self):
        Comment.objects.create(
            product=self.product, author=self.buyer, content="Primero"
        )
        Comment.objects.create(
            product=self.product, author=self.other, content="Segundo"
        )
        response = self.client.get(self.url)
        contents = [c["content"] for c in response.data["results"]]
        self.assertEqual(contents, ["Primero", "Segundo"])

    def test_list_returns_comment_fields(self):
        Comment.objects.create(product=self.product, author=self.buyer, content="Hola")
        response = self.client.get(self.url)
        comment = response.data["results"][0]
        self.assertIn("id", comment)
        self.assertIn("author", comment)
        self.assertIn("content", comment)
        self.assertIn("created_at", comment)
        self.assertIn("name", comment["author"])
        self.assertIn("avatar", comment["author"])

    def test_list_on_nonexistent_product_returns_empty(self):
        response = self.client.get(_comments_url(99999))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    # --- Create ---

    def test_create_unauthenticated_returns_401(self):
        response = self.client.post(self.url, {"content": "Hola"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_authenticated_returns_201(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(self.url, {"content": "Hola!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_returns_comment_fields(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(self.url, {"content": "Hola!"}, format="json")
        self.assertIn("id", response.data)
        self.assertIn("author", response.data)
        self.assertIn("content", response.data)
        self.assertIn("created_at", response.data)

    def test_create_links_author(self):
        self.client.force_authenticate(user=self.buyer)
        self.client.post(self.url, {"content": "¿Todavía disponible?"}, format="json")
        comment = Comment.objects.get(product=self.product)
        self.assertEqual(comment.author, self.buyer)

    def test_create_empty_content_returns_400(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(self.url, {"content": "   "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_missing_content_returns_400(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_content_exceeding_500_chars_returns_400(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(self.url, {"content": "x" * 501}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_on_nonexistent_product_returns_404(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(
            _comments_url(99999), {"content": "Hola"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_on_non_available_product_returns_404(self):
        self.product.status = "completado"
        self.product.save()
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(self.url, {"content": "Hola"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_comment_appears_in_list(self):
        self.client.force_authenticate(user=self.buyer)
        self.client.post(self.url, {"content": "Nuevo comentario"}, format="json")
        response = self.client.get(self.url)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["content"], "Nuevo comentario")


class CommentDeleteTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create(
            email="seller2@iteso.mx",
            first_name="Ana",
            last_name="Seller",
            phone="3311111112",
        )
        self.buyer = User.objects.create(
            email="buyer2@iteso.mx",
            first_name="Luis",
            last_name="Buyer",
            phone="3322222223",
        )
        self.other = User.objects.create(
            email="other2@iteso.mx",
            first_name="Mia",
            last_name="Other",
            phone="3333333334",
        )
        self.category = Category.objects.create(name="Electrónica")
        self.product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Laptop",
            description="En buen estado.",
            condition="buen_estado",
            transaction_type="sale",
            status="disponible",
            price="5000.00",
        )
        self.comment = Comment.objects.create(
            product=self.product, author=self.buyer, content="¿Funciona bien?"
        )
        self.url = _comment_detail_url(self.product.pk, self.comment.pk)

    def test_delete_unauthenticated_returns_401(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_author_can_delete_own_comment(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(pk=self.comment.pk).exists())

    def test_product_owner_can_delete_any_comment(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(pk=self.comment.pk).exists())

    def test_non_owner_non_author_returns_403(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_nonexistent_comment_returns_404(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.delete(_comment_detail_url(self.product.pk, 99999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_comment_wrong_product_returns_404(self):
        other_product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Otro producto",
            description="Descripción.",
            condition="usado",
            transaction_type="sale",
            status="disponible",
            price="100.00",
        )
        self.client.force_authenticate(user=self.buyer)
        response = self.client.delete(
            _comment_detail_url(other_product.pk, self.comment.pk)
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
