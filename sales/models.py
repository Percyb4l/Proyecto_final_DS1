from django.db import models
from django.conf import settings
from choreographies.models import Choreography


class Sale(models.Model):
    class PaymentMethod(models.TextChoices):
        CARD = 'card', 'Tarjeta'
        PSE = 'pse', 'PSE'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pendiente'
        COMPLETED = 'completed', 'Completada'
        CANCELLED = 'cancelled', 'Cancelada'

    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='sales')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    billing_name = models.CharField(max_length=200)
    billing_email = models.EmailField()
    billing_phone = models.CharField(max_length=20, blank=True)
    billing_address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    choreography = models.ForeignKey(Choreography, on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    choreography_title = models.CharField(max_length=200)

    def __str__(self):
        return f'{self.choreography_title} - ${self.price}'


class PurchaseAccess(models.Model):
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    choreography = models.ForeignKey(Choreography, on_delete=models.PROTECT)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='accesses')
    videos_watched = models.PositiveIntegerField(default=0)
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['client', 'choreography']

    @property
    def progress_percent(self):
        total = self.choreography.video_count
        if total == 0:
            return 0
        return min(100, int((self.videos_watched / total) * 100))
