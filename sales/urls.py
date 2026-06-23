from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('my/', views.my_sales, name='my-sales'),
    path('purchases/', views.my_purchases, name='my-purchases'),
    path('all/', views.all_sales, name='all-sales'),
]
