from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SimulationParameterViewSet

router = DefaultRouter()
router.register(r'parameters', SimulationParameterViewSet, basename='simulation-parameter')

urlpatterns = [
    path('', include(router.urls)),
]
