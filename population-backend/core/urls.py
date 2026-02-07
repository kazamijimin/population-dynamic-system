# population-backend/core/urls.py
from django.urls import path, include
from .views import health

urlpatterns = [
    path('health/', health),
    path('auth/', include('core.users.urls')),
    path('inventory/', include('core.inventory.urls')),
]