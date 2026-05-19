from rest_framework import viewsets, permissions
from .models import SimulationParameter
from .serializers import SimulationParameterSerializer
from core.users.permissions import IsAdminUser, IsManagerUser, ReadOnlyAcrossTiers

DEFAULT_PARAMETERS = [
    {'name': 'Base Customer Flow', 'key': 'base_customer_flow', 'value': 1.0, 'unit': 'x', 'parameter_type': 'customer_flow', 'is_active': True},
    {'name': 'Weekend Sales Multiplier', 'key': 'weekend_sales_multiplier', 'value': 1.35, 'unit': 'x', 'parameter_type': 'demand_growth', 'is_active': True},
    {'name': 'Vacation Sales Multiplier', 'key': 'vacation_sales_multiplier', 'value': 1.55, 'unit': 'x', 'parameter_type': 'demand_growth', 'is_active': True},
    {'name': 'Promo Sales Multiplier', 'key': 'promo_sales_multiplier', 'value': 1.8, 'unit': 'x', 'parameter_type': 'demand_growth', 'is_active': True},
    {'name': 'Rainy Weather Multiplier', 'key': 'weather_rain_multiplier', 'value': 0.85, 'unit': 'x', 'parameter_type': 'customer_flow', 'is_active': True},
    {'name': 'Holiday Sales Multiplier', 'key': 'holiday_sales_multiplier', 'value': 2.0, 'unit': 'x', 'parameter_type': 'demand_growth', 'is_active': True},
]


def ensure_default_parameters():
    for parameter in DEFAULT_PARAMETERS:
        SimulationParameter.objects.get_or_create(
            key=parameter['key'],
            defaults=parameter,
        )


class SimulationParameterViewSet(viewsets.ModelViewSet):
    queryset = SimulationParameter.objects.all()
    serializer_class = SimulationParameterSerializer

    def get_queryset(self):
        ensure_default_parameters()
        return SimulationParameter.objects.all()
    
    def get_permissions(self):
        """
        Operational (Staff): Read Only
        Tactical (Manager): Read/Write (Parameters)
        Strategic (Admin): Full Deletion/Creation
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [ReadOnlyAcrossTiers]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsManagerUser]
        elif self.action in ['create', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
