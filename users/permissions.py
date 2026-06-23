from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()


class IsAdminOrDirector(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (User.Role.ADMIN, User.Role.DIRECTOR)


class IsAdminDirectorOrProfessor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            User.Role.ADMIN, User.Role.DIRECTOR, User.Role.PROFESSOR
        )


class IsProfessorOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in (User.Role.ADMIN, User.Role.DIRECTOR):
            return True
        return obj.main_professor == request.user
