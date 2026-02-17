from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sedes', views.SedeViewSet)
router.register(r'procesos', views.ProcesoViewSet)
router.register(r'eventos', views.EventoViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'colaboradores', views.ColaboradorViewSet) # Nueva ruta

urlpatterns = [
    path('', include(router.urls)),
    path('news/', views.get_news, name='news'),
]
