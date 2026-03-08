import os
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from continuidad.views import CustomTokenObtainPairView

# La URL del admin se lee del .env para que no sea predecible en producción
# Ejemplo en .env: ADMIN_URL=gestion-interna-sgcn/
# Si no se define, usa 'admin/' como fallback (solo en desarrollo)
ADMIN_URL = os.environ.get('ADMIN_URL', 'admin/')


def health_check(request):
    """Endpoint de salud: TI lo usa para saber si el servidor está respondiendo."""
    return JsonResponse({'status': 'ok', 'service': 'SGCN Backend'})


urlpatterns = [
    path(ADMIN_URL, admin.site.urls),
    path('api/', include('continuidad.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('health/', health_check, name='health_check'),  # Sin autenticación
]
