from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .constants import MESSAGES
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)

_token_generator = PasswordResetTokenGenerator()


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request) -> Response:
        assert isinstance(request.user, User)
        if not request.user.is_active:
            return Response(
                {"detail": MESSAGES["forbidden"]["INACTIVE_ACCOUNT"]},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"current_password": MESSAGES["validation"]["WRONG_CURRENT_PASSWORD"]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": MESSAGES["success"]["PASSWORD_CHANGED"]})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username_or_email: str = serializer.validated_data["username_or_email"]

        user: User | None = (
            User.objects.filter(username=username_or_email).first()
            or User.objects.filter(email=username_or_email).first()
        )

        if user and user.is_active and user.email:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = _token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject="Solicitud de restablecimiento de contraseña — HERSA",
                message=(
                    f"Hola {user.get_full_name() or user.username},\n\n"
                    f"Haz clic en el enlace a continuación para restablecer tu contraseña:\n{reset_link}\n\n"
                    "Este enlace expira una vez que lo uses. Si no solicitaste un restablecimiento, "
                    "ignora este correo."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response({"detail": MESSAGES["success"]["PASSWORD_RESET_EMAIL_SENT"]})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid_b64: str = serializer.validated_data["uid"]
        token: str = serializer.validated_data["token"]

        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": MESSAGES["not_found"]["INVALID_RESET_LINK"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": MESSAGES["forbidden"]["INACTIVE_ACCOUNT"]},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not _token_generator.check_token(user, token):
            return Response(
                {"detail": MESSAGES["not_found"]["INVALID_OR_EXPIRED_RESET_LINK"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": MESSAGES["success"]["PASSWORD_RESET"]})
