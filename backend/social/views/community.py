from django.db.models import Count
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from social.models import Community
from social.permissions import IsCommunityAdminOrReadOnly
from social.serializers import (
    CommunityCreateSerializer,
    CommunityDetailSerializer,
    CommunityListSerializer,
    CommunityUpdateSerializer,
)
from social.services import (
    create_community_with_creator,
    join_community,
    leave_community,
    update_community,
)


@extend_schema_view(
    list=extend_schema(
        summary="List active communities", tags=["Social > Communities"]
    ),
    retrieve=extend_schema(
        summary="Retrieve a community", tags=["Social > Communities"]
    ),
    create=extend_schema(summary="Create a community", tags=["Social > Communities"]),
    partial_update=extend_schema(
        summary="Update a community", tags=["Social > Communities"]
    ),
)
class CommunityViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Community.objects.select_related("creator")
        .prefetch_related("memberships__user")
        .annotate(members_count=Count("memberships"))
    )
    permission_classes = [IsAuthenticated, IsCommunityAdminOrReadOnly]

    def get_queryset(self):
        queryset = self.queryset.filter(is_active=True)
        visibility = self.request.query_params.get("visibility")
        if visibility == "private":
            queryset = queryset.filter(is_private=True)
        elif visibility == "public":
            queryset = queryset.filter(is_private=False)
        
        # Filter for only communities the user is a member of
        scope = self.request.query_params.get("scope")
        if scope == "joined" and self.request.user.is_authenticated:
            queryset = queryset.filter(
                memberships__user=self.request.user
            ).distinct()
        
        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return CommunityCreateSerializer
        if self.action == "retrieve":
            return CommunityDetailSerializer
        if self.action == "partial_update":
            return CommunityUpdateSerializer
        return CommunityListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        community = create_community_with_creator(
            creator=request.user,
            validated_data=serializer.validated_data,
        )
        response_serializer = CommunityDetailSerializer(community)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        community = self.get_object()
        serializer = self.get_serializer(community, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_community = update_community(
            community=community,
            validated_data=serializer.validated_data,
            user=request.user,
        )
        response_serializer = CommunityDetailSerializer(updated_community)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(summary="Join a public community", tags=["Social > Communities"])
    @action(
        detail=True,
        methods=["post"],
        url_path="join",
        permission_classes=[IsAuthenticated],
    )
    def join(self, request, pk=None):
        community = self.get_object()
        membership = join_community(community, request.user)
        return Response(
            {
                "message": "Community joined successfully.",
                "membership_id": membership.id,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(summary="Leave a community", tags=["Social > Communities"])
    @action(
        detail=True,
        methods=["post"],
        url_path="leave",
        permission_classes=[IsAuthenticated],
    )
    def leave(self, request, pk=None):
        community = self.get_object()
        leave_community(community, request.user)
        return Response(
            {"message": "Community left successfully."}, status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="List community marketplace items",
        description="Returns paginated list of products published in this community. Members can view, non-members get 403.",
        tags=["Social > Communities > Marketplace"],
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="products",
        permission_classes=[IsAuthenticated],
    )
    def products(self, request, pk=None):
        from django.core.paginator import Paginator, EmptyPage
        from marketplace.models import Products
        from marketplace.serializers import ProductListSerializer

        community = self.get_object()

        # Check if user is a member
        is_member = community.memberships.filter(user=request.user).exists()
        if not is_member:
            return Response(
                {"detail": "You must be a member of this community to view its marketplace items."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get community items
        products = Products.objects.filter(
            community=community, status="disponible"
        ).select_related("seller", "category").prefetch_related("images").order_by("-created_at")

        # Apply pagination
        page = request.query_params.get("page", 1)
        paginator = Paginator(products, 20)  # 20 items per page
        try:
            paginated_products = paginator.page(page)
        except EmptyPage:
            paginated_products = paginator.page(1)

        serializer = ProductListSerializer(paginated_products, many=True)
        return Response(
            {
                "count": paginator.count,
                "pages": paginator.num_pages,
                "current_page": paginated_products.number,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Remove product from community",
        description="Community admin or moderator can remove a product from the community marketplace.",
        tags=["Social > Communities > Marketplace"],
    )
    @action(
        detail=True,
        methods=["delete"],
        url_path="products/(?P<product_id>\\d+)",
        permission_classes=[IsAuthenticated],
    )
    def remove_product(self, request, pk=None, product_id=None):
        from marketplace.models import Products

        community = self.get_object()

        # Check if user is community admin/moderator
        membership = community.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ["admin", "moderator"]:
            return Response(
                {"detail": "Only community admins or moderators can remove items."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            product = Products.objects.get(id=product_id, community=community)
        except Products.DoesNotExist:
            return Response(
                {"detail": "Product not found in this community."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Delete the product
        product_title = product.title
        product.delete()

        return Response(
            {"detail": f"Product '{product_title}' has been removed from the community."},
            status=status.HTTP_204_NO_CONTENT,
        )
