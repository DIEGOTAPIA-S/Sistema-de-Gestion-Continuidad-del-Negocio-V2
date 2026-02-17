from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Sede(models.Model):
    """Sede / Sucursal de la organización."""
    nombre = models.CharField(max_length=200)
    ciudad = models.CharField(max_length=100, default='Bogotá')
    direccion = models.CharField(max_length=300)
    latitud = models.FloatField()
    longitud = models.FloatField()
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']
        verbose_name_plural = 'Sedes'

    def __str__(self):
        return f"{self.nombre} ({self.ciudad})"


class Proceso(models.Model):
    """Proceso de negocio asociado a una sede."""
    nombre = models.CharField(max_length=200)
    criticidad = models.CharField(max_length=50, default='Normal')
    rto = models.IntegerField(help_text='Recovery Time Objective (horas)')
    rpo = models.IntegerField(help_text='Recovery Point Objective (horas)')
    sede = models.ForeignKey(Sede, on_delete=models.CASCADE, related_name='procesos')

    class Meta:
        ordering = ['rto']
        verbose_name_plural = 'Procesos'

    def __str__(self):
        return f"{self.nombre} - {self.sede.nombre}"

class Colaborador(models.Model):
    """Colaborador de la organización con ubicación (residencia/trabajo)."""
    MODALIDAD_CHOICES = [
        ('Presencial', 'Presencial'),
        ('Remoto', 'Remoto'),
        ('Hibrido', 'Híbrido'),
    ]

    nombres = models.CharField(max_length=150)
    apellidos = models.CharField(max_length=150)
    identificacion = models.CharField(max_length=50, unique=True, help_text='Cédula o ID único')
    
    cargo = models.CharField(max_length=150, blank=True)
    gerencia = models.CharField(max_length=150, blank=True)
    area = models.CharField(max_length=150, blank=True)
    
    sede_asignada = models.ForeignKey(Sede, on_delete=models.SET_NULL, null=True, blank=True, related_name='colaboradores')
    modalidad = models.CharField(max_length=20, choices=MODALIDAD_CHOICES, default='Presencial')
    
    direccion = models.CharField(max_length=300, blank=True, help_text='Dirección de residencia')
    telefono = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=150, blank=True)
    compania = models.CharField(max_length=100, blank=True, help_text='Empresa a la que pertenece')
    
    latitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    class Meta:
        ordering = ['apellidos', 'nombres']
        verbose_name_plural = 'Colaboradores'

    def __str__(self):
        return f"{self.nombres} {self.apellidos} ({self.cargo})"


class Evento(models.Model):
    """Evento / Incidente registrado."""
    NIVEL_CHOICES = [
        ('verde', 'Verde'),
        ('amarillo', 'Amarillo'),
        ('naranja', 'Naranja'),
        ('rojo', 'Rojo'),
    ]

    tipo = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    nivel_alerta = models.CharField(max_length=20, choices=NIVEL_CHOICES, default='verde')
    geometria = models.TextField(blank=True, help_text='GeoJSON de la zona afectada')
    sedes_afectadas = models.ManyToManyField(Sede, blank=True, related_name='eventos')
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='eventos_creados')

    class Meta:
        ordering = ['-fecha']
        verbose_name_plural = 'Eventos'

    def __str__(self):
        return f"{self.tipo} - {self.fecha.strftime('%Y-%m-%d')}"


class UserProfile(models.Model):
    """Perfil de usuario extendido con rol."""
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('analista', 'Analista'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='analista')

    def __str__(self):
        return f"{self.user.username} - {self.role}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
