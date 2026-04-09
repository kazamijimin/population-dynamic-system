from rest_framework import serializers
from .models import Report, HistoricalData

class ReportSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'type', 'status', 'description',
            'data', 'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class HistoricalDataSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = HistoricalData
        fields = [
            'id', 'filename', 'data_type', 'row_count', 'data', 
            'metadata', 'uploaded_by', 'uploaded_by_username', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by', 'row_count']
