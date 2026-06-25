"""
Modelos del carrito de compras persistente por cliente.

Un carrito por cliente; cada ítem es una coreografía publicada.
"""
from django.db import models
from django.conf import settings
from choreographies.models import Choreography


class Cart(models.Model):
    """Carrito único asociado a cada cliente."""

    client = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart'
    )
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        """Suma de precios de todas las coreografías en el carrito."""
        return sum(item.subtotal for item in self.items.all())

    @property
    def item_count(self):
        """Cantidad de ítems en el carrito."""
        return self.items.count()


class CartItem(models.Model):
    """Coreografía agregada al carrito; no se permite duplicar la misma."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    choreography = models.ForeignKey(Choreography, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['cart', 'choreography']

    @property
    def subtotal(self):
        return self.choreography.price
