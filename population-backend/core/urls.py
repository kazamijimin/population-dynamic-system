from django.urls import path, include
from .views import health

urlpatterns = [
    path('health/', health),
    path('auth/', include('core.users.urls')),
    path('inventory/', include('core.inventory.urls')),
    path('common/', include('core.common.urls')),
    path('analytics/', include('core.analytics.urls')),
]
