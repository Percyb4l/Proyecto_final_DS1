from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Choreography
from .serializers import ChoreographySerializer, ChoreographyCreateSerializer
from users.permissions import (
    IsAdminOrDirector,
    IsAdminDirectorOrProfessor,
    IsProfessorOwnerOrAdmin,
)


class ChoreographyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Choreography.objects.select_related('main_professor').prefetch_related('videos')
        user = self.request.user

        if self.action in ('featured', 'hot_sales'):
            return qs.filter(status=Choreography.Status.PUBLISHED)

        if not user.is_authenticated or user.role == 'client':
            qs = qs.filter(status=Choreography.Status.PUBLISHED)
        elif user.role == 'professor':
            qs = qs.filter(main_professor=user)
        elif user.role not in ('admin', 'director'):
            qs = qs.filter(status=Choreography.Status.PUBLISHED)

        genre = self.request.query_params.get('genre')
        difficulty = self.request.query_params.get('difficulty')
        professor = self.request.query_params.get('professor')
        search = self.request.query_params.get('search')
        sort = self.request.query_params.get('sort', 'popular')

        if genre and genre != 'all':
            qs = qs.filter(genre=genre)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if professor:
            qs = qs.filter(main_professor_id=professor)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(song_name__icontains=search))

        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('-sales_count')

        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ChoreographyCreateSerializer
        return ChoreographySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'featured', 'hot_sales'):
            return [AllowAny()]
        if self.action == 'create':
            return [IsAuthenticated(), IsAdminDirectorOrProfessor()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [
                IsAuthenticated(),
                IsAdminDirectorOrProfessor(),
                IsProfessorOwnerOrAdmin(),
            ]
        if self.action == 'approve':
            return [IsAuthenticated(), IsAdminOrDirector()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(main_professor=self.request.user)

    def get_queryset_for_admin(self):
        return Choreography.objects.select_related('main_professor').prefetch_related('videos')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        choreography = get_object_or_404(self.get_queryset_for_admin(), pk=pk)
        choreography.status = Choreography.Status.PUBLISHED
        choreography.save()
        return Response(ChoreographySerializer(choreography).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        qs = self.get_queryset().filter(status=Choreography.Status.PUBLISHED)[:4]
        return Response(ChoreographySerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def hot_sales(self, request):
        qs = self.get_queryset().filter(status=Choreography.Status.PUBLISHED).order_by('-sales_count')[:6]
        return Response(ChoreographySerializer(qs, many=True).data)
