from rest_framework import serializers
from .models import Sede, Proceso, Evento, UserProfile
from .models import Sede, Proceso, Evento, UserProfile
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



class ProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proceso
        fields = ['id', 'nombre', 'criticidad', 'rto', 'rpo', 'sede']


class SedeSerializer(serializers.ModelSerializer):
    procesos = ProcesoSerializer(many=True, read_only=True)
    eventos = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Sede
        fields = ['id', 'nombre', 'ciudad', 'direccion', 'latitud', 'longitud', 'activa', 'procesos', 'eventos']


class EventoSerializer(serializers.ModelSerializer):
    sedes_afectadas = SedeSerializer(many=True, read_only=True)
    sedes_afectadas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Sede.objects.all(), many=True, write_only=True, source='sedes_afectadas', required=False
    )
    creado_por = serializers.CharField(source='creado_por.get_full_name', read_only=True, default='')

    class Meta:
        model = Evento
        fields = ['id', 'tipo', 'descripcion', 'fecha', 'nivel_alerta', 'geometria', 'sedes_afectadas', 'sedes_afectadas_ids', 'creado_por']



class UserSerializer(serializers.ModelSerializer):
    """Serializador para ver usuarios."""
    role = serializers.CharField(source='profile.role', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom claims
        data['role'] = self.user.profile.role if hasattr(self.user, 'profile') else 'analista'
        data['full_name'] = f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        data['user_id'] = self.user.id
        return data


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear usuarios (con rol)."""
    role = serializers.CharField(write_only=True, required=False, default='analista')
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'analista')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name', '')
        
        # Split full_name
        first_name, last_name = '', ''
        if full_name:
            parts = full_name.split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]
            validated_data['first_name'] = first_name
            validated_data['last_name'] = last_name
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        if hasattr(user, 'profile'):
            user.profile.role = role
            user.profile.save()
            
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializador para actualizar usuarios."""
    role = serializers.CharField(source='profile.role', required=False)
    full_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'role']

    def update(self, instance, validated_data):
        role = validated_data.pop('profile', {}).get('role')
        if 'role' in validated_data:
             role = validated_data.pop('role')
             
        if 'full_name' in validated_data:
            full_name = validated_data.pop('full_name')
            parts = full_name.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile
        if role and hasattr(instance, 'profile'):
            instance.profile.role = role
            instance.profile.save()

        return instance
