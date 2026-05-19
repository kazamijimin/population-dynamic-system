import csv
import io

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

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')

        if uploaded_file:
            try:
                decoded_file = uploaded_file.read().decode('utf-8-sig')
                rows = list(csv.DictReader(io.StringIO(decoded_file)))
            except UnicodeDecodeError:
                return Response({'file': ['Upload a UTF-8 CSV file.']}, status=status.HTTP_400_BAD_REQUEST)

            if not rows:
                return Response({'file': ['CSV file is empty or missing headers.']}, status=status.HTTP_400_BAD_REQUEST)

            historical_data = HistoricalData.objects.create(
                filename=uploaded_file.name,
                data_type=request.data.get('data_type', 'sales'),
                data=rows,
                metadata={'source': 'csv_upload', 'columns': list(rows[0].keys())},
                row_count=len(rows),
                uploaded_by=request.user,
            )
            return Response(HistoricalDataSerializer(historical_data).data, status=status.HTTP_201_CREATED)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        data = self.request.data.get('data', [])
        row_count = len(data) if isinstance(data, list) else 0
        serializer.save(uploaded_by=self.request.user, row_count=row_count)
