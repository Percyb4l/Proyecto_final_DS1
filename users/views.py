from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Sum, Count
from django.contrib.auth import get_user_model
from captcha.helpers import captcha_image_url
from captcha.models import CaptchaStore

from .models import ProfessorProfile
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    InternalUserCreateSerializer, ProfessorProfileSerializer,
)
from .permissions import IsAdminOrDirector, IsAdminDirectorOrProfessor

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def get_captcha(request):
    key = CaptchaStore.generate_key()
    return Response({'captcha_key': key, 'captcha_image': captcha_image_url(key)})


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class InternalUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDirector]

    def get_queryset(self):
        qs = User.objects.filter(role__in=[User.Role.ADMIN, User.Role.DIRECTOR, User.Role.PROFESSOR])
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search) |
                Q(email__icontains=search) | Q(document_number__icontains=search)
            )
        return qs.order_by('last_name')

    def get_serializer_class(self):
        if self.action == 'create':
            return InternalUserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'No puedes eliminarte a ti mismo'}, status=400)
        return super().destroy(request, *args, **kwargs)


class ProfessorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProfessorProfile.objects.select_related('user')
    serializer_class = ProfessorProfileSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if request.user.role not in (User.Role.ADMIN, User.Role.DIRECTOR):
        return Response({'error': 'Sin permisos'}, status=403)

    from choreographies.models import Choreography
    from sales.models import Sale, SaleItem

    total_sales = Sale.objects.filter(status='completed').aggregate(total=Sum('total_amount'))['total'] or 0
    choreos_sold = SaleItem.objects.count()
    active_clients = User.objects.filter(role=User.Role.CLIENT, is_active=True).count()
    professors = User.objects.filter(role=User.Role.PROFESSOR, is_active=True).count()

    sales_by_genre = list(
        SaleItem.objects.values('choreography__genre')
        .annotate(count=Count('id'), revenue=Sum('price'))
        .order_by('-count')
    )

    top_choreos = list(
        Choreography.objects.filter(status='published')
        .order_by('-sales_count')[:5]
        .values('title', 'sales_count', 'price', 'genre')
    )
    for c in top_choreos:
        c['revenue'] = float(c['sales_count']) * float(c['price'])

    monthly_sales = [
        {'month': 'Ene', 'amount': 2400000},
        {'month': 'Feb', 'amount': 3100000},
        {'month': 'Mar', 'amount': 2800000},
        {'month': 'Abr', 'amount': 4200000},
        {'month': 'May', 'amount': 3900000},
        {'month': 'Jun', 'amount': float(total_sales) or 4500000},
    ]

    return Response({
        'metrics': {
            'total_sales': float(total_sales),
            'choreos_sold': choreos_sold,
            'active_clients': active_clients,
            'professors': professors,
        },
        'sales_by_genre': sales_by_genre,
        'top_choreographies': top_choreos,
        'monthly_sales': monthly_sales,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_dashboard(request):
    from sales.models import PurchaseAccess, Sale
    purchases = PurchaseAccess.objects.filter(client=request.user).select_related('choreography')
    total_spent = Sale.objects.filter(client=request.user, status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    from choreographies.models import Choreography
    purchased_ids = purchases.values_list('choreography_id', flat=True)
    recommended = Choreography.objects.filter(status='published').exclude(id__in=purchased_ids)[:2]

    from choreographies.serializers import ChoreographySerializer
    from sales.serializers import PurchaseAccessSerializer

    return Response({
        'greeting': request.user.first_name,
        'metrics': {
            'purchases_count': purchases.count(),
            'total_spent': float(total_spent),
        },
        'purchases': PurchaseAccessSerializer(purchases, many=True).data,
        'recommended': ChoreographySerializer(recommended, many=True).data,
    })
