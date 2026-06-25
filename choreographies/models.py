"""
Modelos del catálogo: coreografías y videos por parte.

Cada coreografía es un paquete vendible con estado de aprobación y contador
de ventas calculado automáticamente (sales_count).
"""
from django.db import models
from django.conf import settings


class Choreography(models.Model):
    """Paquete de videos de baile con precio, género, nivel y estado de publicación."""

    class Genre(models.TextChoices):
        SALSA = 'salsa', 'Salsa'
        BACHATA = 'bachata', 'Bachata'
        MERENGUE = 'merengue', 'Merengue'
        HIP_HOP = 'hip_hop', 'Hip-Hop'
        POP = 'pop', 'Pop'
        REGGAETON = 'reggaeton', 'Reggaeton'
        CONTEMPORANEO = 'contemporaneo', 'Contemporáneo'

    class Difficulty(models.TextChoices):
        BASIC = 'basic', 'Básico'
        INTERMEDIATE = 'intermediate', 'Intermedio'
        ADVANCED = 'advanced', 'Avanzado'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Borrador'
        PENDING = 'pending', 'Pendiente aprobación'
        PUBLISHED = 'published', 'Publicada'
        REJECTED = 'rejected', 'Rechazada'

    title = models.CharField(max_length=200)
    song_name = models.CharField(max_length=200)
    genre = models.CharField(max_length=20, choices=Genre.choices)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.BASIC)
    description = models.TextField(blank=True)
    main_professor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='choreographies_created'
    )
    guest_professor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='choreographies_guest'
    )
    guest_professor_external = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sales_count = models.PositiveIntegerField(
        default=0,
        editable=False,
        help_text='Calculado automáticamente a partir de ventas completadas.',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    thumbnail_emoji = models.CharField(max_length=10, default='💃')
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'choreographies'
        ordering = ['-sales_count', '-created_at']

    def __str__(self):
        return self.title

    @property
    def video_count(self):
        """Cantidad de partes/videos del paquete."""
        return self.videos.count()

    @property
    def professor_name(self):
        """Nombre del profesor principal para mostrar en catálogo."""
        return self.main_professor.full_name


class ChoreographyVideo(models.Model):
    """Una parte del paquete (ej. Parte 1: pasos básicos)."""

    choreography = models.ForeignKey(Choreography, on_delete=models.CASCADE, related_name='videos')
    part_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    video_url = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['part_number']
        unique_together = ['choreography', 'part_number']

    def __str__(self):
        return f'{self.choreography.title} - Parte {self.part_number}'
