from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view

from marketplace.serializers.transaction import TransactionSerializer

TRANSACTION_VIEWSET_SCHEMA = extend_schema_view(
    list=extend_schema(
        summary="List my transactions",
        description=(
            "Returns transactions where the authenticated user participates as"
            " buyer or seller. Supports filtering by `role` and `status`."
        ),
        parameters=[
            OpenApiParameter(
                name="role",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["buyer", "seller"],
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["pendiente", "confirmada", "completada", "cancelada"],
            ),
        ],
        tags=["Marketplace > Transactions"],
    ),
    retrieve=extend_schema(
        summary="Get transaction detail",
        tags=["Marketplace > Transactions"],
    ),
    create=extend_schema(
        summary="Create transaction request",
        tags=["Marketplace > Transactions"],
    ),
)

CHANGE_STATUS_SCHEMA = extend_schema(
    summary="Change transaction status",
    description=(
        "Single status endpoint for transaction actions.\n"
        "- `confirmada`: accept request (seller only).\n"
        "- `cancelada`: cancel active request (buyer or seller).\n"
        "- `completada`: actor confirms delivery; transaction is marked"
        " completed only after both parties confirm."
    ),
    responses={200: TransactionSerializer},
    tags=["Marketplace > Transactions"],
)
