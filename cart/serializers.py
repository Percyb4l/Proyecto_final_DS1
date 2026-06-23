from rest_framework import serializers
from .models import Cart, CartItem
from choreographies.serializers import ChoreographySerializer


class CartItemSerializer(serializers.ModelSerializer):
    choreography = ChoreographySerializer(read_only=True)
    choreography_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'choreography', 'choreography_id', 'subtotal', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']
