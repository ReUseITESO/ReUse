from rest_framework import serializers

from gamification.models.point_rule import PointAction
from gamification.models.point_transaction import PointTransaction
from marketplace.models.product import Products
from marketplace.models.transaction import Transaction


class PointHistorySerializer(serializers.ModelSerializer):
    action_display = serializers.SerializerMethodField()
    reference_type = serializers.SerializerMethodField()
    reference_label = serializers.SerializerMethodField()

    class Meta:
        model = PointTransaction
        fields = [
            "id",
            "action",
            "action_display",
            "points",
            "reference_id",
            "reference_type",
            "reference_label",
            "created_at",
        ]

    def get_action_display(self, obj):
        action_labels = dict(PointAction.choices)
        if obj.action in action_labels:
            return action_labels[obj.action]
        if obj.action == "points_deduction":
            return "Deduccion de puntos"
        return obj.action

    def get_reference_type(self, obj):
        reference = self._resolve_reference(obj)
        if reference:
            return reference["type"]
        return None

    def get_reference_label(self, obj):
        reference = self._resolve_reference(obj)
        if reference:
            return reference["label"]
        if obj.reference_id:
            return f"Referencia #{obj.reference_id}"
        return None

    def _resolve_reference(self, obj):
        if not obj.reference_id:
            return None

        action = obj.action
        reference_id = obj.reference_id

        if action == PointAction.PUBLISH_ITEM:
            product = Products.objects.filter(id=reference_id).only("id", "title").first()
            if product:
                return {
                    "type": "product",
                    "label": f"Producto: {product.title}",
                }

        if action in {
            PointAction.COMPLETE_DONATION,
            PointAction.COMPLETE_SALE,
            PointAction.COMPLETE_EXCHANGE,
            PointAction.RECEIVE_POSITIVE_REVIEW,
        }:
            transaction = (
                Transaction.objects.filter(id=reference_id)
                .select_related("product")
                .only("id", "product__title")
                .first()
            )
            if transaction:
                return {
                    "type": "transaction",
                    "label": f"Transaccion #{transaction.id} - {transaction.product.title}",
                }

        # Fallback: attempt to resolve either entity for legacy data.
        product = Products.objects.filter(id=reference_id).only("id", "title").first()
        if product:
            return {
                "type": "product",
                "label": f"Producto: {product.title}",
            }

        transaction = (
            Transaction.objects.filter(id=reference_id)
            .select_related("product")
            .only("id", "product__title")
            .first()
        )
        if transaction:
            return {
                "type": "transaction",
                "label": f"Transaccion #{transaction.id} - {transaction.product.title}",
            }

        return None