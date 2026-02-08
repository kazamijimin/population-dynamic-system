from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsAdmin, IsManager


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update"]:
            permission_classes = [IsAuthenticated, IsManager]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, IsAdmin]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]