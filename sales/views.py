from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import Sale, SaleItem, PurchaseAccess
from .serializers import SaleSerializer, CheckoutSerializer, PurchaseAccessSerializer
from cart.models import Cart


@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
        total = sum(item.choreography.price for item in items)
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

        for item in items:
            choreo = item.choreography
            SaleItem.objects.create(
                sale=sale,
                choreography=choreo,
                price=choreo.price,
                choreography_title=choreo.title,
            )
            PurchaseAccess.objects.get_or_create(
                client=request.user,
                choreography=choreo,
                defaults={'sale': sale},
            )
            choreo.sales_count += 1
            choreo.save(update_fields=['sales_count'])

        cart.items.all().delete()

        user = request.user
        if data.get('billing_phone'):
            user.phone = data['billing_phone']
        if data.get('billing_address'):
            user.billing_address = data['billing_address']
        user.save()

    return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_sales(request):
    sales = Sale.objects.filter(client=request.user).prefetch_related('items')
    return Response(SaleSerializer(sales, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_purchases(request):
    purchases = PurchaseAccess.objects.filter(client=request.user).select_related('choreography')
    return Response(PurchaseAccessSerializer(purchases, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_sales(request):
    from users.models import User
    if request.user.role not in (User.Role.ADMIN, User.Role.DIRECTOR):
        return Response({'error': 'Sin permisos'}, status=403)
    sales = Sale.objects.all().prefetch_related('items').select_related('client')[:50]
    data = SaleSerializer(sales, many=True).data
    for i, sale in enumerate(sales):
        data[i]['client_name'] = sale.client.full_name
    return Response(data)
