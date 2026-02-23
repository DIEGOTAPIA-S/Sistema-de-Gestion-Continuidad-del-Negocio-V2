from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.mail import send_mail
from axes.signals import user_locked_out
from django.conf import settings

@receiver(user_locked_out)
def notify_locked_out_user(sender, request, username, ip_address, **kwargs):
    """
    Notifica a los administradores cuando una cuenta es bloqueada por fuerza bruta.
    """
    subject = f'⚠️ ALERTA DE SEGURIDAD: Cuenta Bloqueda ({username})'
    message = f'La cuenta "{username}" ha sido bloqueada tras 5 intentos fallidos.\n\n' \
              f'Detalles:\n' \
              f'- Usuario: {username}\n' \
              f'- Dirección IP: {ip_address}\n' \
              f'- Acción: El acceso ha sido restringido por 24 horas.\n\n' \
              f'Este es un mensaje automático del Sistema de Gestión de Continuidad.'
    
    # Enviar a los administradores (podríamos filtrar por emails específicos)
    admin_emails = [u.email for u in User.objects.filter(is_superuser=True) if u.email]
    
    if admin_emails:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            admin_emails,
            fail_silently=True,
        )

@receiver(post_save, sender=User)
def notify_new_admin(sender, instance, created, **kwargs):
    """
    Notifica cuando se crea un nuevo usuario administrador o superusuario.
    """
    if created and (instance.is_staff or instance.is_superuser):
        subject = '🔐 NUEVO ADMINISTRADOR CREADO'
        message = f'Se ha registrado un nuevo usuario con privilegios administrativos.\n\n' \
                  f'Detalles:\n' \
                  f'- Usuario: {instance.username}\n' \
                  f'- Email: {instance.email or "No proporcionado"}\n' \
                  f'- Rol: {"Superusuario" if instance.is_superuser else "Staff"}\n\n' \
                  f'Si usted no autorizó esta creación, revise el panel de administración de inmediato.'
        
        admin_emails = [u.email for u in User.objects.filter(is_superuser=True) if u.email and u.id != instance.id]
        
        if admin_emails:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                fail_silently=True,
            )
