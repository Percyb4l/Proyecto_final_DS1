from rest_framework import serializers
from .models import Sale, SaleItem, PurchaseAccess
from choreographies.serializers import ChoreographySerializer


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['id', 'choreography_title', 'price']


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'total_amount', 'payment_method', 'status',
            'billing_name', 'billing_email', 'billing_phone', 'billing_address',
            'items', 'created_at',
        ]


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Sale.PaymentMethod.choices)
    billing_name = serializers.CharField(max_length=200)
    billing_email = serializers.EmailField()
    billing_phone = serializers.CharField(required=False, allow_blank=True)
    billing_address = serializers.CharField(required=False, allow_blank=True)


class PurchaseAccessSerializer(serializers.ModelSerializer):
    choreography = ChoreographySerializer(read_only=True)
    progress_percent = serializers.ReadOnlyField()

    class Meta:
        model = PurchaseAccess
        fields = ['id', 'choreography', 'videos_watched', 'progress_percent', 'purchased_at']


class PurchaseAccessDetailSerializer(PurchaseAccessSerializer):
    """Incluye videos solo para compras verificadas del cliente."""

    class Meta(PurchaseAccessSerializer.Meta):
        fields = PurchaseAccessSerializer.Meta.fields


class MarkVideoWatchedSerializer(serializers.Serializer):
    part_number = serializers.IntegerField(min_value=1)
