from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsCommunityMember(BasePermission):
    """
    Permission to check if user is a member of a community.
    Used when accessing community-scoped marketplace items.
    """

    def has_permission(self, request, view):
        # All authenticated users can attempt to view/create
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # If product is not community-scoped, allow access
        if obj.community is None:
            return True

        # For community-scoped items, user must be a member
        is_member = obj.community.memberships.filter(
            user=request.user
        ).exists()

        if request.method in SAFE_METHODS:
            return is_member
        
        # For modifications, user must be member or admin/creator
        if is_member:
            # User is member, check if they're owner or community admin
            membership = obj.community.memberships.filter(
                user=request.user
            ).first()
            is_admin = membership and membership.role in ["admin", "moderator"]
            return obj.seller == request.user or is_admin
        
        return False


class CanPublishToCommunity(BasePermission):
    """
    Permission to check if user can publish an item to a community.
    Used in the create action to validate community_id.
    """

    def has_permission(self, request, view):
        # Only enforce for POST (create) and PATCH (update)
        if request.method not in ("POST", "PATCH"):
            return True

        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Get community_id from request data
        community_id = request.data.get("community")
        
        # If no community specified, it's a public item (allowed for authenticated users)
        if not community_id:
            return True

        # Community ID was specified, verify user is a member
        from social.models import Community
        
        try:
            community = Community.objects.get(id=community_id)
            # Check if user is a member of the community
            is_member = community.memberships.filter(
                user=request.user
            ).exists()
            
            if not is_member:
                return False
                
            return True
        except Community.DoesNotExist:
            # Community doesn't exist
            return False


class IsCommunityAdminForItem(BasePermission):
    """
    Permission for community admins to manage community marketplace items.
    Allows admins to delete items from their community.
    """

    def has_object_permission(self, request, view, obj):
        # Only check for delete operations
        if request.method != "DELETE":
            return True

        # If item is not community-scoped, deny
        if obj.community is None:
            return False

        # Check if user is admin/moderator of the community
        membership = obj.community.memberships.filter(
            user=request.user
        ).first()

        return membership and membership.role in ["admin", "moderator"]
