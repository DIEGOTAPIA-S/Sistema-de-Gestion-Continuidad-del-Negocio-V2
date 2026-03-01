from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT que lee el token desde una cookie httpOnly
    en lugar del encabezado 'Authorization: Bearer ...'.

    ¿Por qué cookies httpOnly?
    - Las cookies httpOnly NO son accesibles por JavaScript
    - Esto elimina el riesgo de robo de tokens por ataques XSS
    - El navegador las envía automáticamente en cada petición

    Fallback: si no hay cookie, intenta el header Bearer normal
    (para compatibilidad con Postman, scripts, etc.)
    """

    def authenticate(self, request):
        # 1. Intentar leer el token desde la cookie httpOnly
        access_token = request.COOKIES.get('access_token')

        if access_token:
            try:
                validated_token = self.get_validated_token(access_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except (InvalidToken, TokenError):
                # Token expirado o inválido — dejar pasar para que falle normalmente
                pass

        # 2. Fallback: leer del header Authorization: Bearer <token>
        # Esto permite que clientes como Postman sigan funcionando
        return super().authenticate(request)
