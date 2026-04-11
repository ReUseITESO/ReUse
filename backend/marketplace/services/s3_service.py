import time
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from rest_framework.exceptions import ValidationError

_s3_client = None
_presigned_cache: dict[str, tuple[str, float]] = {}
_PRESIGNED_EXPIRATION = 3600
_CACHE_TTL = 3000  # refresh 10 min before expiry


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


def get_presigned_url(image_url: str) -> str:
    """Return a cached presigned URL for a stored S3 image URL."""
    prefix = (
        f"https://{settings.AWS_STORAGE_BUCKET_NAME}"
        f".s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/"
    )
    if not image_url or not image_url.startswith(prefix):
        return image_url
    key = image_url[len(prefix) :]

    cached = _presigned_cache.get(key)
    if cached and cached[1] > time.monotonic():
        return cached[0]

    client = _get_s3_client()
    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": key},
            ExpiresIn=_PRESIGNED_EXPIRATION,
        )
        _presigned_cache[key] = (url, time.monotonic() + _CACHE_TTL)
        return url
    except (BotoCoreError, ClientError):
        return image_url
