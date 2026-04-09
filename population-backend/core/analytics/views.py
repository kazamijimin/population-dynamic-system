from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Report, HistoricalData
from .serializers import ReportSerializer, HistoricalDataSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class HistoricalDataViewSet(viewsets.ModelViewSet):
    queryset = HistoricalData.objects.all()
    serializer_class = HistoricalDataSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        data = self.request.data.get('data', [])
        row_count = len(data) if isinstance(data, list) else 0
        serializer.save(uploaded_by=self.request.user, row_count=row_count)
