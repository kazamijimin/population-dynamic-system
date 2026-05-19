from django.urls import path, include
from .views import csrf, health

urlpatterns = [
    path('csrf/', csrf),
    path('health/', health),
    path('auth/', include('core.users.urls')),
    path('inventory/', include('core.inventory.urls')),
    path('common/', include('core.common.urls')),
    path('analytics/', include('core.analytics.urls')),
    path('simulation/', include('core.simulation.urls')),
]
