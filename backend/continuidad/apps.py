from django.apps import AppConfig


class ContinuidadConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'continuidad'

    def ready(self):
        from auditlog.registry import auditlog
        from .models import Sede, Proceso, Colaborador, Evento
        auditlog.register(Sede)
        auditlog.register(Proceso)
        auditlog.register(Colaborador)
        auditlog.register(Evento)
