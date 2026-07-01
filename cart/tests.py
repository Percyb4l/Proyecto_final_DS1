"""Pruebas del carrito de compras."""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from cart.models import Cart, CartItem
from choreographies.models import Choreography

User = get_user_model()


class CartTests(APITestCase):
    def setUp(self):
        self.professor = User.objects.create_user(
            username='prof@test.com',
            email='prof@test.com',
            password='testpass123',
            role=User.Role.PROFESSOR,
        )
        self.client_user = User.objects.create_user(
            username='client@test.com',
            email='client@test.com',
            password='testpass123',
            role=User.Role.CLIENT,
        )
        self.admin = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123',
            role=User.Role.ADMIN,
        )
        self.choreography = Choreography.objects.create(
            title='Cart Choreo',
            song_name='Song',
            genre='salsa',
            difficulty='basic',
            price=75000,
            status=Choreography.Status.PUBLISHED,
            main_professor=self.professor,
        )

    def test_client_can_add_item_to_cart(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(
            reverse('cart-add'),
            {'choreography_id': self.choreography.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        cart = Cart.objects.get(client=self.client_user)
        self.assertEqual(cart.items.count(), 1)

    def test_admin_cannot_add_to_cart(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            reverse('cart-add'),
            {'choreography_id': self.choreography.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_item_is_rejected(self):
        self.client.force_authenticate(user=self.client_user)
        self.client.post(
            reverse('cart-add'),
            {'choreography_id': self.choreography.id},
            format='json',
        )
        response = self.client.post(
            reverse('cart-add'),
            {'choreography_id': self.choreography.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_client_can_view_cart_total(self):
        cart = Cart.objects.create(client=self.client_user)
        CartItem.objects.create(cart=cart, choreography=self.choreography)
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('cart'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 1)
        self.assertEqual(float(response.data['total']), 75000.0)

    def test_client_can_remove_cart_item(self):
        cart = Cart.objects.create(client=self.client_user)
        item = CartItem.objects.create(cart=cart, choreography=self.choreography)
        self.client.force_authenticate(user=self.client_user)
        response = self.client.delete(reverse('cart-remove', args=[item.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(CartItem.objects.filter(id=item.id).exists())
