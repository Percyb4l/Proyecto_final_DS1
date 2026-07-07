"""
Serializadores de usuarios: registro, login, perfil y usuarios internos.

Validan CAPTCHA en login, impiden editar el rol en /me/ y crean perfiles
de profesor al registrar usuarios internos.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from captcha.models import CaptchaStore
from .models import User, ProfessorProfile, ProfessorApplication


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    expertise = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'document_type', 'document_number', 'gender', 'birth_date',
            'phone', 'billing_address', 'city', 'department', 'country',
            'expertise', 'bio',
        ]
        read_only_fields = ['id']

    def get_expertise(self, obj):
        try:
            return obj.professor_profile.expertise
        except ProfessorProfile.DoesNotExist:
            return ''

    def get_bio(self, obj):
        try:
            return obj.professor_profile.bio
        except ProfessorProfile.DoesNotExist:
            return ''


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


def _validate_captcha(data):
    if not CaptchaStore.objects.filter(
        hashkey=data['captcha_key'],
        response=data['captcha_value'].lower(),
    ).exists():
        raise serializers.ValidationError({'captcha': 'CAPTCHA incorrecto'})
    return data


class RegisterSerializer(serializers.ModelSerializer):
    """Registro público de clientes con validación de contraseñas, documento y CAPTCHA."""

    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    captcha_key = serializers.CharField(write_only=True)
    captcha_value = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'captcha_key', 'captcha_value',
            'first_name', 'last_name', 'document_type', 'document_number', 'phone',
        ]

    def validate(self, data):
        _validate_captcha(data)
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Este correo ya está registrado'})
        if User.objects.filter(document_number=data.get('document_number')).exists():
            raise serializers.ValidationError({'document_number': 'Este documento ya está registrado'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.pop('captcha_key')
        validated_data.pop('captcha_value')
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
        email = validated_data.pop('email')
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
    expertise = serializers.CharField(required=False, allow_blank=True, write_only=True)
    bio = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'role',
            'document_type', 'document_number', 'gender', 'birth_date',
            'phone', 'billing_address', 'city', 'department', 'country',
            'expertise', 'bio',
        ]

    def update(self, instance, validated_data):
        expertise = validated_data.pop('expertise', None)
        bio = validated_data.pop('bio', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if instance.role == User.Role.PROFESSOR and (expertise is not None or bio is not None):
            profile, _ = ProfessorProfile.objects.get_or_create(user=instance)
            if expertise is not None:
                profile.expertise = expertise
            if bio is not None:
                profile.bio = bio
            profile.save()
        return instance


class LoginSerializer(serializers.Serializer):
    """Valida credenciales y CAPTCHA antes de emitir JWT."""

    email = serializers.EmailField()
    password = serializers.CharField()
    captcha_key = serializers.CharField()
    captcha_value = serializers.CharField()

    def validate(self, data):
        _validate_captcha(data)

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


class ProfessorApplicationSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    applicant_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProfessorApplication
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'document_type', 'document_number', 'expertise', 'experience', 'bio',
            'status', 'review_notes', 'reviewed_by_name', 'reviewed_at', 'created_at',
            'applicant_name',
        ]
        read_only_fields = fields

    def get_applicant_name(self, obj):
        return obj.applicant.full_name if obj.applicant else None

    def get_reviewed_by_name(self, obj):
        return obj.reviewed_by.full_name if obj.reviewed_by else None


class ProfessorApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessorApplication
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'document_type',
            'document_number', 'expertise', 'experience', 'bio',
        ]

    def validate_email(self, value):
        user = User.objects.filter(email=value).first()
        if user and user.role in (User.Role.ADMIN, User.Role.DIRECTOR, User.Role.PROFESSOR):
            raise serializers.ValidationError('Este correo ya pertenece a un usuario del equipo interno.')
        if ProfessorApplication.objects.filter(email=value, status=ProfessorApplication.Status.PENDING).exists():
            raise serializers.ValidationError('Ya hay una postulación pendiente con este correo.')
        return value

    def validate(self, data):
        request = self.context['request']
        if request.user.is_authenticated:
            if request.user.role in (User.Role.ADMIN, User.Role.DIRECTOR, User.Role.PROFESSOR):
                raise serializers.ValidationError('Los usuarios internos no pueden postularse como profesor.')
            if ProfessorApplication.objects.filter(
                applicant=request.user, status=ProfessorApplication.Status.PENDING,
            ).exists():
                raise serializers.ValidationError('Ya tienes una postulación pendiente.')
        doc = data.get('document_number')
        if doc and ProfessorApplication.objects.filter(
            document_number=doc, status=ProfessorApplication.Status.PENDING,
        ).exists():
            raise serializers.ValidationError({'document_number': 'Ya hay una postulación pendiente con este documento.'})
        return data

    def create(self, validated_data):
        request = self.context['request']
        applicant = request.user if request.user.is_authenticated else None
        if applicant:
            validated_data.setdefault('email', applicant.email)
            validated_data.setdefault('first_name', applicant.first_name)
            validated_data.setdefault('last_name', applicant.last_name)
            validated_data.setdefault('phone', applicant.phone or '')
            validated_data.setdefault('document_number', applicant.document_number or validated_data.get('document_number'))
            validated_data.setdefault('document_type', applicant.document_type or validated_data.get('document_type', 'CC'))
        return ProfessorApplication.objects.create(applicant=applicant, **validated_data)


class ProfessorApplicationReviewSerializer(serializers.Serializer):
    review_notes = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, min_length=6, write_only=True)


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
