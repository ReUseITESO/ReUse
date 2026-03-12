from django.urls import include, path
from rest_framework.routers import DefaultRouter

from social.views import CommunityViewSet, FrequentContactViewSet, UserConnectionViewSet

router = DefaultRouter()
router.register("connections", UserConnectionViewSet, basename="social-connections")
router.register("frequent-contacts", FrequentContactViewSet, basename="social-frequent-contacts")
router.register("communities", CommunityViewSet, basename="social-communities")

urlpatterns = [
    path("", include(router.urls)),
]
