from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from cart.models import Cart, CartItem
from choreographies.models import Choreography

User = get_user_model()


class OwnershipSecurityTests(APITestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username='client@test.com',
            email='client@test.com',
            password='testpass123',
            role=User.Role.CLIENT,
            first_name='Cliente',
            last_name='Uno',
        )
        self.other_client = User.objects.create_user(
            username='other@test.com',
            email='other@test.com',
            password='testpass123',
            role=User.Role.CLIENT,
            first_name='Cliente',
            last_name='Dos',
        )
        self.professor = User.objects.create_user(
            username='prof@test.com',
            email='prof@test.com',
            password='testpass123',
            role=User.Role.PROFESSOR,
            first_name='Prof',
            last_name='Uno',
        )
        self.other_professor = User.objects.create_user(
            username='prof2@test.com',
            email='prof2@test.com',
            password='testpass123',
            role=User.Role.PROFESSOR,
            first_name='Prof',
            last_name='Dos',
        )
        self.choreography = Choreography.objects.create(
            title='Test Choreo',
            song_name='Test Song',
            genre='salsa',
            difficulty='basic',
            price=50000,
            status=Choreography.Status.PUBLISHED,
            main_professor=self.professor,
        )
        other_cart = Cart.objects.create(client=self.other_client)
        self.other_item = CartItem.objects.create(cart=other_cart, choreography=self.choreography)

    def test_me_endpoint_cannot_escalate_role(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.patch(
            reverse('me'),
            {'role': User.Role.ADMIN},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.role, User.Role.CLIENT)

    def test_cannot_remove_other_users_cart_item(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.delete(reverse('cart-remove', args=[self.other_item.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(CartItem.objects.filter(id=self.other_item.id).exists())

    def test_professor_cannot_update_other_professors_choreography(self):
        self.client.force_authenticate(user=self.other_professor)
        response = self.client.patch(
            f'/api/choreographies/{self.choreography.id}/',
            {'title': 'Hackeado'},
            format='json',
        )
        self.assertIn(response.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))
        self.choreography.refresh_from_db()
        self.assertEqual(self.choreography.title, 'Test Choreo')

    def test_client_cannot_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('admin-dashboard'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_professor_cannot_access_client_dashboard(self):
        self.client.force_authenticate(user=self.professor)
        response = self.client.get(reverse('client-dashboard'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_dashboard_returns_structured_stats(self):
        admin = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123',
            role=User.Role.ADMIN,
        )
        self.client.force_authenticate(user=admin)
        response = self.client.get(reverse('admin-dashboard'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('totalizers', response.data)
        self.assertIn('statistics', response.data)
        self.assertIn('active_users', response.data['totalizers'])
        self.assertIn('monthly_sales', response.data['statistics'])
        self.assertEqual(len(response.data['statistics']['monthly_sales']), 6)
