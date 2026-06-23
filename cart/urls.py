from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_cart, name='cart'),
    path('add/', views.add_to_cart, name='cart-add'),
    path('items/<int:item_id>/', views.remove_from_cart, name='cart-remove'),
    path('clear/', views.clear_cart, name='cart-clear'),
]
