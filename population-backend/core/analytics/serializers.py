from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'type', 'status', 'description',
            'data', 'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']