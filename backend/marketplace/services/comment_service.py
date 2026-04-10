from rest_framework.exceptions import NotFound, PermissionDenied

from marketplace.models import Comment, Products


ALLOWED_COMMENT_STATUSES = {"disponible", "en_proceso"}


def get_commentable_product(product_id: int) -> Products:
    try:
        product = Products.objects.get(pk=product_id)
    except Products.DoesNotExist as err:
        # Agregamos 'from err' o 'from None' para cumplir con B904
        raise NotFound("Producto no encontrado.") from err

    if product.status not in ALLOWED_COMMENT_STATUSES:
        raise NotFound("Producto no encontrado.")
    return product


def create_comment(product: Products, author, content: str) -> Comment:
    return Comment.objects.create(product=product, author=author, content=content)


def delete_comment(comment: Comment, requesting_user) -> None:
    is_author = comment.author_id == requesting_user.pk
    is_product_owner = comment.product.seller_id == requesting_user.pk
    if not (is_author or is_product_owner):
        raise PermissionDenied("No tienes permiso para eliminar este comentario.")
    comment.delete()