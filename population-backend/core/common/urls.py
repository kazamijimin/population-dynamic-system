from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HouseholdViewSet, PopulationRecordViewSet, 
    ZoneViewSet, ShopEventViewSet, SimulationSettingsViewSet, OperationalScheduleViewSet,
    stream_suggestions
)

router = DefaultRouter()
router.register(r'households', HouseholdViewSet)
router.register(r'population', PopulationRecordViewSet)
router.register(r'zones', ZoneViewSet)
router.register(r'shop-events', ShopEventViewSet)
router.register(r'simulation-settings', SimulationSettingsViewSet)
router.register(r'schedules', OperationalScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stream-suggestions/', stream_suggestions, name='stream-suggestions'),
]
