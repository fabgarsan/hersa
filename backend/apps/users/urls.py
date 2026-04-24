from django.urls import path

from .views import (
    ChangePasswordView,
    ForgotPasswordView,
    MeView,
    MyPermissionsView,
    ResetPasswordView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
    path("my-permissions/", MyPermissionsView.as_view(), name="user-my-permissions"),
    path("change-password/", ChangePasswordView.as_view(), name="user-change-password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="user-forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="user-reset-password"),
]
