import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from continuidad.models import UserProfile

try:
    user = User.objects.get(username="admin")
    # Asegurar que tenga perfil
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    # Forzar rol admin
    if profile.role != 'admin':
        profile.role = 'admin'
        profile.save()
        print("✅ Rol de 'admin' actualizado correctamente a 'admin'.")
    else:
        print("ℹ️ El usuario 'admin' ya tiene el rol correcto.")

except Exception as e:
    print(f"❌ Error: {e}")
