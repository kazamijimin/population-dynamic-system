from rest_framework import serializers
from .models import SimulationParameter

class SimulationParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationParameter
        fields = '__all__'
        read_only_fields = ('updated_by', 'last_updated')
