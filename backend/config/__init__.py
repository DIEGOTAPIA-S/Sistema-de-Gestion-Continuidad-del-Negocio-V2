# Esto asegurará que la aplicación se cargue siempre que Django se inicie
# para que las tareas compartidas puedan usar esta aplicación.
from .celery import app as celery_app

__all__ = ('celery_app',)
