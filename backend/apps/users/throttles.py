from rest_framework.throttling import AnonRateThrottle


class AuthTokenThrottle(AnonRateThrottle):
    scope: str = "auth"


class PasswordResetThrottle(AnonRateThrottle):
    scope: str = "password_reset"
