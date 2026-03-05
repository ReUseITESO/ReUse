from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # TODO: uncomment when core auth endpoints are implemented
    # path("api/auth/", include("core.urls")),

    # API: Marketplace | api/marketplace/products  api/marketplace/categories
    path("api/marketplace/", include("marketplace.urls")),
    
    # TODO: uncomment when gamification endpoints are implemented
    path("api/gamification/", include("gamification.urls")),

    # API Documentation (Swagger / OpenAPI)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)