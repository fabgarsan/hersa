from typing import Any

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .constants import MESSAGES
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer[UserProfile]):
    class Meta:
        model = UserProfile
        fields = ["phone", "department"]


class UserSerializer(serializers.ModelSerializer[User]):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "profile"]
        read_only_fields = ["id", "username"]


class ChangePasswordSerializer(serializers.Serializer[None]):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": MESSAGES["validation"]["PASSWORDS_DO_NOT_MATCH"]}
            )
        try:
            validate_password(attrs["new_password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)}) from exc
        return attrs


class ForgotPasswordSerializer(serializers.Serializer[None]):
    username_or_email = serializers.CharField(max_length=254)


class ResetPasswordSerializer(serializers.Serializer[None]):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": MESSAGES["validation"]["PASSWORDS_DO_NOT_MATCH"]}
            )
        try:
            validate_password(attrs["new_password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)}) from exc
        return attrs
