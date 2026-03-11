from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_static.models import StaticDevice
from django_otp import devices_for_user, user_has_device
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from smtplib import SMTPException
import pyotp
import qrcode
import io
import base64
import random
from django.core.cache import cache
import uuid

class TwoFactorStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        has_2fa = user_has_device(request.user)
        return Response({'has_2fa': has_2fa})

class TwoFactorSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        # Obtener dispositivo no confirmado existente o crear uno nuevo
        device, created = TOTPDevice.objects.get_or_create(
            user=user, 
            confirmed=False, 
            defaults={'name': "Microsoft Authenticator"}
        )
        
        # Si ya existía uno confirmado, este proceso lo reemplazará al final
        # Pero por ahora mantenemos el 'unconfirmed' estable para evitar pifias al recargar
        
        secret = base64.b32encode(device.bin_key).decode().replace('=', '')
        
        # Generar URI para QR
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(name=user.username, issuer_name="SG Continuidad")
        
        # Generar imagen QR en base64
        img = qrcode.make(provisioning_uri)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return Response({
            'secret': secret,
            'qr_code': f"data:image/png;base64,{img_str}",
            'provisioning_uri': provisioning_uri
        })

class TwoFactorConfirmView(APIView):
    """
    Confirma la configuración inicial del 2FA.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        user = request.user
        device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
        
        if not device:
            return Response({'error': 'No profile in setup'}, status=status.HTTP_400_BAD_REQUEST)
        
        # valid_window=2 → tolera ±1 período de 30s por desfase de reloj del celular
        # No usar valores grandes (como 40): un código robado seguiría siendo válido 20 minutos
        totp = pyotp.TOTP(base64.b32encode(device.bin_key).decode().replace('=', ''))
        if totp.verify(token, valid_window=2):
            # Eliminar otros dispositivos confirmados antes de activar este
            TOTPDevice.objects.filter(user=user, confirmed=True).delete()
            device.confirmed = True
            device.save()
            return Response({'status': '2FA activado correctamente'})
        else:
            return Response({'error': 'Código inválido. Verifique su aplicación o la hora de su celular.'}, status=status.HTTP_400_BAD_REQUEST)

class SendEmailOTPView(APIView):
    """
    Envía un código de respaldo al correo del usuario.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'otp_send'

    def post(self, request):
        pre_auth_id = request.data.get('pre_auth_id')
        if not pre_auth_id:
            return Response({'error': 'Falta pre_auth_id'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = cache.get(f'pre_auth_{pre_auth_id}')
        if not user_id:
            return Response({'error': 'Sesión expirada'}, status=status.HTTP_400_BAD_REQUEST)

        # CRÍTICO CORREGIDO: filter+first evita DoesNotExist si el cache tiene un ID inválido
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email:
            return Response({'error': 'El usuario no tiene un correo configurado para recuperación.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        cache.set(f'email_otp_{pre_auth_id}', otp_code, timeout=600)

        subject = '🔐 Código de Verificación de Dos Pasos'
        message = (
            f'Hola {user.username},\n\n'
            f'Su código de acceso temporal es: {otp_code}\n\n'
            f'Este código expirará en 10 minutos.\n'
            f'Si usted no solicitó este código, ignore este mensaje.'
        )

        # CRÍTICO CORREGIDO: envuelto en try/except — un SMTP caído ya no causa error 500
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        except SMTPException as e:
            return Response(
                {'error': 'No se pudo enviar el correo. Contacte al administrador.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({'status': 'Código enviado al correo'})

class TwoFactorLoginVerifyView(APIView):
    """
    Verifica el segundo factor durante el login (TOTP o Email).
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'otp_verify'

    def post(self, request):
        pre_auth_id = request.data.get('pre_auth_id')
        token = request.data.get('token')
        
        if not pre_auth_id:
            return Response({'error': 'Falta pre_auth_id'}, status=status.HTTP_400_BAD_REQUEST)
            
        user_id = cache.get(f'pre_auth_{pre_auth_id}')
        if not user_id:
            return Response({'error': 'Sesión expirada o inválida'}, status=status.HTTP_400_BAD_REQUEST)

        # CRÍTICO CORREGIDO: filter+first evita DoesNotExist
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_400_BAD_REQUEST)

        # valid_window=2 → ±1 período (30s) de tolerancia por desfase de reloj
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if device:
            totp = pyotp.TOTP(base64.b32encode(device.bin_key).decode().replace('=', ''))
            if totp.verify(token, valid_window=2):
                return self._success_response(user, pre_auth_id)
            
        # 2. Intentar con Email OTP (Caché)
        cached_otp = cache.get(f'email_otp_{pre_auth_id}')
        if cached_otp and token == cached_otp:
            cache.delete(f'email_otp_{pre_auth_id}')
            return self._success_response(user, pre_auth_id)
        
        return Response({'error': 'Código de verificación incorrecto o expirado'}, status=status.HTTP_401_UNAUTHORIZED)

    def _success_response(self, user, pre_auth_id):
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.profile.role if hasattr(user, 'profile') else 'analista'
        refresh['full_name'] = f"{user.first_name} {user.last_name}".strip() or user.username

        cache.delete(f'pre_auth_{pre_auth_id}')

        response = Response({
            'full_name': refresh['full_name'],
            'role': refresh['role']
        })

        # CRÍTICO: usuarios con 2FA también reciben la cookie httpOnly
        from continuidad.views import CustomTokenObtainPairView
        CustomTokenObtainPairView._set_auth_cookies(
            response,
            str(refresh.access_token),
            str(refresh)
        )

        # CSRF: forzar emisión de la cookie csrftoken para que el frontend
        # pueda adjuntarla en las peticiones POST/PUT/PATCH/DELETE siguientes.
        from django.middleware.csrf import get_token
        get_token(self.request)

        return response
