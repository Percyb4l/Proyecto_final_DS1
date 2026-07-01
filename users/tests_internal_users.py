"""Pruebas de gestión de usuarios desde el panel admin/director."""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class InternalUsersTests(APITestCase):
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
            first_name='Ana',
            last_name='Cliente',
        )
        self.professor = User.objects.create_user(
            username='prof@test.com',
            email='prof@test.com',
            password='testpass123',
            role=User.Role.PROFESSOR,
        )

    def test_director_lists_clients_and_internal_users(self):
        self.client.force_authenticate(user=self.director)
        response = self.client.get(reverse('internal-users-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = {user['email'] for user in response.data}
        self.assertIn('client@test.com', emails)
        self.assertIn('prof@test.com', emails)
        self.assertIn('director@test.com', emails)

    def test_director_can_filter_users_by_role(self):
        self.client.force_authenticate(user=self.director)
        response = self.client.get(reverse('internal-users-list'), {'role': 'client'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(user['role'] == 'client' for user in response.data))
        self.assertEqual(len(response.data), 1)

    def test_client_cannot_list_internal_users(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('internal-users-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_director_can_create_professor(self):
        self.client.force_authenticate(user=self.director)
        response = self.client.post(
            reverse('internal-users-list'),
            {
                'email': 'nuevo.prof@test.com',
                'password': 'testpass123',
                'first_name': 'Nuevo',
                'last_name': 'Profesor',
                'role': User.Role.PROFESSOR,
                'document_type': 'CC',
                'document_number': '5566778899',
                'expertise': 'Merengue',
                'bio': 'Instructor certificado.',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='nuevo.prof@test.com')
        self.assertEqual(user.role, User.Role.PROFESSOR)
