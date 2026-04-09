from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Household, PopulationRecord, Zone, ShopEvent, SimulationSettings
from .serializers import (
    HouseholdSerializer, PopulationRecordSerializer, 
    ZoneSerializer, ShopEventSerializer, SimulationSettingsSerializer
)

class ZoneViewSet(viewsets.ModelViewSet):
    """ViewSet for Physical Shop Zones (Counter, Seating, etc.)"""
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAuthenticated]

class ShopEventViewSet(viewsets.ModelViewSet):
    """ViewSet for Customer Flow Events (Arrival, Order, Departure)"""
    queryset = ShopEvent.objects.all()
    serializer_class = ShopEventSerializer
    permission_classes = [IsAuthenticated]

class HouseholdViewSet(viewsets.ModelViewSet):
    """ViewSet for Household CRUD operations"""
    queryset = Household.objects.all()
    serializer_class = HouseholdSerializer
    permission_classes = [IsAuthenticated]

class PopulationRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for PopulationRecord CRUD operations"""
    queryset = PopulationRecord.objects.all()
    serializer_class = PopulationRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = PopulationRecord.objects.all()
        household_id = self.request.query_params.get('household')
        zone_id = self.request.query_params.get('zone')
        status = self.request.query_params.get('status')

        if household_id:
            queryset = queryset.filter(household_id=household_id)
        if zone_id:
            queryset = queryset.filter(household__zone_id=zone_id)
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset
class SimulationSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for simulation configuration"""
    queryset = SimulationSettings.objects.all()
    serializer_class = SimulationSettingsSerializer
    permission_classes = [IsAuthenticated]
