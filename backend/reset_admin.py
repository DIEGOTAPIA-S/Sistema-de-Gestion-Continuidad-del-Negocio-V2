import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

try:
    if User.objects.filter(username='admin').exists():
        u = User.objects.get(username='admin')
        u.set_password('admin123')
        u.save()
        print("Password for 'admin' reset to 'admin123'")
    else:
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Superuser 'admin' created with password 'admin123'")
except Exception as e:
    print(f"Error: {e}")
