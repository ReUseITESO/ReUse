from django.db import IntegrityError
from django.db import transaction
from django.db.models import CharField, Count, OuterRef, Q, Subquery, Value
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from marketplace.models import ProductReaction, Products
from marketplace.permissions import CanPublishToCommunity, IsCommunityMember
from marketplace.serializers import (
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductReactionRequestSerializer,
    ProductReactionSummarySerializer,
    ProductStatusSerializer,
    ProductUpdateSerializer,
    ReportCreateSerializer,
)
from marketplace.services import (
    attach_images_to_product,
    change_product_status,
    delete_product,
    get_product_reaction_summary,
    remove_product_reaction,
    update_product,
    upsert_product_reaction,
)


@extend_schema_view(
    list=extend_schema(
        summary="List available products",
        description=(
            "Returns a paginated list of products with status **disponible**. <br>"
            "Supports filtering by category, condition, and transaction type via query params. <br>"
            "Results can be searched by **title**, **description**, or **category** name,"
            "and ordered by created_at, price, or title. <br><br>"
            "Use `?seller=me` to list all products "
            "owned by the authenticated user (any status). Requires JWT authentication. <br><br>"
            "Use `?community={id}` to filter by community (requires membership). "
            "Use `?scope=communities` to list all items from your joined communities."
        ),
        parameters=[
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by category ID.",
                required=False,
            ),
            OpenApiParameter(
                name="condition",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by product condition. Options: `nuevo`, `como_nuevo`, `buen_estado`, `usado`.",
                required=False,
                enum=["nuevo", "como_nuevo", "buen_estado", "usado"],
            ),
            OpenApiParameter(
                name="transaction_type",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by transaction type. Options: `donation`, `sale`, `swap`.",
                required=False,
                enum=["donation", "sale", "swap"],
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search products by title, description, or category name.",
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order results. Options: `created_at`, `-created_at`, `price`, `-price`, `title`, `-title`, `-likes_count`.",
                required=False,
            ),
            OpenApiParameter(
                name="seller",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Use `me` to list the authenticated user's own products (all statuses).",
                required=False,
                enum=["me"],
            ),
            OpenApiParameter(
                name="community",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by community ID (requires membership to view community items).",
                required=False,
            ),
            OpenApiParameter(
                name="scope",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Use `communities` to show all items from your joined communities.",
                required=False,
                enum=["communities"],
            ),
        ],
        tags=["Marketplace > Products"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a product",
        description="Returns the full detail of a single product by its ID.",
        tags=["Marketplace > Products"],
    ),
    create=extend_schema(
        summary="Publish a product",
        description=(
            "Creates a new product listing for the authenticated user. <br>"
            "Requires JWT authentication. <br>"
            "Optionally set `community_id` to publish to a specific community (must be a member)."
        ),
        tags=["Marketplace > Products"],
    ),
    partial_update=extend_schema(
        summary="Update a product",
        description=(
            "Partially updates a product owned by the authenticated user. <br>"
            "Only products with status **disponible** can be edited. <br>"
            "Requires JWT authentication."
        ),
        tags=["Marketplace > Products"],
    ),
    destroy=extend_schema(
        summary="Delete a product",
        description=(
            "Permanently deletes a product owned by the authenticated user. <br>"
            "Only products with status **disponible** can be deleted. <br>"
            "Requires JWT authentication."
        ),
        tags=["Marketplace > Products"],
    ),
)
class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for marketplace products CRUD operations."""

    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title", "likes_count"]
    ordering = ["-created_at"]
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        CanPublishToCommunity,
        IsCommunityMember,
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        if self.action == "partial_update":
            return ProductUpdateSerializer
        if self.action == "change_status":
            return ProductStatusSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Products.objects.select_related(
            "category", "seller", "transaction", "community"
        ).prefetch_related("images")

        queryset = queryset.annotate(
            likes_count=Count("reactions", filter=Q(reactions__type="like")),
            dislikes_count=Count("reactions", filter=Q(reactions__type="dislike")),
        )

        if self.request.user.is_authenticated:
            user_reaction = ProductReaction.objects.filter(
                product=OuterRef("pk"),
                user=self.request.user,
            ).values("type")[:1]
            queryset = queryset.annotate(user_reaction=Subquery(user_reaction))
        else:
            queryset = queryset.annotate(
                user_reaction=Value(None, output_field=CharField())
            )

        seller_param = self.request.query_params.get("seller")
        is_my_products = seller_param == "me"

        community_id = self.request.query_params.get("community")
        scope = self.request.query_params.get("scope")
        is_community_scope = scope == "communities"

        if self.action in ("list", "retrieve"):
            if is_my_products:
                if self.request.user.is_authenticated:
                    queryset = queryset.filter(seller=self.request.user)
                else:
                    return Products.objects.none()
            elif community_id:
                # Filter by specific community (requires membership)
                queryset = queryset.filter(
                    community_id=community_id, status="disponible"
                )
            elif is_community_scope:
                # Show items from all user's communities
                if self.request.user.is_authenticated:
                    user_communities = (
                        self.request.user.community_memberships.values_list(
                            "community_id", flat=True
                        )
                    )
                    queryset = queryset.filter(
                        community_id__in=user_communities, status="disponible"
                    )
                else:
                    return Products.objects.none()
            else:
                # Default: show only public items (no community constraint) with active sellers
                queryset = queryset.filter(
                    community__isnull=True, status="disponible", seller__is_active=True
                )

        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        condition = self.request.query_params.get("condition")
        if condition:
            queryset = queryset.filter(condition=condition)

        transaction_type = self.request.query_params.get("transaction_type")
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        return queryset

    def create(self, request, *args, **kwargs):
        # Double-check: user must be authenticated
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required to publish items."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Validate community membership if community_id provided
        community = serializer.validated_data.get("community")
        if community:
            is_member = community.memberships.filter(user=request.user).exists()
            if not is_member:
                return Response(
                    {
                        "detail": f"You must be a member of '{community.name}' community to publish items to it."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        with transaction.atomic():
            serializer.save(seller=request.user)
            images = request.FILES.getlist("images")
            if images:
                attach_images_to_product(serializer.instance, images)

        response_serializer = ProductListSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_product = update_product(
            product, serializer.validated_data, request.user
        )

        response_serializer = ProductListSerializer(
            updated_product,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        delete_product(product, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Change product status",
        description=(
            "Changes the status of a product owned by the authenticated user. <br>"
            "Valid transitions: `disponible` → `en_proceso` | `pausado` | `cancelado`, "
            "`pausado` → `disponible` | `cancelado`, "
            "`en_proceso` → `disponible` | `completado` | `cancelado`. <br>"
            "A product cannot be paused when it has an active transaction (`pendiente` or `confirmada`). <br>"
            "Requires JWT authentication."
        ),
        request=ProductStatusSerializer,
        responses={200: ProductListSerializer},
        tags=["Marketplace > Products"],
    )
    @action(detail=True, methods=["patch"], url_path="status")
    def change_status(self, request, pk=None):
        product = self.get_object()
        serializer = ProductStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_product = change_product_status(
            product, serializer.validated_data["status"], request.user
        )

        response_serializer = ProductListSerializer(
            updated_product,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create or toggle product reaction",
        description=(
            "Creates, switches or toggles the authenticated user's reaction. <br>"
            "- If reaction does not exist, it is created. <br>"
            "- If same type already exists, it is removed (toggle). <br>"
            "- If opposite type exists, it is switched. <br>"
            "Only products with status `disponible` or `en_proceso` accept reactions."
        ),
        request=ProductReactionRequestSerializer,
        responses={200: ProductReactionSummarySerializer},
        tags=["Marketplace > Products"],
    )
    @action(detail=True, methods=["post"], url_path="reactions")
    def reactions(self, request, pk=None):
        product = self.get_object()
        serializer = ProductReactionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        upsert_product_reaction(
            product=product,
            user=request.user,
            reaction_type=serializer.validated_data["type"],
        )

        summary = get_product_reaction_summary(product=product, user=request.user)
        return Response(summary, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Remove product reaction",
        description=(
            "Removes the authenticated user's active reaction from a product. <br>"
            "Only products with status `disponible` or `en_proceso` accept this operation."
        ),
        responses={200: ProductReactionSummarySerializer},
        tags=["Marketplace > Products"],
    )
    @reactions.mapping.delete
    def delete_reaction(self, request, pk=None):
        product = self.get_object()
        remove_product_reaction(product=product, user=request.user)

        summary = get_product_reaction_summary(product=product, user=request.user)
        return Response(summary, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Report a product",
        description=(
            "Submits a report on a product. <br>"
            "A user cannot report their own product. <br>"
            "Each user can only submit one report per product. <br>"
            "Requires JWT authentication."
        ),
        request=ReportCreateSerializer,
        responses={201: None},
        tags=["Marketplace > Products"],
    )
    @action(
        detail=True,
        methods=["post"],
        url_path="report",
        permission_classes=[IsAuthenticated],
    )
    def report(self, request, pk=None):
        product = self.get_object()

        if product.seller_id == request.user.id:
            return Response(
                {"detail": "No puedes reportar tu propio producto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            serializer.save(product=product, reporter=request.user)
        except IntegrityError:
            return Response(
                {"detail": "Ya reportaste este producto anteriormente."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "Reporte enviado correctamente."}, status=status.HTTP_201_CREATED)


@extend_schema_view(
    list=extend_schema(
        summary="List community marketplace items",
        description=(
            "Returns a paginated list of products from all communities the authenticated user is a member of. <br>"
            "Requires JWT authentication. <br>"
            "Supports filtering by community, category, condition and transaction type."
        ),
        parameters=[
            OpenApiParameter(
                name="community",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by specific community ID.",
                required=False,
            ),
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by category ID.",
                required=False,
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search by title, description, or category name.",
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order results. Options: `created_at`, `-created_at`, `price`, `-price`, `title`, `-title`.",
                required=False,
            ),
        ],
        tags=["Marketplace > Community Items"],
    ),
)
class CommunityMarketplaceViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for browsing community marketplace items."""

    http_method_names = ["get", "head", "options"]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Use default pagination

    def get_serializer_class(self):
        return ProductListSerializer

    def get_queryset(self):
        # Get all communities user is a member of
        user_communities = self.request.user.community_memberships.values_list(
            "community_id", flat=True
        )

        queryset = (
            Products.objects.filter(
                community_id__in=user_communities,
                status="disponible",
            )
            .select_related("category", "seller", "community")
            .prefetch_related("images")
        )

        queryset = queryset.annotate(
            likes_count=Count("reactions", filter=Q(reactions__type="like")),
            dislikes_count=Count("reactions", filter=Q(reactions__type="dislike")),
        )

        # Add user reaction annotation
        user_reaction = ProductReaction.objects.filter(
            product=OuterRef("pk"),
            user=self.request.user,
        ).values("type")[:1]
        queryset = queryset.annotate(user_reaction=Subquery(user_reaction))

        # Apply filters
        community_id = self.request.query_params.get("community")
        if community_id:
            queryset = queryset.filter(community_id=community_id)

        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        condition = self.request.query_params.get("condition")
        if condition:
            queryset = queryset.filter(condition=condition)

        transaction_type = self.request.query_params.get("transaction_type")
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        return queryset
