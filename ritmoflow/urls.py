"""
Rutas principales del API REST de RITMOFLOW bajo /api/.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/captcha/', include('captcha.urls')),
    path('api/auth/', include('users.urls')),
    path('api/choreographies/', include('choreographies.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/health/', lambda r: __import__('django.http', fromlist=['JsonResponse']).JsonResponse({'status': 'ok', 'app': 'RITMOFLOW'})),
]
