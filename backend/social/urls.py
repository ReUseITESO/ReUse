from django.urls import include, path
from rest_framework.routers import DefaultRouter

from social.views import CommunityViewSet, FrequentContactViewSet, UserConnectionViewSet,CommunityPostViewSet

router = DefaultRouter()
router.register("connections", UserConnectionViewSet, basename="social-connections")
router.register("frequent-contacts", FrequentContactViewSet, basename="social-frequent-contacts")
router.register("communities", CommunityViewSet, basename="social-communities")
router.register("posts", CommunityPostViewSet, basename="social-posts")

urlpatterns = [
    path("", include(router.urls)),
]
