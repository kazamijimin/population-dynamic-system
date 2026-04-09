from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HouseholdViewSet, PopulationRecordViewSet, 
    ZoneViewSet, ShopEventViewSet, SimulationSettingsViewSet
)

router = DefaultRouter()
router.register(r'zones', ZoneViewSet, basename='zone')
router.register(r'households', HouseholdViewSet, basename='household')
router.register(r'population', PopulationRecordViewSet, basename='population')
router.register(r'shop-events', ShopEventViewSet, basename='shop-event')
router.register(r'simulation-settings', SimulationSettingsViewSet, basename='simulation-settings')

urlpatterns = [
    path('', include(router.urls)),
]
