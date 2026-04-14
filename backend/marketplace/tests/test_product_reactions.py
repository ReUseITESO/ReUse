from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, ProductReaction, Products


class ProductReactionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create(
            email="owner@iteso.mx",
            first_name="Owner",
            last_name="User",
            phone="3300000001",
        )
        self.reactor = User.objects.create(
            email="reactor@iteso.mx",
            first_name="Reactor",
            last_name="User",
            phone="3300000002",
        )
        self.other = User.objects.create(
            email="other@iteso.mx",
            first_name="Other",
            last_name="User",
            phone="3300000003",
        )
        self.category = Category.objects.create(name="Libros", icon="book")
        self.product = Products.objects.create(
            seller=self.owner,
            category=self.category,
            title="Libro de Calculo",
            description="Usado en buen estado",
            condition="buen_estado",
            transaction_type="sale",
            status="disponible",
            price="100.00",
        )

    def _reaction_url(self, product_id=None):
        target_id = product_id or self.product.id
        return f"/api/marketplace/products/{target_id}/reactions/"

    def _detail_url(self, product_id=None):
        target_id = product_id or self.product.id
        return f"/api/marketplace/products/{target_id}/"

    def test_like_product_creates_reaction(self):
        self.client.force_authenticate(user=self.reactor)

        response = self.client.post(
            self._reaction_url(),
            {"type": "like"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 1)
        self.assertEqual(response.data["dislikes_count"], 0)
        self.assertEqual(response.data["user_reaction"], "like")
        self.assertTrue(
            ProductReaction.objects.filter(
                product=self.product,
                user=self.reactor,
                type="like",
            ).exists()
        )

    def test_dislike_product_creates_reaction(self):
        self.client.force_authenticate(user=self.reactor)

        response = self.client.post(
            self._reaction_url(),
            {"type": "dislike"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 0)
        self.assertEqual(response.data["dislikes_count"], 1)
        self.assertEqual(response.data["user_reaction"], "dislike")

    def test_post_same_reaction_toggles_off(self):
        ProductReaction.objects.create(
            product=self.product,
            user=self.reactor,
            type="like",
        )
        self.client.force_authenticate(user=self.reactor)

        response = self.client.post(
            self._reaction_url(),
            {"type": "like"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 0)
        self.assertEqual(response.data["dislikes_count"], 0)
        self.assertIsNone(response.data["user_reaction"])
        self.assertFalse(
            ProductReaction.objects.filter(
                product=self.product, user=self.reactor
            ).exists()
        )

    def test_post_opposite_reaction_switches_type(self):
        ProductReaction.objects.create(
            product=self.product,
            user=self.reactor,
            type="like",
        )
        self.client.force_authenticate(user=self.reactor)

        response = self.client.post(
            self._reaction_url(),
            {"type": "dislike"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 0)
        self.assertEqual(response.data["dislikes_count"], 1)
        self.assertEqual(response.data["user_reaction"], "dislike")
        self.assertEqual(
            ProductReaction.objects.get(product=self.product, user=self.reactor).type,
            "dislike",
        )

    def test_delete_removes_current_reaction(self):
        ProductReaction.objects.create(
            product=self.product,
            user=self.reactor,
            type="like",
        )
        self.client.force_authenticate(user=self.reactor)

        response = self.client.delete(self._reaction_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 0)
        self.assertEqual(response.data["dislikes_count"], 0)
        self.assertIsNone(response.data["user_reaction"])

    def test_react_without_auth_returns_401(self):
        response = self.client.post(
            self._reaction_url(),
            {"type": "like"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_react_to_nonexistent_product_returns_404(self):
        self.client.force_authenticate(user=self.reactor)

        response = self.client.post(
            self._reaction_url(product_id=99999),
            {"type": "like"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_cannot_react_to_own_product(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            self._reaction_url(),
            {"type": "like"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reaction_not_allowed_for_paused_product(self):
        self.product.status = "pausado"
        self.product.save(update_fields=["status", "updated_at"])
        self.client.force_authenticate(user=self.reactor)

        response = self.client.post(
            self._reaction_url(),
            {"type": "like"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_and_detail_include_counts_and_user_reaction(self):
        ProductReaction.objects.create(
            product=self.product,
            user=self.reactor,
            type="like",
        )
        ProductReaction.objects.create(
            product=self.product,
            user=self.other,
            type="dislike",
        )

        self.client.force_authenticate(user=self.reactor)
        list_response = self.client.get("/api/marketplace/products/")
        detail_response = self.client.get(self._detail_url())

        listed = list_response.data["results"][0]
        self.assertEqual(listed["likes_count"], 1)
        self.assertEqual(listed["dislikes_count"], 1)
        self.assertEqual(listed["user_reaction"], "like")

        self.assertEqual(detail_response.data["likes_count"], 1)
        self.assertEqual(detail_response.data["dislikes_count"], 1)
        self.assertEqual(detail_response.data["user_reaction"], "like")

    def test_anonymous_user_gets_null_user_reaction(self):
        ProductReaction.objects.create(
            product=self.product,
            user=self.reactor,
            type="like",
        )

        response = self.client.get(self._detail_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 1)
        self.assertEqual(response.data["dislikes_count"], 0)
        self.assertIsNone(response.data["user_reaction"])
