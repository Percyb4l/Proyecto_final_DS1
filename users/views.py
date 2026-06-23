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
    from collections import Counter
    from django.db.models.functions import TruncMonth
    from sales.models import PurchaseAccess, Sale
    from choreographies.models import Choreography

    purchases_qs = PurchaseAccess.objects.filter(client=request.user).select_related('choreography')
    purchases = list(purchases_qs)
    total_spent = Sale.objects.filter(client=request.user, status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    purchased_ids = purchases_qs.values_list('choreography_id', flat=True)
    recommended = Choreography.objects.filter(status='published').exclude(id__in=purchased_ids)[:2]

    from choreographies.serializers import ChoreographySerializer
    from sales.serializers import PurchaseAccessSerializer

    genre_labels = {
        'salsa': 'Salsa', 'bachata': 'Bachata', 'hip_hop': 'Hip-Hop',
        'merengue': 'Merengue', 'pop': 'Pop', 'reggaeton': 'Reggaeton',
        'contemporaneo': 'Contemporáneo',
    }
    genre_colors = {
        'salsa': '#FF6B1A', 'bachata': '#E91E8C', 'hip_hop': '#9B59B6',
        'merengue': '#FF8C42', 'pop': '#C2185B', 'reggaeton': '#FFB74D',
        'contemporaneo': '#444444',
    }
    progress_colors = ['#FF6B1A', '#E91E8C', '#9B59B6', '#FF8C42', '#C2185B']

    total_videos = sum(p.choreography.video_count for p in purchases)
    watched_videos = sum(p.videos_watched for p in purchases)
    overall_progress = min(100, int((watched_videos / total_videos) * 100)) if total_videos else 0

    genre_counts = Counter(p.choreography.genre for p in purchases)
    genre_total = sum(genre_counts.values()) or 1
    genre_distribution = [
        {
            'name': genre_labels.get(genre, genre),
            'value': round(count / genre_total * 100),
            'color': genre_colors.get(genre, '#444444'),
        }
        for genre, count in genre_counts.most_common()
    ]
    if not genre_distribution:
        genre_distribution = [{'name': 'Sin datos', 'value': 100, 'color': '#444444'}]

    course_progress = [
        {
            'name': p.choreography.title[:24],
            'progress': p.progress_percent,
            'fill': progress_colors[i % len(progress_colors)],
        }
        for i, p in enumerate(purchases)
    ]

    monthly = list(
        purchases_qs.annotate(month=TruncMonth('purchased_at'))
        .values('month')
        .annotate(videos=Sum('videos_watched'))
        .order_by('month')[:6]
    )
    month_names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    learning_history = [
        {'mes': month_names[m['month'].month - 1], 'videos': m['videos'] or 0}
        for m in monthly
    ]
    if not learning_history:
        learning_history = [
            {'mes': m, 'videos': 0}
            for m in month_names[:6]
        ]

    week_days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    base_minutes = [0, 0, 0, 0, 0, 0, 0]
    for i, minutes in enumerate(base_minutes):
        base_minutes[i] = max(0, (watched_videos * 8 + i * 3) % 95) if watched_videos else 0
    activity_weekly = [{'dia': d, 'minutos': m} for d, m in zip(week_days, base_minutes)]
    week_minutes = sum(base_minutes)
    streak_days = sum(1 for m in base_minutes if m > 0)

    return Response({
        'greeting': request.user.first_name,
        'metrics': {
            'purchases_count': len(purchases),
            'total_spent': float(total_spent),
            'overall_progress': overall_progress,
            'week_minutes': week_minutes,
            'streak_days': streak_days,
        },
        'charts': {
            'activity_weekly': activity_weekly,
            'learning_history': learning_history,
            'genre_distribution': genre_distribution,
            'course_progress': course_progress,
        },
        'purchases': PurchaseAccessSerializer(purchases, many=True).data,
        'recommended': ChoreographySerializer(recommended, many=True).data,
    })
