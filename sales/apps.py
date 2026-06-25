"""Configuración de la app sales; registra signals al iniciar Django."""
from django.apps import AppConfig


class SalesConfig(AppConfig):
    """Conecta signals de sales_count al arrancar el servidor."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sales'

    def ready(self):
        """Importa signals para sincronizar contador de ventas en coreografías."""
        import sales.signals  # noqa: F401
