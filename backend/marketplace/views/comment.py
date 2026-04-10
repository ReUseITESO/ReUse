from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Comment
from marketplace.serializers import CommentCreateSerializer, CommentSerializer
from marketplace.services import (
    create_comment,
    delete_comment,
    get_commentable_product,
)


@extend_schema_view(
    list=extend_schema(
        summary="List comments for a product",
        description=(
            "Returns a paginated list of public comments on a product, "
            "ordered chronologically. Accessible to all users (no auth required)."
        ),
        tags=["Marketplace > Comments"],
    ),
    create=extend_schema(
        summary="Post a comment on a product",
        description=(
            "Creates a new public comment on a published product. "
            "Requires JWT authentication."
        ),
        tags=["Marketplace > Comments"],
    ),
    destroy=extend_schema(
        summary="Delete a comment",
        description=(
            "Deletes a comment. Only the comment author or the product owner "
            "can delete a comment. Requires JWT authentication."
        ),
        tags=["Marketplace > Comments"],
    ),
)
class CommentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for public comments on marketplace products."""

    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_permissions(self):
        if self.action == "list":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return CommentCreateSerializer
        return CommentSerializer

    def get_queryset(self):
        product_pk = self.kwargs["product_pk"]
        return (
            Comment.objects.filter(product_id=product_pk)
            .select_related("author")
            .order_by("created_at")
        )

    def create(self, request, product_pk=None):
        product = get_commentable_product(product_pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = create_comment(
            product, request.user, serializer.validated_data["content"]
        )
        response_serializer = CommentSerializer(
            comment, context=self.get_serializer_context()
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, product_pk=None, pk=None):
        try:
            comment = Comment.objects.select_related("product").get(
                pk=pk, product_id=product_pk
            )
        except Comment.DoesNotExist:
            # Fix B904: Usamos 'from None' para limpiar el encadenamiento
            raise NotFound("Comentario no encontrado.") from None
            
        delete_comment(comment, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)