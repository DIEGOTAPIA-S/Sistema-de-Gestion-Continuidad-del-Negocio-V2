import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

try:
    if not User.objects.filter(username='soporte').exists():
        User.objects.create_superuser('soporte', 'soporte@example.com', 'soporte123')
        print("Superuser 'soporte' created with password 'soporte123'")
    else:
        u = User.objects.get(username='soporte')
        u.set_password('soporte123')
        u.is_active = True
        u.is_staff = True
        u.is_superuser = True
        u.save()
        print("User 'soporte' reset to 'soporte123' and reactivated")
except Exception as e:
    print(f"Error: {e}")
