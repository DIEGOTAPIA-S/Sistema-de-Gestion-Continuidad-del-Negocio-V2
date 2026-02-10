from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Permiso personalizado para usuarios con rol 'admin'.
    """
    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado y tiene un perfil con rol 'admin'
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == 'admin'

class IsAnalistaRole(permissions.BasePermission):
    """
    Permiso personalizado para usuarios con rol 'analista' o superior.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin también debería tener permiso de analista (jerarquía implícita)
        # O definimos estricto? Asumamos que admin puede hacer todo lo de analista.
        role = getattr(request.user, 'profile', None) and request.user.profile.role
        return role in ['admin', 'analista']
