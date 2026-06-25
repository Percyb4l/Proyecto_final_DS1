from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import ProfessorProfile
from choreographies.models import Choreography, ChoreographyVideo

User = get_user_model()

CHOREOS = [
    {
        'title': 'Salsa Fusion Intermedia', 'song_name': 'Vivir Mi Vida', 'genre': 'salsa',
        'difficulty': 'intermediate', 'price': 89900, 'emoji': '💃', 'rating': 4.9,
        'videos': ['Introducción y pasos básicos', 'Combinación intermedia', 'Coreografía completa', 'Tips de estilo'],
    },
    {
        'title': 'Bachata Sensual Básica', 'song_name': 'Propuesta Indecente', 'genre': 'bachata',
        'difficulty': 'basic', 'price': 74900, 'emoji': '🕺', 'rating': 4.6,
        'videos': ['Postura y conexión', 'Pasos básicos', 'Giros fundamentales', 'Secuencia romántica'],
    },
    {
        'title': 'Hip-Hop Urban Style', 'song_name': 'God\'s Plan', 'genre': 'hip_hop',
        'difficulty': 'advanced', 'price': 99900, 'emoji': '🎤', 'rating': 4.8,
        'videos': ['Warm up', 'Footwork avanzado', 'Isolaciones', 'Coreografía final'],
    },
    {
        'title': 'Merengue Power Dance', 'song_name': 'El Baile del Perrito', 'genre': 'merengue',
        'difficulty': 'basic', 'price': 69900, 'emoji': '🎵', 'rating': 4.5,
        'videos': ['Ritmo y timing', 'Pasos de merengue', 'Combinaciones', 'Show final'],
    },
    {
        'title': 'Reggaeton Flow', 'song_name': 'Dákiti', 'genre': 'reggaeton',
        'difficulty': 'intermediate', 'price': 84900, 'emoji': '🔥', 'rating': 4.7,
        'videos': ['Bounce y groove', 'Pasos urbanos', 'Combinación perreo', 'Coreografía completa'],
    },
    {
        'title': 'Pop Choreo Express', 'song_name': 'Levitating', 'genre': 'pop',
        'difficulty': 'intermediate', 'price': 79900, 'emoji': '✨', 'rating': 4.4,
        'videos': ['Expresión corporal', 'Pasos pop', 'Transiciones', 'Rutina completa'],
    },
]


class Command(BaseCommand):
    help = 'Carga datos semilla para RITMOFLOW'

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            email='admin@ritmoflow.com',
            defaults={
                'username': 'admin@ritmoflow.com', 'first_name': 'Admin', 'last_name': 'RITMOFLOW',
                'role': User.Role.ADMIN, 'document_type': 'CC', 'document_number': '1000000001',
                'phone': '3001111111', 'is_staff': True, 'is_superuser': True,
            },
        )
        admin.set_password('admin123')
        admin.save()

        director, _ = User.objects.get_or_create(
            email='director@ritmoflow.com',
            defaults={
                'username': 'director@ritmoflow.com', 'first_name': 'Carlos', 'last_name': 'Director',
                'role': User.Role.DIRECTOR, 'document_type': 'CC', 'document_number': '1000000002',
                'phone': '3002222222',
            },
        )
        director.set_password('admin123')
        director.save()

        prof_data = [
            ('carlos.prof@ritmoflow.com', 'Carlos', 'Mendoza', 'Salsa, Bachata', '10 años de experiencia en bailes latinos'),
            ('maria.prof@ritmoflow.com', 'María', 'García', 'Hip-Hop, Contemporáneo', 'Bailarina profesional y coreógrafa'),
        ]
        professors = []
        for i, (email, fn, ln, exp, bio) in enumerate(prof_data):
            prof, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email, 'first_name': fn, 'last_name': ln,
                    'role': User.Role.PROFESSOR, 'document_type': 'CC',
                    'document_number': f'100000001{i+3}', 'phone': f'300333333{i}',
                },
            )
            prof.set_password('admin123')
            prof.save()
            ProfessorProfile.objects.get_or_create(user=prof, defaults={'expertise': exp, 'bio': bio})
            professors.append(prof)

        client, _ = User.objects.get_or_create(
            email='ana@ritmoflow.com',
            defaults={
                'username': 'ana@ritmoflow.com', 'first_name': 'Ana', 'last_name': 'Rodríguez',
                'role': User.Role.CLIENT, 'document_type': 'CC', 'document_number': '1000000005',
                'phone': '3004444444',
            },
        )
        client.set_password('admin123')
        client.save()

        for i, c in enumerate(CHOREOS):
            prof = professors[i % len(professors)]
            choreo, created = Choreography.objects.get_or_create(
                title=c['title'],
                defaults={
                    'song_name': c['song_name'], 'genre': c['genre'], 'difficulty': c['difficulty'],
                    'price': c['price'], 'thumbnail_emoji': c['emoji'], 'rating': c['rating'],
                    'main_professor': prof, 'status': Choreography.Status.PUBLISHED,
                    'description': f'Aprende {c["title"]} paso a paso con videos profesionales.',
                },
            )
            if created:
                for j, vtitle in enumerate(c['videos']):
                    ChoreographyVideo.objects.create(
                        choreography=choreo, part_number=j + 1, title=vtitle,
                        video_url=f'https://example.com/video/{choreo.id}/{j+1}',
                    )

        from sales.signals import sync_all_choreography_sales_counts
        sync_all_choreography_sales_counts()

        self.stdout.write(self.style.SUCCESS('✅ Datos semilla cargados'))
        self.stdout.write('   admin@ritmoflow.com / admin123 (Admin)')
        self.stdout.write('   director@ritmoflow.com / admin123 (Director)')
        self.stdout.write('   carlos.prof@ritmoflow.com / admin123 (Profesor)')
        self.stdout.write('   ana@ritmoflow.com / admin123 (Cliente)')
