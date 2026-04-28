from rest_framework import viewsets, permissions
from .models import SimulationParameter
from .serializers import SimulationParameterSerializer
from core.users.permissions import IsAdminUser, IsManagerUser, ReadOnlyAcrossTiers

class SimulationParameterViewSet(viewsets.ModelViewSet):
    queryset = SimulationParameter.objects.all()
    serializer_class = SimulationParameterSerializer
    
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
