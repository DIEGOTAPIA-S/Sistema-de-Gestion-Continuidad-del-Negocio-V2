from django.contrib import admin
from .models import Sede, Proceso, Evento


class ProcesoInline(admin.TabularInline):
    """Muestra procesos dentro del formulario de Sede."""
    model = Proceso
    extra = 1


@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ciudad', 'direccion', 'activa']
    list_filter = ['ciudad', 'activa']
    search_fields = ['nombre', 'direccion']
    inlines = [ProcesoInline]


@admin.register(Proceso)
class ProcesoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'sede', 'criticidad', 'rto', 'rpo']
    list_filter = ['criticidad', 'sede']
    search_fields = ['nombre']


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['tipo', 'nivel_alerta', 'fecha']
    list_filter = ['nivel_alerta', 'tipo']
    filter_horizontal = ['sedes_afectadas']
