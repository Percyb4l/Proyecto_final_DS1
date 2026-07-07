"""
Rutas de autenticación y gestión de usuarios bajo /api/auth/.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('internal', views.InternalUserViewSet, basename='internal-users')
router.register('professors', views.ProfessorViewSet, basename='professors')
router.register('professor-applications', views.ProfessorApplicationViewSet, basename='professor-applications')

urlpatterns = [
    path('captcha/', views.get_captcha, name='captcha'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('me/', views.MeView.as_view(), name='me'),
    path('password-reset/', views.password_reset_request, name='password-reset'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    path('dashboard/admin/', views.admin_dashboard, name='admin-dashboard'),
    path('dashboard/client/', views.client_dashboard, name='client-dashboard'),
    path('dashboard/professor/', views.professor_dashboard, name='professor-dashboard'),
    path('public-stats/', views.public_stats, name='public-stats'),
    path('', include(router.urls)),
]
