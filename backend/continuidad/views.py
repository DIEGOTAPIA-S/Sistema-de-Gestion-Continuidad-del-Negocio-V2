from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Sede, Proceso, Evento
from .serializers import (SedeSerializer, ProcesoSerializer, EventoSerializer, 
                          UserSerializer, UserCreateSerializer, UserUpdateSerializer,
                          CustomTokenObtainPairSerializer)
from .permissions import IsAdminRole, IsAnalistaRole

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API para gestión de usuarios. Solo admins.
    """
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
    """
    API CRUD para Sedes.
    Lectura: Analistas/Admins/Autenticados
    Escritura: Solo Admins
    """
    queryset = Sede.objects.all()
    serializer_class = SedeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

class ProcesoViewSet(viewsets.ModelViewSet):
    """API CRUD para Procesos."""
    queryset = Proceso.objects.all()
    serializer_class = ProcesoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
             return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

class EventoViewSet(viewsets.ModelViewSet):
    """API CRUD para Eventos."""
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    
    def get_permissions(self):
        # Crear: Cualquiera autenticado (Analista/Admin)
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        # Borrar: Solo Admin
        if self.action == 'destroy':
            return [IsAdminRole()]
        # Leer/Editar: Autenticado
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
