from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsCommunityAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        membership = obj.memberships.filter(
            user=request.user,
            role__in=["admin", "moderator"],
        ).first()
        return membership is not None
