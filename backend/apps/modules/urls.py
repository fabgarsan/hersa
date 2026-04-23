from django.urls import path

from .views import MyModulePermissionsView

urlpatterns = [
    path("my-permissions/", MyModulePermissionsView.as_view(), name="my-module-permissions"),
]
