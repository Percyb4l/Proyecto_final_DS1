from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('internal', views.InternalUserViewSet, basename='internal-users')
router.register('professors', views.ProfessorViewSet, basename='professors')

urlpatterns = [
    path('captcha/', views.get_captcha, name='captcha'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('me/', views.MeView.as_view(), name='me'),
    path('dashboard/admin/', views.admin_dashboard, name='admin-dashboard'),
    path('dashboard/client/', views.client_dashboard, name='client-dashboard'),
    path('', include(router.urls)),
]
