from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from users.permissions import IsClient
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from choreographies.models import Choreography


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(client=user)
    return cart


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def get_cart(request):
    cart = get_or_create_cart(request.user)
    return Response(CartSerializer(cart).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def add_to_cart(request):
    choreography_id = request.data.get('choreography_id')
    choreography = get_object_or_404(Choreography, id=choreography_id, status='published')
    cart = get_or_create_cart(request.user)

    if CartItem.objects.filter(cart=cart, choreography=choreography).exists():
        return Response({'error': 'Ya está en el carrito'}, status=400)

    item = CartItem.objects.create(cart=cart, choreography=choreography)
    return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsClient])
def remove_from_cart(request, item_id):
    cart = get_or_create_cart(request.user)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    item.delete()
    return Response({'message': 'Eliminado del carrito'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsClient])
def clear_cart(request):
    cart = get_or_create_cart(request.user)
    cart.items.all().delete()
    return Response({'message': 'Carrito vaciado'})
