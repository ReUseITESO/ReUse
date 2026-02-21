from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    # path('api/auth/', include('core.urls')),

    # API: Marketplace | api/marketplace/products  api/marketplace/categories
    path("api/marketplace/", include("marketplace.urls")),

    # path('api/gamification/', include('gamification.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)