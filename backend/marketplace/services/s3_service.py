import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from rest_framework.exceptions import ValidationError

_s3_client = None


def _get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
    return _s3_client


def upload_product_images(product_id: int, files: list) -> list[str]:
    """Upload image files to S3 under products/{product_id}/ and return their URLs."""
    client = _get_s3_client()
    urls = []
    for file in files:
        extension = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else "jpg"
        key = f"products/{product_id}/{uuid.uuid4().hex}.{extension}"
        try:
            client.upload_fileobj(
                file,
                settings.AWS_STORAGE_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": file.content_type},
            )
        except (BotoCoreError, ClientError) as exc:
            raise ValidationError({"images": f"Error uploading image: {exc}"}) from exc

        urls.append(
            f"https://{settings.AWS_STORAGE_BUCKET_NAME}"
            f".s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{key}"
        )
    return urls
