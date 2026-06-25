"""Rutas de ventas, checkout y acceso a compras bajo /api/sales/."""
from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('my/', views.my_sales, name='my-sales'),
    path('purchases/', views.my_purchases, name='my-purchases'),
    path('purchases/<int:purchase_id>/', views.purchase_detail, name='purchase-detail'),
    path('purchases/<int:purchase_id>/watch/', views.mark_video_watched, name='purchase-watch'),
    path('all/', views.all_sales, name='all-sales'),
]
