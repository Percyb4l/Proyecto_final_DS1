"""Rutas del catálogo bajo /api/choreographies/ (ViewSet REST)."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.ChoreographyViewSet, basename='choreographies')

urlpatterns = [
    path('', include(router.urls)),
]
