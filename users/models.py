"""
Modelos de usuarios de RITMOFLOW.

Define el usuario personalizado con roles (admin, director, profesor, cliente)
y el perfil extendido de profesores bailarines.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Usuario del sistema. Extiende AbstractUser con rol y datos de facturación."""
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrador'
        DIRECTOR = 'director', 'Director'
        PROFESSOR = 'professor', 'Profesor bailarín'
        CLIENT = 'client', 'Cliente'

    class DocumentType(models.TextChoices):
        CC = 'CC', 'Cédula de ciudadanía'
        CE = 'CE', 'Cédula de extranjería'
        TI = 'TI', 'Tarjeta de identidad'
        PP = 'PP', 'Pasaporte'

    class Gender(models.TextChoices):
        M = 'M', 'Masculino'
        F = 'F', 'Femenino'
        O = 'O', 'Otro'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    document_type = models.CharField(max_length=5, choices=DocumentType.choices, blank=True)
    document_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    billing_address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Colombia')

    @property
    def is_internal(self):
        """True si el usuario pertenece al equipo interno (no es cliente)."""
        return self.role in (self.Role.ADMIN, self.Role.DIRECTOR, self.Role.PROFESSOR)

    @property
    def full_name(self):
        """Nombre completo para mostrar en UI y reportes."""
        return f'{self.first_name} {self.last_name}'.strip() or self.username


class ProfessorProfile(models.Model):
    """Datos profesionales del profesor bailarín vinculado a un User."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professor_profile')
    expertise = models.CharField(max_length=200, help_text='Estilos de baile que enseña')
    bio = models.TextField(blank=True)
    hire_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'Prof. {self.user.full_name}'
