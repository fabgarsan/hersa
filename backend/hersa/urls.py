from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.permissions import IsAdminUser

from apps.users.views import ThrottledTokenObtainPairView, ThrottledTokenRefreshView

admin.site.site_header = "Eventos Hersa"
admin.site.site_title = "Eventos Hersa"
admin.site.index_title = "Panel de administración"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", ThrottledTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/token/refresh/", ThrottledTokenRefreshView.as_view(), name="token-refresh"),
    path("api/users/", include("apps.users.urls", namespace="users")),
    path("api/modules/", include("apps.modules.urls", namespace="modules")),
    # API documentation — restricted to admin users only
    path("api/schema/", SpectacularAPIView.as_view(permission_classes=[IsAdminUser]), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema", permission_classes=[IsAdminUser]), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema", permission_classes=[IsAdminUser]), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += [path("silk/", include("silk.urls", namespace="silk"))]
