"""Pruebas de registro, login y endpoints públicos de autenticación."""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from captcha.models import CaptchaStore

User = get_user_model()


class RegisterTests(APITestCase):
    def test_register_creates_client_user(self):
        response = self.client.post(
            reverse('register'),
            {
                'email': 'nuevo.cliente@test.com',
                'password': 'testpass123',
                'password_confirm': 'testpass123',
                'first_name': 'Nuevo',
                'last_name': 'Cliente',
                'document_type': 'CC',
                'document_number': '1234567890',
                'phone': '3001112233',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], User.Role.CLIENT)

        user = User.objects.get(email='nuevo.cliente@test.com')
        self.assertEqual(user.role, User.Role.CLIENT)
        self.assertTrue(user.check_password('testpass123'))

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(
            username='dup@test.com',
            email='dup@test.com',
            password='testpass123',
            role=User.Role.CLIENT,
        )
        response = self.client.post(
            reverse('register'),
            {
                'email': 'dup@test.com',
                'password': 'testpass123',
                'password_confirm': 'testpass123',
                'first_name': 'Dup',
                'last_name': 'User',
                'document_type': 'CC',
                'document_number': '9876543210',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rejects_password_mismatch(self):
        response = self.client.post(
            reverse('register'),
            {
                'email': 'mismatch@test.com',
                'password': 'testpass123',
                'password_confirm': 'otrapass',
                'first_name': 'Test',
                'last_name': 'User',
                'document_type': 'CC',
                'document_number': '1122334455',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='login@test.com',
            email='login@test.com',
            password='testpass123',
            role=User.Role.CLIENT,
            first_name='Login',
            last_name='Test',
        )

    def _valid_captcha_payload(self):
        key = CaptchaStore.generate_key()
        captcha = CaptchaStore.objects.get(hashkey=key)
        return {'captcha_key': key, 'captcha_value': captcha.response}

    def test_login_with_valid_credentials_and_captcha(self):
        payload = {
            'email': 'login@test.com',
            'password': 'testpass123',
            **self._valid_captcha_payload(),
        }
        response = self.client.post(reverse('login'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'login@test.com')

    def test_login_rejects_invalid_captcha(self):
        response = self.client.post(
            reverse('login'),
            {
                'email': 'login@test.com',
                'password': 'testpass123',
                'captcha_key': 'invalid',
                'captcha_value': 'wrong',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_rejects_wrong_password(self):
        payload = {
            'email': 'login@test.com',
            'password': 'wrongpassword',
            **self._valid_captcha_payload(),
        }
        response = self.client.post(reverse('login'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CaptchaTests(APITestCase):
    def test_captcha_endpoint_returns_key_and_image(self):
        response = self.client.get(reverse('captcha'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('captcha_key', response.data)
        self.assertIn('captcha_image', response.data)
