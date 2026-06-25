"""
Signals que mantienen sales_count sincronizado con ventas completadas.

Se ejecutan al crear/eliminar SaleItem o cambiar el estado de una Sale.
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from choreographies.models import Choreography
from .models import Sale, SaleItem


def sync_choreography_sales_count(choreography_id):
    """Recalcula ventas reales desde ítems de ventas completadas."""
    count = SaleItem.objects.filter(
        sale__status=Sale.Status.COMPLETED,
        choreography_id=choreography_id,
    ).count()
    Choreography.objects.filter(pk=choreography_id).update(sales_count=count)


def sync_choreographies_for_sale(sale):
    if not sale.pk:
        return
    choreography_ids = sale.items.values_list('choreography_id', flat=True).distinct()
    for choreography_id in choreography_ids:
        sync_choreography_sales_count(choreography_id)


def sync_all_choreography_sales_counts():
    for choreography_id in Choreography.objects.values_list('pk', flat=True):
        sync_choreography_sales_count(choreography_id)


@receiver(post_save, sender=SaleItem)
def update_sales_count_on_item_save(sender, instance, **kwargs):
    if instance.choreography_id:
        sync_choreography_sales_count(instance.choreography_id)


@receiver(post_delete, sender=SaleItem)
def update_sales_count_on_item_delete(sender, instance, **kwargs):
    if instance.choreography_id:
        sync_choreography_sales_count(instance.choreography_id)


@receiver(post_save, sender=Sale)
def update_sales_count_on_sale_save(sender, instance, **kwargs):
    sync_choreographies_for_sale(instance)
