from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HouseholdViewSet, PopulationRecordViewSet, ZoneViewSet, LifeEventViewSet

router = DefaultRouter()
router.register(r'zones', ZoneViewSet, basename='zone')
router.register(r'households', HouseholdViewSet, basename='household')
router.register(r'population', PopulationRecordViewSet, basename='population')
router.register(r'life-events', LifeEventViewSet, basename='life-event')

urlpatterns = [
    path('', include(router.urls)),
]
