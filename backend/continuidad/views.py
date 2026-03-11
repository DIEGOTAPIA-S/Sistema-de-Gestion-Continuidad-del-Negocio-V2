from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils.html import strip_tags
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Sede, Proceso, Evento, Colaborador, EntidadApoyo
from .serializers import (SedeSerializer, ProcesoSerializer, EventoSerializer,
                          UserSerializer, UserCreateSerializer, UserUpdateSerializer,
                          CustomTokenObtainPairSerializer, ColaboradorSerializer,
                          EntidadApoyoSerializer)
from .permissions import IsAdminRole, IsAnalistaRole
from axes.models import AccessAttempt
from urllib.parse import quote
import pandas as pd
import feedparser
import json
import uuid
from django_otp import user_has_device
from django.core.cache import cache

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return super().post(request, *args, **kwargs)

        user = serializer.user

        # Si tiene 2FA, no entregamos tokens aún — solo el pre_auth_id
        if user_has_device(user):
            pre_auth_id = str(uuid.uuid4())
            cache.set(f'pre_auth_{pre_auth_id}', user.id, timeout=300)
            return Response({
                'two_factor_required': True,
                'pre_auth_id': pre_auth_id,
                'username': user.username
            }, status=status.HTTP_200_OK)

        # Login sin 2FA: obtenemos los tokens y los seteamos en cookies httpOnly
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token  = response.data.get('access')
            refresh_token = response.data.get('refresh')
            self._set_auth_cookies(response, access_token, refresh_token)
            
            # ELIMINAR tokens del JSON para evitar que se guarden en localStorage
            del response.data['access']
            del response.data['refresh']

        return response

    @staticmethod
    def _set_auth_cookies(response, access_token, refresh_token):
        """
        Guarda los tokens en cookies httpOnly.
        httpOnly = JavaScript NO puede leerlas → protege contra XSS.
        samesite='Lax' → protección básica contra CSRF.
        secure = True automáticamente en producción (requiere HTTPS).
        """
        from django.conf import settings as django_settings
        is_secure = not django_settings.DEBUG  # True en producción (HTTPS), False en local

        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=is_secure,    # HTTPS obligatorio en producción
            samesite='Lax',
            max_age=3600,        # 1 hora
            path='/',
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=is_secure,    # HTTPS obligatorio en producción
            samesite='Lax',
            max_age=86400,       # 24 horas
            path='/',
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Cierra sesión borrando las cookies y añadiendo el refresh token a la lista negra.
    """
    response = Response({'detail': 'Sesión cerrada correctamente.'}, status=status.HTTP_200_OK)
    
    # 1. Intentar invalidar el refresh token en el servidor (Blacklist)
    refresh_token = request.COOKIES.get('refresh_token')
    if refresh_token:
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass # Si falla (por expirado), igual seguimos con el borrado de cookies

    # 2. Borrar cookies del navegador
    response.delete_cookie('access_token',  path='/')
    response.delete_cookie('refresh_token', path='/')
    return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(password)
        user.save()
        return Response({'status': 'password set'})

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

class SedeViewSet(viewsets.ModelViewSet):
    queryset = Sede.objects.all()
    serializer_class = SedeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

class ProcesoViewSet(viewsets.ModelViewSet):
    queryset = Proceso.objects.all()
    serializer_class = ProcesoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
             return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        if self.action in ['destroy', 'delete_all']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['DELETE'], permission_classes=[IsAdminRole])
    def delete_all(self, request):
        """
        Elimina TODA la base de datos de eventos (Historial).
        Solo permitido para Administradores.
        """
        count, _ = Evento.objects.all().delete()
        return Response({'status': 'success', 'deleted': count, 'message': f'Se eliminaron {count} registros correctamente.'})

class ColaboradorViewSet(viewsets.ModelViewSet):
    """
    API CRUD para Colaboradores y Carga Masiva.
    """
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['POST'], permission_classes=[IsAdminRole])
    def upload_excel(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Fix #10: limitar tamaño del archivo para proteger el servidor
        MAX_SIZE_MB = 10
        if file.size > MAX_SIZE_MB * 1024 * 1024:
            return Response(
                {'error': f'Archivo demasiado grande. Máximo permitido: {MAX_SIZE_MB}MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar extensión del archivo
        if not file.name.lower().endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Solo se permiten archivos Excel (.xlsx o .xls)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            df = pd.read_excel(file)
            
            # Chequeo flexible de columnas (minimo requerido)
            required_cols = ['Identificacion', 'Nombres', 'Apellidos']
            missing = [col for col in required_cols if col not in df.columns]
            
            if missing:
                return Response({'error': f'Missing columns: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

            # -- Detección de cédulas duplicadas DENTRO del mismo archivo --
            cedulas_en_archivo = df['Identificacion'].astype(str).str.strip()
            duplicados_en_archivo = cedulas_en_archivo[cedulas_en_archivo.duplicated()].unique().tolist()

            # -- Cédulas que YA EXISTEN en la base de datos --
            cedulas_set = set(cedulas_en_archivo.tolist())
            cedulas_existentes = list(
                Colaborador.objects.filter(identificacion__in=cedulas_set)
                .values_list('identificacion', flat=True)
            )

            created_count = 0
            updated_count = 0
            errors = []

            for index, row in df.iterrows():
                try:
                    cedula = str(row['Identificacion']).strip()
                    
                    # Normalizar campos opcionales
                    defaults = {
                        'nombres': row['Nombres'],
                        'apellidos': row['Apellidos'],
                        'cargo': row.get('Cargo', ''),
                        'area': row.get('Area', ''),
                        'gerencia': row.get('Gerencia', ''),
                        'modalidad': row.get('Modalidad', 'Presencial'),
                        'direccion': row.get('Direccion', ''),
                        'telefono': str(row.get('Telefono', '')).replace('.0', ''),
                        'email': row.get('Email', ''),
                        'compania': row.get('Compañia', ''),
                        # Nuevos campos de contacto de emergencia
                        'contacto_emergencia_nombre': row.get('ContactoEmergencia_Nombre', ''),
                        'contacto_emergencia_telefono': str(row.get('ContactoEmergencia_Telefono', '')).replace('.0', ''),
                        'latitud': row.get('latitud') if pd.notna(row.get('latitud')) else None,
                        'longitud': row.get('longitud') if pd.notna(row.get('longitud')) else None,
                    }

                    # Campo activo (si viene en el Excel, lo procesa)
                    if 'Activo' in row and pd.notna(row.get('Activo')):
                        valor_activo = str(row.get('Activo', 'Si')).strip().lower()
                        defaults['activo'] = valor_activo not in ('no', 'false', '0', 'n')

                    # Enlazar con Sede si existe
                    sede_nombre = row.get('Sede_Asignada')
                    if sede_nombre and pd.notna(sede_nombre):
                        sede_obj = Sede.objects.filter(nombre__icontains=str(sede_nombre)).first()
                        if sede_obj:
                            defaults['sede_asignada'] = sede_obj

                    obj, created = Colaborador.objects.update_or_create(
                        identificacion=cedula,
                        defaults=defaults
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                except Exception as e:
                    errors.append(f"Row {index}: {str(e)}")

            return Response({
                'status': 'success',
                'created': created_count,
                'updated': updated_count,
                'duplicados_en_archivo': duplicados_en_archivo,       # Cédulas repetidas en el Excel
                'cedulas_ya_existentes': cedulas_existentes,           # Cédulas que ya estaban en BD
                'advertencia': (
                    f"Se encontraron {len(duplicados_en_archivo)} cédulas duplicadas en el archivo."
                    if duplicados_en_archivo else None
                ),
                'errors': errors[:20]
            })

        except Exception as e:
            return Response({'error': f"Error processing file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['DELETE'], permission_classes=[IsAdminRole])
    def delete_all(self, request):
        """
        Elimina TODA la base de datos de colaboradores.
        Solo permitido para Administradores.
        """
        count, _ = Colaborador.objects.all().delete()
        return Response({'message': f'Se eliminaron {count} colaboradores correctamente.'})


class EntidadApoyoViewSet(viewsets.ModelViewSet):
    queryset = EntidadApoyo.objects.all()
    serializer_class = EntidadApoyoSerializer

    def get_queryset(self):
        queryset = EntidadApoyo.objects.all()
        # Filtrado por tipo
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        # Filtrado por BBOX (lat_min, lon_min, lat_max, lon_max) para optimizar el mapa
        lat_min = self.request.query_params.get('lat_min')
        lat_max = self.request.query_params.get('lat_max')
        lon_min = self.request.query_params.get('lon_min')
        lon_max = self.request.query_params.get('lon_max')

        if all([lat_min, lat_max, lon_min, lon_max]):
            queryset = queryset.filter(
                latitud__gte=lat_min,
                latitud__lte=lat_max,
                longitud__gte=lon_min,
                longitud__lte=lon_max
            )
            
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['DELETE'], permission_classes=[permissions.IsAdminUser])
    def delete_all(self, request):
        """Elimina TODA la base de datos de infraestructura oficial."""
        count, _ = EntidadApoyo.objects.all().delete()
        return Response({'message': f'Se eliminaron {count} registros oficiales correctamente.'})
        return Response({'status': 'success', 'deleted': count, 'message': f'Se eliminaron {count} registros correctamente.'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_news(request):
    query = request.GET.get('q', 'Colombia Movilidad')
    encoded_query = quote(query)
    
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=es-419&gl=CO&ceid=CO:es-419"
    
    feed = feedparser.parse(rss_url)
    
    news_items = []
    for entry in feed.entries[:20]:
        summary = entry.summary if 'summary' in entry else ''
        clean_summary = strip_tags(summary)[:200] + '...' if len(summary) > 200 else strip_tags(summary)

        news_items.append({
            'title': entry.title,
            'link': entry.link,
            'published': entry.published,
            'source': entry.source.title if 'source' in entry else 'Google News',
            'summary': clean_summary
        })
        
    return Response(news_items)

from rest_framework_simplejwt.views import TokenRefreshView
class CustomTokenRefreshView(TokenRefreshView):
    """
    Refresca el token de acceso leyendo el refresh_token desde la cookie.
    También implementa la rotación de tokens seteando la nueva cookie.
    """
    def post(self, request, *args, **kwargs):
        # 1. Extraer refresh token de la cookie si no viene en el body
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token and not request.data.get('refresh'):
            # Inyectar en data para que el serializador estándar lo encuentre
            request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh') # Nuevo token si hay rotación
            
            # 2. Seteamos las nuevas cookies
            CustomTokenObtainPairView._set_auth_cookies(response, access_token, refresh_token)
            
            # 3. ELIMINAR tokens del JSON
            del response.data['access']
            if 'refresh' in response.data:
                del response.data['refresh']
                
        return response
