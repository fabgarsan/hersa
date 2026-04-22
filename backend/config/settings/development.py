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
