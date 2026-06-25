from django.contrib.auth import get_user_model
from django.test import TestCase

from choreographies.models import Choreography
from sales.models import Sale, SaleItem
from sales.signals import sync_all_choreography_sales_counts

User = get_user_model()


class ChoreographySalesCountSignalTests(TestCase):
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
        self.choreography = Choreography.objects.create(
            title='Test Choreo',
            song_name='Test Song',
            genre='salsa',
            difficulty='basic',
            price=50000,
            status=Choreography.Status.PUBLISHED,
            main_professor=self.professor,
        )

    def test_sales_count_updates_when_sale_item_is_created(self):
        sale = Sale.objects.create(
            client=self.client_user,
            total_amount=50000,
            payment_method='card',
            status=Sale.Status.COMPLETED,
            billing_name='Cliente Test',
            billing_email='client@test.com',
        )
        SaleItem.objects.create(
            sale=sale,
            choreography=self.choreography,
            price=50000,
            choreography_title=self.choreography.title,
        )

        self.choreography.refresh_from_db()
        self.assertEqual(self.choreography.sales_count, 1)

    def test_sales_count_ignores_pending_sales(self):
        sale = Sale.objects.create(
            client=self.client_user,
            total_amount=50000,
            payment_method='card',
            status=Sale.Status.PENDING,
            billing_name='Cliente Test',
            billing_email='client@test.com',
        )
        SaleItem.objects.create(
            sale=sale,
            choreography=self.choreography,
            price=50000,
            choreography_title=self.choreography.title,
        )

        self.choreography.refresh_from_db()
        self.assertEqual(self.choreography.sales_count, 0)

    def test_sales_count_updates_when_sale_is_completed(self):
        sale = Sale.objects.create(
            client=self.client_user,
            total_amount=50000,
            payment_method='card',
            status=Sale.Status.PENDING,
            billing_name='Cliente Test',
            billing_email='client@test.com',
        )
        SaleItem.objects.create(
            sale=sale,
            choreography=self.choreography,
            price=50000,
            choreography_title=self.choreography.title,
        )

        sale.status = Sale.Status.COMPLETED
        sale.save()

        self.choreography.refresh_from_db()
        self.assertEqual(self.choreography.sales_count, 1)

    def test_sales_count_decreases_when_sale_item_is_deleted(self):
        sale = Sale.objects.create(
            client=self.client_user,
            total_amount=50000,
            payment_method='card',
            status=Sale.Status.COMPLETED,
            billing_name='Cliente Test',
            billing_email='client@test.com',
        )
        item = SaleItem.objects.create(
            sale=sale,
            choreography=self.choreography,
            price=50000,
            choreography_title=self.choreography.title,
        )

        item.delete()
        self.choreography.refresh_from_db()
        self.assertEqual(self.choreography.sales_count, 0)

    def test_sync_all_resets_counts_from_completed_sales(self):
        Choreography.objects.filter(pk=self.choreography.pk).update(sales_count=99)
        sale = Sale.objects.create(
            client=self.client_user,
            total_amount=50000,
            payment_method='card',
            status=Sale.Status.COMPLETED,
            billing_name='Cliente Test',
            billing_email='client@test.com',
        )
        SaleItem.objects.create(
            sale=sale,
            choreography=self.choreography,
            price=50000,
            choreography_title=self.choreography.title,
        )

        sync_all_choreography_sales_counts()
        self.choreography.refresh_from_db()
        self.assertEqual(self.choreography.sales_count, 1)
