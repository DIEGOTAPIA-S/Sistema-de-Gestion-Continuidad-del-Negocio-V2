from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Sede, Proceso, Evento, Colaborador
from .serializers import (SedeSerializer, ProcesoSerializer, EventoSerializer, 
                          UserSerializer, UserCreateSerializer, UserUpdateSerializer,
                          CustomTokenObtainPairSerializer, ColaboradorSerializer)
from .permissions import IsAdminRole, IsAnalistaRole
import pandas as pd
import json

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
        if self.action == 'destroy':
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

class ColaboradorViewSet(viewsets.ModelViewSet):
    """
    API CRUD para Colaboradores y Carga Masiva.
    """
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['POST'])
    def upload_excel(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file)
            
            # Chequeo flexible de columnas (minimo requerido)
            required_cols = ['Identificacion', 'Nombres', 'Apellidos']
            missing = [col for col in required_cols if col not in df.columns]
            
            if missing:
                return Response({'error': f'Missing columns: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

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
                        'telefono': str(row.get('Telefono', '')).replace('.0', ''), # Excel floating point fix
                        'email': row.get('Email', ''),
                        'compania': row.get('Compañia', ''),
                        'latitud': row.get('latitud') if pd.notna(row.get('latitud')) else None,
                        'longitud': row.get('longitud') if pd.notna(row.get('longitud')) else None,
                    }

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
                'errors': errors[:20] 
            })

        except Exception as e:
            return Response({'error': f"Error processing file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.decorators import api_view, permission_classes
import feedparser

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_news(request):
    query = request.GET.get('q', 'Colombia Movilidad')
    from urllib.parse import quote
    encoded_query = quote(query)
    
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=es-419&gl=CO&ceid=CO:es-419"
    
    feed = feedparser.parse(rss_url)
    
    news_items = []
    for entry in feed.entries[:20]:
        summary = entry.summary if 'summary' in entry else ''
        from django.utils.html import strip_tags
        clean_summary = strip_tags(summary)[:200] + '...' if len(summary) > 200 else strip_tags(summary)

        news_items.append({
            'title': entry.title,
            'link': entry.link,
            'published': entry.published,
            'source': entry.source.title if 'source' in entry else 'Google News',
            'summary': clean_summary
        })
        
    return Response(news_items)
