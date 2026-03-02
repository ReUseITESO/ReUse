from rest_framework.exceptions import ValidationError

from marketplace.models import Images
from marketplace.services.s3_service import upload_product_images


MAX_IMAGES_PER_PRODUCT = 5
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


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
