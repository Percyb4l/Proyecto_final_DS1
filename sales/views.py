from decimal import Decimal
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404

from users.permissions import IsAdminOrDirector, IsClient
from choreographies.models import ChoreographyVideo
from .models import Sale, SaleItem, PurchaseAccess
from .serializers import (
    SaleSerializer, CheckoutSerializer, PurchaseAccessSerializer,
    PurchaseAccessDetailSerializer, MarkVideoWatchedSerializer,
)
from cart.models import Cart


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def checkout(request):
    serializer = CheckoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        cart = Cart.objects.get(client=request.user)
    except Cart.DoesNotExist:
        return Response({'error': 'Carrito vacío'}, status=400)

    items = cart.items.select_related('choreography').all()
    if not items:
        return Response({'error': 'Carrito vacío'}, status=400)

    with transaction.atomic():
        subtotal = sum(item.choreography.price for item in items)
        tax = (subtotal * Decimal('0.19')).quantize(Decimal('0.01'))
        total = subtotal + tax
        sale = Sale.objects.create(
            client=request.user,
            total_amount=total,
            payment_method=data['payment_method'],
            status=Sale.Status.COMPLETED,
            billing_name=data['billing_name'],
            billing_email=data['billing_email'],
            billing_phone=data.get('billing_phone', ''),
            billing_address=data.get('billing_address', ''),
        )

        purchase_ids = []
        for item in items:
            choreo = item.choreography
            SaleItem.objects.create(
                sale=sale,
                choreography=choreo,
                price=choreo.price,
                choreography_title=choreo.title,
            )
            access, _ = PurchaseAccess.objects.get_or_create(
                client=request.user,
                choreography=choreo,
                defaults={'sale': sale},
            )
            if access.sale_id != sale.id:
                access.sale = sale
                access.save(update_fields=['sale'])
            purchase_ids.append({
                'id': access.id,
                'title': choreo.title,
                'choreography_id': choreo.id,
            })

        cart.items.all().delete()

        user = request.user
        if data.get('first_name'):
            user.first_name = data['first_name']
        if data.get('last_name'):
            user.last_name = data['last_name']
        if data.get('billing_phone'):
            user.phone = data['billing_phone']
        if data.get('billing_address'):
            user.billing_address = data['billing_address']
        if data.get('city'):
            user.city = data['city']
        if data.get('department'):
            user.department = data['department']
        if data.get('country'):
            user.country = data['country']
        user.save()

    return Response({
        'sale': SaleSerializer(sale).data,
        'subtotal': float(subtotal),
        'tax': float(tax),
        'total': float(total),
        'purchases': purchase_ids,
    }, status=status.HTTP_201_CREATED)


def _client_purchase_or_404(user, purchase_id):
    return get_object_or_404(
        PurchaseAccess.objects.select_related('choreography').prefetch_related('choreography__videos'),
        id=purchase_id,
        client=user,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def purchase_detail(request, purchase_id):
    purchase = _client_purchase_or_404(request.user, purchase_id)
    return Response(PurchaseAccessDetailSerializer(purchase).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def mark_video_watched(request, purchase_id):
    purchase = _client_purchase_or_404(request.user, purchase_id)
    serializer = MarkVideoWatchedSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    part_number = serializer.validated_data['part_number']

    get_object_or_404(
        ChoreographyVideo,
        choreography=purchase.choreography,
        part_number=part_number,
    )

    total_videos = purchase.choreography.video_count
    purchase.videos_watched = min(total_videos, max(purchase.videos_watched, part_number))
    purchase.save(update_fields=['videos_watched'])

    return Response(PurchaseAccessDetailSerializer(purchase).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def my_sales(request):
    sales = Sale.objects.filter(client=request.user).prefetch_related('items')
    return Response(SaleSerializer(sales, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def my_purchases(request):
    purchases = PurchaseAccess.objects.filter(client=request.user).select_related('choreography')
    return Response(PurchaseAccessSerializer(purchases, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminOrDirector])
def all_sales(request):
    sales = Sale.objects.all().prefetch_related('items').select_related('client')[:50]
    data = SaleSerializer(sales, many=True).data
    for i, sale in enumerate(sales):
        data[i]['client_name'] = sale.client.full_name
    return Response(data)
