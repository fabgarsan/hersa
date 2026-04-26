from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthTokenThrottle(AnonRateThrottle):
    scope: str = "auth"


class PasswordResetThrottle(AnonRateThrottle):
    scope: str = "password_reset"


class ChangePasswordThrottle(UserRateThrottle):
    scope: str = "change_password"
