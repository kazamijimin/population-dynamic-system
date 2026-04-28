import json
import time
import random
from django.http import StreamingHttpResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Household, PopulationRecord, Zone, ShopEvent, SimulationSettings, OperationalSchedule
from .serializers import (
    HouseholdSerializer, PopulationRecordSerializer, 
    ZoneSerializer, ShopEventSerializer, SimulationSettingsSerializer, OperationalScheduleSerializer
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

class OperationalScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for Daily Shop Operations"""
    queryset = OperationalSchedule.objects.all()
    serializer_class = OperationalScheduleSerializer
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@permission_classes([AllowAny])
def stream_suggestions(request):
    role = request.query_params.get('role', 'staff')
    
    def event_stream():
        while True:
            # Generate simulated real-time insights based on role
            suggestions = []
            if role == 'admin':
                suggestions = [
                    {"title": f"Load Node_{random.randint(1,10)}", "desc": f"Increased traffic in sector {random.choice(['A','B','C'])}. Efficiency at {random.randint(60,95)}%", "color": "violet"},
                    {"title": "Sync Wave", "desc": "Database replication lag detected. Optimizing cache.", "color": "fuchsia"}
                ]
            elif role == 'manager':
                suggestions = [
                    {"title": "Low Stock Alert", "desc": f"{random.choice(['Milk', 'Sugar', 'Cups'])} low in {random.choice(['North', 'South'])} wing.", "color": "emerald"},
                    {"title": "Flow Peak", "desc": f"Expected surge in {random.randint(5, 15)} mins.", "color": "teal"}
                ]
            else: # staff
                items = ['Brewing Espresso', 'Milk steaming', 'Whipping cream', 'Syrup refill']
                suggestions = [
                    {"title": "Active Priority", "desc": f"Focus on: {random.choice(items)}. Queue +{random.randint(1,4)}", "color": "amber"},
                    {"title": "Task Update", "desc": f"Cleaning cycle {random.randint(10,90)}% remaining.", "color": "orange"}
                ]

            data = json.dumps({"suggestions": suggestions})
            yield f"data: {data}\n\n"
            time.sleep(10)  # Pulse every 10 seconds

    return StreamingHttpResponse(event_stream(), content_type='text/event-stream')
