from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, HistoricalDataViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'historical-data', HistoricalDataViewSet, basename='historical-data')

urlpatterns = [
    path('', include(router.urls)),
]
