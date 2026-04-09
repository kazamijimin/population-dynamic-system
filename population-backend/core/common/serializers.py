from rest_framework import serializers
from .models import Household, PopulationRecord, Zone, LifeEvent

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = '__all__'

class LifeEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeEvent
        fields = '__all__'

class PopulationRecordSerializer(serializers.ModelSerializer):
    """Serializer for individual population members"""
    age = serializers.ReadOnlyField()
    household_name = serializers.CharField(source='household.house_number', read_only=True)
    zone_name = serializers.CharField(source='household.zone.name', read_only=True)
    events = LifeEventSerializer(many=True, read_only=True, source='life_events')

    class Meta:
        model = PopulationRecord
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 
            'birth_date', 'gender', 'civil_status', 
            'employment_status', 'household', 'household_name', 'zone_name',
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
            'id', 'house_number', 'address', 'zone', 'zone_name',
            'contact_number', 'member_count', 'members', 'created_at'
        ]
