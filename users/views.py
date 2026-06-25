from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Sum, Count, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from captcha.helpers import captcha_image_url
from captcha.models import CaptchaStore

from .models import ProfessorProfile
from .serializers import (
    UserSerializer, MeProfileSerializer, RegisterSerializer, LoginSerializer,
    InternalUserCreateSerializer, ProfessorProfileSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    InternalUserUpdateSerializer,
)
from .permissions import IsAdminOrDirector, IsAdminDirectorOrProfessor, IsClient

User = get_user_model()

MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
GENRE_LABELS = {
    'salsa': 'Salsa', 'bachata': 'Bachata', 'merengue': 'Merengue',
    'hip_hop': 'Hip-Hop', 'pop': 'Pop', 'reggaeton': 'Reggaeton', 'contemporaneo': 'Contemporáneo',
}


def _last_six_month_periods():
    now = timezone.now()
    year, month = now.year, now.month
    periods = []
    for _ in range(6):
        periods.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return list(reversed(periods))


def _month_label(year, month):
    return MONTH_SHORT[month - 1]


def _series_from_periods(periods, values_by_period, value_key='value'):
    return [
        {
            'month': _month_label(year, month),
            'year': year,
            value_key: float(values_by_period.get((year, month), 0)),
        }
        for year, month in periods
    ]


def build_admin_dashboard_stats():
    from choreographies.models import Choreography
    from sales.models import Sale, SaleItem

    periods = _last_six_month_periods()
    start = timezone.datetime(periods[0][0], periods[0][1], 1, tzinfo=timezone.get_current_timezone())

    completed_sales = Sale.objects.filter(status=Sale.Status.COMPLETED)
    total_revenue = completed_sales.aggregate(total=Sum('total_amount'))['total'] or 0
    total_sales_count = completed_sales.count()
    average_ticket = float(
        completed_sales.aggregate(avg=Avg('total_amount'))['avg'] or 0
    )

    totalizers = {
        'active_users': User.objects.filter(is_active=True).count(),
        'published_choreographies': Choreography.objects.filter(
            status=Choreography.Status.PUBLISHED
        ).count(),
        'total_revenue': float(total_revenue),
        'total_sales_count': total_sales_count,
        'average_ticket': average_ticket,
    }

    sales_by_month = {
        (row['month'].year, row['month'].month): row['amount']
        for row in completed_sales.filter(created_at__gte=start)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(amount=Sum('total_amount'))
    }

    registrations_by_month = {
        (row['month'].year, row['month'].month): row['count']
        for row in User.objects.filter(role=User.Role.CLIENT, date_joined__gte=start)
        .annotate(month=TruncMonth('date_joined'))
        .values('month')
        .annotate(count=Count('id'))
    }

    top_choreographies = list(
        SaleItem.objects.filter(sale__status=Sale.Status.COMPLETED)
        .values('choreography_title', 'choreography__genre')
        .annotate(sales_count=Count('id'), revenue=Sum('price'))
        .order_by('-sales_count')[:5]
    )
    for item in top_choreographies:
        item['title'] = item.pop('choreography_title')
        item['genre'] = GENRE_LABELS.get(item['choreography__genre'], item['choreography__genre'])
        item.pop('choreography__genre', None)
        item['revenue'] = float(item['revenue'] or 0)
        item['sales_count'] = int(item['sales_count'])

    if not top_choreographies:
        top_choreographies = [
            {
                'title': c.title,
                'genre': GENRE_LABELS.get(c.genre, c.genre),
                'sales_count': c.sales_count,
                'revenue': float(c.sales_count) * float(c.price),
            }
            for c in Choreography.objects.filter(status=Choreography.Status.PUBLISHED)
            .order_by('-sales_count')[:5]
        ]

    revenue_by_genre = list(
        SaleItem.objects.filter(sale__status=Sale.Status.COMPLETED)
        .values('choreography__genre')
        .annotate(revenue=Sum('price'), count=Count('id'))
        .order_by('-revenue')
    )
    for row in revenue_by_genre:
        row['genre'] = GENRE_LABELS.get(row['choreography__genre'], row['choreography__genre'])
        row['revenue'] = float(row['revenue'] or 0)
        row['count'] = int(row['count'])
        row.pop('choreography__genre', None)

    clients_by_country = list(
        User.objects.filter(role=User.Role.CLIENT, is_active=True)
        .values('country')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    for row in clients_by_country:
        row['country'] = row['country'] or 'Sin país'

    statistics = {
        'monthly_sales': _series_from_periods(periods, sales_by_month, 'amount'),
        'monthly_registrations': _series_from_periods(periods, registrations_by_month, 'count'),
        'top_choreographies': top_choreographies,
        'revenue_by_genre': revenue_by_genre,
        'average_ticket': average_ticket,
        'clients_by_country': clients_by_country,
    }

    return {'totalizers': totalizers, 'statistics': statistics}


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
    permission_classes = [IsAuthenticated]
    serializer_class = MeProfileSerializer

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']
    message = 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': message})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link = f'{frontend_url}/reset-password?uid={uid}&token={token}'

    send_mail(
        subject='RITMOFLOW — Recuperar contraseña',
        message=(
            f'Hola {user.first_name},\n\n'
            f'Para restablecer tu contraseña visita el siguiente enlace:\n{reset_link}\n\n'
            'Si no solicitaste este cambio, ignora este mensaje.'
        ),
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@ritmoflow.com'),
        recipient_list=[user.email],
        fail_silently=False,
    )
    return Response({'detail': message})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        uid = force_str(urlsafe_base64_decode(data['uid']))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'detail': 'Enlace inválido o expirado'}, status=400)

    if not default_token_generator.check_token(user, data['token']):
        return Response({'detail': 'Enlace inválido o expirado'}, status=400)

    user.set_password(data['password'])
    user.save()
    return Response({'detail': 'Contraseña actualizada correctamente'})


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
        if self.action in ('update', 'partial_update'):
            return InternalUserUpdateSerializer
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
@permission_classes([IsAuthenticated, IsAdminOrDirector])
def admin_dashboard(request):
    return Response(build_admin_dashboard_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
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
