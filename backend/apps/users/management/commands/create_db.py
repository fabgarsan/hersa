import psycopg2
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Creates the PostgreSQL database if it does not exist."

    def handle(self, *args: object, **options: object) -> None:
        db = settings.DATABASES["default"]

        conn = psycopg2.connect(
            dbname="postgres",
            user=db["USER"],
            password=db["PASSWORD"],
            host=db["HOST"],
            port=db["PORT"],
        )
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", [db["NAME"]])
        if cursor.fetchone():
            self.stdout.write(f"Database '{db['NAME']}' already exists.")
        else:
            cursor.execute(f'CREATE DATABASE "{db["NAME"]}"')
            self.stdout.write(self.style.SUCCESS(f"Database '{db['NAME']}' created."))

        cursor.close()
        conn.close()
