from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from decouple import UndefinedValueError, config


class Command(BaseCommand):
    help = "Creates the initial superuser from env vars if no superuser exists yet."

    def handle(self, *args: object, **options: object) -> None:
        User = get_user_model()

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write("Superuser already exists — skipping.")
            return

        try:
            email: str = config("DJANGO_SUPERUSER_EMAIL")
            password: str = config("DJANGO_SUPERUSER_PASSWORD")
            username: str = config("DJANGO_SUPERUSER_USERNAME", default=email)
        except UndefinedValueError as e:
            self.stderr.write(f"Skipping superuser creation: {e} is not set.")
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully."))
