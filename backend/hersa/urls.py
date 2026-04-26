from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from apps.users.views import ThrottledTokenObtainPairView, ThrottledTokenRefreshView

admin.site.site_header = "Eventos Hersa"
admin.site.site_title = "Eventos Hersa"
admin.site.index_title = "Panel de administración"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", ThrottledTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/token/refresh/", ThrottledTokenRefreshView.as_view(), name="token-refresh"),
    path("api/users/", include("apps.users.urls")),
    path("api/modules/", include("apps.modules.urls")),
]

if settings.DEBUG:
    urlpatterns += [path("silk/", include("silk.urls", namespace="silk"))]
