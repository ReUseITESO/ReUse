from rest_framework.exceptions import PermissionDenied, ValidationError

from marketplace.models import Images, Products
from marketplace.services.s3_service import upload_product_images


MAX_IMAGES_PER_PRODUCT = 5
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

VALID_STATUS_TRANSITIONS = {
    "disponible": ["en_proceso", "cancelado"],
    "en_proceso": ["disponible", "completado", "cancelado"],
}

EDITABLE_FIELDS = [
    "title",
    "description",
    "condition",
    "transaction_type",
    "price",
    "category",
]


def attach_images_to_product(product, files: list) -> None:
    """Validate files, upload to S3, and create Images records for a product."""
    if len(files) > MAX_IMAGES_PER_PRODUCT:
        raise ValidationError(
            {"images": f"A product can have at most {MAX_IMAGES_PER_PRODUCT} images."}
        )

    for file in files:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise ValidationError(
                {"images": f"Unsupported type: {file.content_type}. Use JPEG, PNG or WebP."}
            )

    urls = upload_product_images(product.id, files)

    Images.objects.bulk_create([
        Images(product=product, image_url=url, order_number=index)
        for index, url in enumerate(urls)
    ])


def _check_ownership(product, user):
    if product.seller_id != user.pk:
        raise PermissionDenied(
            "Solo el vendedor puede modificar este producto."
        )


def _validate_price_rules(transaction_type, price):
    if transaction_type == "donation" and price is not None:
        raise ValidationError(
            {"price": "Las donaciones no deben tener precio."}
        )
    if transaction_type == "sale" and (price is None or price <= 0):
        raise ValidationError(
            {"price": "Las ventas deben tener un precio mayor a 0."}
        )


def update_product(product, validated_data, user):
    _check_ownership(product, user)

    if product.status != "disponible":
        raise ValidationError(
            {"status": "Solo se pueden editar productos con estado disponible."}
        )

    transaction_type = validated_data.get(
        "transaction_type", product.transaction_type
    )
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

    allowed = VALID_STATUS_TRANSITIONS.get(product.status, [])
    if new_status not in allowed:
        raise ValidationError(
            {
                "status": (
                    f"No se puede cambiar de '{product.status}' "
                    f"a '{new_status}'."
                )
            }
        )

    product.status = new_status
    product.save(update_fields=["status", "updated_at"])
    return product


def delete_product(product, user):
    _check_ownership(product, user)

    if product.status != "disponible":
        raise ValidationError(
            {
                "status": (
                    "Solo se pueden eliminar productos con estado disponible."
                )
            }
        )

    product.delete()
