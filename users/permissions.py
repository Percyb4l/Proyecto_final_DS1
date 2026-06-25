"""
Permisos personalizados por rol para la API REST.

Controlan quién puede gestionar usuarios internos, comprar en el carrito
o editar coreografías según ownership.
"""
from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()


class IsAdminOrDirector(BasePermission):
    """Permite acceso solo a administradores y directores."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (User.Role.ADMIN, User.Role.DIRECTOR)


class IsClient(BasePermission):
    """Permite acceso solo a clientes (carrito, checkout, compras)."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.CLIENT


class IsAdminDirectorOrProfessor(BasePermission):
    """Permite acceso a roles que gestionan coreografías en el panel."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            User.Role.ADMIN, User.Role.DIRECTOR, User.Role.PROFESSOR
        )


class IsProfessorOwnerOrAdmin(BasePermission):
    """El profesor solo puede modificar coreografías donde es main_professor."""

    def has_object_permission(self, request, view, obj):
        if request.user.role in (User.Role.ADMIN, User.Role.DIRECTOR):
            return True
        return obj.main_professor == request.user
