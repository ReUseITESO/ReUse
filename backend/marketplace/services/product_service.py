from rest_framework import status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

# Gamification imports
from gamification.services.point_service import award_points
from marketplace.models import Transaction

VALID_STATUS_TRANSITIONS = {
    "disponible": ["en_proceso", "pausado", "cancelado"],
    "pausado": ["disponible", "cancelado"],
    "en_proceso": ["disponible", "completado", "cancelado"],
}

ACTIVE_TRANSACTION_STATUSES = ["pendiente", "confirmada"]


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "La operación no puede completarse por conflicto de estado."
    default_code = "conflict"


EDITABLE_FIELDS = [
    "title",
    "description",
    "condition",
    "transaction_type",
    "price",
    "image_url",
    "category",
]


def _check_ownership(product, user):
    if product.seller_id != user.pk:
        raise PermissionDenied("Solo el vendedor puede modificar este producto.")


def _validate_price_rules(transaction_type, price):
    if transaction_type == "donation" and price is not None:
        raise ValidationError({"price": "Las donaciones no deben tener precio."})
    if transaction_type == "sale" and (price is None or price <= 0):
        raise ValidationError({"price": "Las ventas deben tener un precio mayor a 0."})


def update_product(product, validated_data, user):
    _check_ownership(product, user)

    if product.status != "disponible":
        raise ValidationError(
            {"status": "Solo se pueden editar productos con estado disponible."}
        )

    transaction_type = validated_data.get("transaction_type", product.transaction_type)
    price = validated_data.get("price", product.price)

    if "transaction_type" in validated_data or "price" in validated_data:
        _validate_price_rules(transaction_type, price)

    changed_fields = []
    for field in EDITABLE_FIELDS:
        if field in validated_data:
            setattr(product, field, validated_data[field])
            changed_fields.append(field)

    if changed_fields:
        changed_fields.append("updated_at")
        product.save(update_fields=changed_fields)

    return product


def change_product_status(product, new_status, user):
    _check_ownership(product, user)

    if new_status == "pausado":
        has_active_transaction = Transaction.objects.filter(
            product_id=product.pk,
            status__in=ACTIVE_TRANSACTION_STATUSES,
        ).exists()
        if has_active_transaction:
            raise ConflictError(
                "No se puede pausar un producto con una transacción activa."
            )

    product.refresh_from_db()

    allowed = VALID_STATUS_TRANSITIONS.get(product.status, [])
    if new_status not in allowed:
        raise ValidationError(
            {
                "status": (
                    f"No se puede cambiar de '{product.status}' " f"a '{new_status}'."
                )
            }
        )

    product.status = new_status
    product.save(update_fields=["status", "updated_at"])

    # === GAMIFICATION: Award points for completing a sale/donation/swap ===

    if new_status == "completado":
        action_map = {
            "donation": "complete_donation",
            "sale": "complete_sale",
            "swap": "complete_exchange",
        }
        action = action_map.get(product.transaction_type)
        if action:
            award_points(user=product.seller, action=action, reference_id=product.id)

    # ==========================================================================

    return product


def delete_product(product, user):
    _check_ownership(product, user)

    if product.status != "disponible":
        raise ValidationError(
            {"status": ("Solo se pueden eliminar productos con estado disponible.")}
        )

    product.delete()
