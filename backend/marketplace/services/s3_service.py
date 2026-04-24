import uuid

from django.conf import settings
from google.cloud import storage
from rest_framework.exceptions import ValidationError

_gcs_client = None


def _get_client():
    global _gcs_client
    if _gcs_client is None:
        _gcs_client = storage.Client()
    return _gcs_client


def upload_product_images(product_id: int, files: list) -> list[str]:
    """Upload image files to GCS under products/{product_id}/ and return their URLs."""
    client = _get_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    urls = []
    for file in files:
        extension = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else "jpg"
        key = f"products/{product_id}/{uuid.uuid4().hex}.{extension}"
        try:
            blob = bucket.blob(key)
            blob.upload_from_file(file, content_type=file.content_type)
        except Exception as exc:
            raise ValidationError({"images": f"Error uploading image: {exc}"}) from exc

        urls.append(f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{key}")
    return urls


def upload_profile_picture(user_id: int, file) -> str:
    """Upload a profile picture to GCS and return its public URL."""
    client = _get_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    extension = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else "jpg"
    key = f"profile_pictures/{user_id}/{uuid.uuid4().hex}.{extension}"
    try:
        blob = bucket.blob(key)
        blob.upload_from_file(file, content_type=file.content_type)
    except Exception as exc:
        raise ValidationError({"file": f"Error uploading image: {exc}"}) from exc
    return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{key}"


def get_presigned_url(image_url: str) -> str:
    """Return the image URL (GCS public URLs don't need signing)."""
    return image_url
