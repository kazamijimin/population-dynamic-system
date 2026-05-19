from rest_framework import serializers
from .models import Household, PopulationRecord, Zone, ShopEvent, SimulationSettings, OperationalSchedule

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = '__all__'

class ShopEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopEvent
        fields = '__all__'

class PopulationRecordSerializer(serializers.ModelSerializer):
    """Serializer for individual guest/customer records"""
    age = serializers.ReadOnlyField()
    location_name = serializers.CharField(source='household.location_id', read_only=True)
    zone_name = serializers.CharField(source='household.zone.name', read_only=True)
    events = ShopEventSerializer(many=True, read_only=True, source='shop_events')

    class Meta:
        model = PopulationRecord
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 
            'birth_date', 'gender', 'civil_status', 
            'employment_status', 'household', 'location_name', 'zone_name',
            'is_voter', 'age', 'status', 'is_manually_updated', 'created_at', 'events'
        ]

class HouseholdSerializer(serializers.ModelSerializer):
    """Serializer for Households, including their members"""
    members = PopulationRecordSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(source='members.count', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = Household
        fields = [
            'id', 'location_id', 'zone', 'zone_name',
            'area_type', 'section_label', 'status', 'capacity',
            'is_active', 'is_reservable', 'priority', 'notes',
            'member_count', 'members', 'created_at'
        ]
class SimulationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationSettings
        fields = "__all__"

class OperationalScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationalSchedule
        fields = '__all__'
