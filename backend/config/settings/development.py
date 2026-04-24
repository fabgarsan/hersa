from decouple import config

from .base import *

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="hersa"),
        "USER": config("DB_USER", default="hersa"),
        "PASSWORD": config("DB_PASSWORD", default="hersa"),
        "HOST": config("DB_HOST", default="db"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# --- Silk (dev-only API profiling) ---
INSTALLED_APPS += ["silk"]
MIDDLEWARE = ["silk.middleware.SilkyMiddleware"] + MIDDLEWARE

SILKY_AUTHENTICATION = True   # require login to view /silk/
SILKY_AUTHORISATION = True    # require is_staff
SILKY_MAX_RECORDED_REQUESTS = 500
SILKY_MAX_RECORDED_REQUESTS_CHECK_PERCENT = 25
SILKY_PYTHON_PROFILER = True
