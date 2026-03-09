from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views

router = DefaultRouter()
router.register(r'sedes', views.SedeViewSet)
router.register(r'procesos', views.ProcesoViewSet)
router.register(r'eventos', views.EventoViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'colaboradores', views.ColaboradorViewSet)
router.register(r'entidades-apoyo', views.EntidadApoyoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('news/', views.get_news, name='news'),
    # 2FA Endpoints
    path('2fa/status/', auth_views.TwoFactorStatusView.as_view(), name='2fa-status'),
    path('2fa/setup/', auth_views.TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/confirm/', auth_views.TwoFactorConfirmView.as_view(), name='2fa-confirm'),
    path('2fa/verify/', auth_views.TwoFactorLoginVerifyView.as_view(), name='2fa-verify'),
    path('2fa/send-email/', auth_views.SendEmailOTPView.as_view(), name='2fa-send-email'),
    path('logout/', views.logout_view, name='logout'),  # Borra cookies de sesión
]
