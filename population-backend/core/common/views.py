from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Household, PopulationRecord, Zone, LifeEvent
from .serializers import HouseholdSerializer, PopulationRecordSerializer, ZoneSerializer, LifeEventSerializer

class ZoneViewSet(viewsets.ModelViewSet):
    """ViewSet for Geographic Zone CRUD operations"""
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAuthenticated]

class LifeEventViewSet(viewsets.ModelViewSet):
    """ViewSet for Life Events (Birth, Death, Migration)"""
    queryset = LifeEvent.objects.all()
    serializer_class = LifeEventSerializer
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
