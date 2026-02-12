from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for Report CRUD operations"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        queryset = Report.objects.all()
        
        # Filter by type if provided
        report_type = self.request.query_params.get('type')
        if report_type:
            queryset = queryset.filter(type=report_type)
        
        # Filter by status if provided
        report_status = self.request.query_params.get('status')
        if report_status:
            queryset = queryset.filter(status=report_status)
        
        return queryset