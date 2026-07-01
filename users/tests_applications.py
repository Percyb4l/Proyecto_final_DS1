"""Pruebas del flujo de postulaciones para ser profesor."""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import ProfessorApplication, ProfessorProfile

User = get_user_model()


class ProfessorApplicationTests(APITestCase):
    def setUp(self):
        self.director = User.objects.create_user(
            username='director@test.com',
            email='director@test.com',
            password='testpass123',
            role=User.Role.DIRECTOR,
        )
        self.client_user = User.objects.create_user(
            username='client@test.com',
            email='client@test.com',
            password='testpass123',
            role=User.Role.CLIENT,
            first_name='Cliente',
            last_name='Postulante',
            document_number='1001001001',
            phone='3001111111',
        )
        self.application_data = {
            'email': 'candidato@test.com',
            'first_name': 'Candidato',
            'last_name': 'Bailarin',
            'phone': '3002222222',
            'document_type': 'CC',
            'document_number': '1002003004',
            'expertise': 'Salsa, Bachata',
            'experience': '5 años enseñando baile social y escenario.',
            'bio': 'Bailarín profesional.',
        }

    def test_public_user_can_submit_application(self):
        response = self.client.post(
            reverse('professor-applications-list'),
            self.application_data,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            ProfessorApplication.objects.filter(
                email='candidato@test.com',
                status=ProfessorApplication.Status.PENDING,
            ).exists()
        )

    def test_duplicate_pending_email_is_rejected(self):
        ProfessorApplication.objects.create(**self.application_data)
        response = self.client.post(
            reverse('professor-applications-list'),
            self.application_data,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_director_can_list_applications(self):
        ProfessorApplication.objects.create(**self.application_data)
        self.client.force_authenticate(user=self.director)
        response = self.client.get(reverse('professor-applications-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_client_cannot_list_applications(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('professor-applications-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_professor_cannot_submit_application(self):
        professor = User.objects.create_user(
            username='prof@test.com',
            email='prof@test.com',
            password='testpass123',
            role=User.Role.PROFESSOR,
        )
        self.client.force_authenticate(user=professor)
        response = self.client.post(
            reverse('professor-applications-list'),
            self.application_data,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_creates_professor_user(self):
        application = ProfessorApplication.objects.create(**self.application_data)
        self.client.force_authenticate(user=self.director)
        response = self.client.post(
            reverse('professor-applications-approve', args=[application.id]),
            {'password': 'nuevapass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        application.refresh_from_db()
        self.assertEqual(application.status, ProfessorApplication.Status.APPROVED)

        user = User.objects.get(email='candidato@test.com')
        self.assertEqual(user.role, User.Role.PROFESSOR)
        self.assertTrue(ProfessorProfile.objects.filter(user=user, expertise='Salsa, Bachata').exists())
        self.assertTrue(user.check_password('nuevapass123'))

    def test_approve_converts_existing_client(self):
        application = ProfessorApplication.objects.create(
            applicant=self.client_user,
            email=self.client_user.email,
            first_name=self.client_user.first_name,
            last_name=self.client_user.last_name,
            phone=self.client_user.phone,
            document_type='CC',
            document_number=self.client_user.document_number,
            expertise='Hip-Hop',
            experience='3 años como instructor.',
        )
        self.client.force_authenticate(user=self.director)
        response = self.client.post(
            reverse('professor-applications-approve', args=[application.id]),
            {'password': 'profpass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.role, User.Role.PROFESSOR)
        self.assertTrue(ProfessorProfile.objects.filter(user=self.client_user).exists())

    def test_reject_application(self):
        application = ProfessorApplication.objects.create(**self.application_data)
        self.client.force_authenticate(user=self.director)
        response = self.client.post(
            reverse('professor-applications-reject', args=[application.id]),
            {'review_notes': 'Falta experiencia documentada.'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        application.refresh_from_db()
        self.assertEqual(application.status, ProfessorApplication.Status.REJECTED)
        self.assertEqual(application.review_notes, 'Falta experiencia documentada.')
        self.assertFalse(User.objects.filter(email='candidato@test.com').exists())

    def test_cannot_approve_already_reviewed_application(self):
        application = ProfessorApplication.objects.create(
            **self.application_data,
            status=ProfessorApplication.Status.REJECTED,
        )
        self.client.force_authenticate(user=self.director)
        response = self.client.post(
            reverse('professor-applications-approve', args=[application.id]),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
