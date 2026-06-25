from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from choreographies.models import Choreography, ChoreographyVideo
from sales.models import PurchaseAccess, Sale, SaleItem

User = get_user_model()


class PurchaseAccessTests(APITestCase):
    def setUp(self):
        self.professor = User.objects.create_user(
            username='prof@test.com', email='prof@test.com',
            password='testpass123', role=User.Role.PROFESSOR,
        )
        self.client_user = User.objects.create_user(
            username='client@test.com', email='client@test.com',
            password='testpass123', role=User.Role.CLIENT,
        )
        self.other = User.objects.create_user(
            username='other@test.com', email='other@test.com',
            password='testpass123', role=User.Role.CLIENT,
        )
        self.choreography = Choreography.objects.create(
            title='Test', song_name='Song', genre='salsa', difficulty='basic',
            price=50000, status=Choreography.Status.PUBLISHED, main_professor=self.professor,
        )
        for i in range(1, 4):
            ChoreographyVideo.objects.create(
                choreography=self.choreography, part_number=i, title=f'Parte {i}',
                video_url=f'https://example.com/{i}.mp4',
            )
        sale = Sale.objects.create(
            client=self.client_user, total_amount=50000, payment_method='card',
            status=Sale.Status.COMPLETED, billing_name='Test', billing_email='client@test.com',
        )
        SaleItem.objects.create(
            sale=sale, choreography=self.choreography, price=50000, choreography_title='Test',
        )
        self.purchase = PurchaseAccess.objects.create(
            client=self.client_user, choreography=self.choreography, sale=sale,
        )

    def test_client_can_view_own_purchase(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('purchase-detail', args=[self.purchase.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['choreography']['videos']), 3)

    def test_other_client_cannot_view_purchase(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.get(reverse('purchase-detail', args=[self.purchase.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_video_watched_updates_progress(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(
            reverse('purchase-watch', args=[self.purchase.id]),
            {'part_number': 2},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['videos_watched'], 2)
