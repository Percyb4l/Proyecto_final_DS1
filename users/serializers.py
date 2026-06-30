"""
Serializadores de usuarios: registro, login, perfil y usuarios internos.

Validan CAPTCHA en login, impiden editar el rol en /me/ y crean perfiles
de profesor al registrar usuarios internos.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from captcha.models import CaptchaStore
from .models import User, ProfessorProfile


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'document_type', 'document_number', 'gender', 'birth_date',
            'phone', 'billing_address', 'city', 'department', 'country',
        ]
        read_only_fields = ['id']


class MeProfileSerializer(serializers.ModelSerializer):
    """Perfil editable del usuario autenticado; el rol es de solo lectura."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'document_type', 'document_number', 'gender', 'birth_date',
            'phone', 'billing_address', 'city', 'department', 'country',
        ]
        read_only_fields = ['id', 'username', 'role']


class ProfessorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProfessorProfile
        fields = ['id', 'user', 'expertise', 'bio', 'hire_date']


class RegisterSerializer(serializers.ModelSerializer):
    """Registro público de clientes con validación de contraseñas y documento único."""

    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'document_type', 'document_number', 'phone',
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Este correo ya está registrado'})
        if User.objects.filter(document_number=data.get('document_number')).exists():
            raise serializers.ValidationError({'document_number': 'Este documento ya está registrado'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        user = User(
            username=email,
            email=email,
            role=User.Role.CLIENT,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        return user


class InternalUserCreateSerializer(serializers.ModelSerializer):
    """Creación de usuarios desde el panel de administración."""

    password = serializers.CharField(write_only=True, min_length=6)
    expertise = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'role',
            'document_type', 'document_number', 'gender', 'birth_date',
            'phone', 'billing_address', 'city', 'department', 'country',
            'expertise', 'bio',
        ]

    def create(self, validated_data):
        expertise = validated_data.pop('expertise', '')
        bio = validated_data.pop('bio', '')
        password = validated_data.pop('password')
        email = validated_data['email']
        role = validated_data.get('role', User.Role.PROFESSOR)

        user = User(username=email, email=email, **validated_data)
        user.set_password(password)
        user.save()

        if role == User.Role.PROFESSOR:
            ProfessorProfile.objects.create(user=user, expertise=expertise, bio=bio)
        return user


class InternalUserUpdateSerializer(serializers.ModelSerializer):
    """Actualización de usuarios; contraseña opcional."""

    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'role',
            'document_type', 'document_number', 'gender', 'birth_date',
            'phone', 'billing_address', 'city', 'department', 'country',
        ]

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    """Valida credenciales y CAPTCHA antes de emitir JWT."""

    email = serializers.EmailField()
    password = serializers.CharField()
    captcha_key = serializers.CharField()
    captcha_value = serializers.CharField()

    def validate(self, data):
        if not CaptchaStore.objects.filter(hashkey=data['captcha_key'], response=data['captcha_value'].lower()).exists():
            raise serializers.ValidationError({'captcha': 'CAPTCHA incorrecto'})

        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            try:
                u = User.objects.get(email=data['email'])
                user = authenticate(username=u.username, password=data['password'])
            except User.DoesNotExist:
                pass
        if not user:
            raise serializers.ValidationError({'detail': 'Credenciales inválidas'})
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'Usuario inactivo'})
        data['user'] = user
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(min_length=6)
    password_confirm = serializers.CharField(min_length=6)

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden'})
        return data
