import os
from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        """
        Called once when Django finishes loading.
        We start the APScheduler background thread here so it runs inside
        the Django process — no Celery worker needed.

        The RUN_MAIN guard prevents the scheduler from starting twice when
        Django's auto-reloader spawns a child process.
        """
        # Only start in the child reloader process (or in production)
        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('DJANGO_SETTINGS_MODULE'):
            from api.scheduler import start
            start()
        elif not os.environ.get('RUN_MAIN'):
            # Production / gunicorn — always start
            from api.scheduler import start
            start()
