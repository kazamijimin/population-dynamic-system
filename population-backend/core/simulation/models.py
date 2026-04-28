from django.db import models
from django.conf import settings

class SimulationParameter(models.Model):
    PARAMETER_TYPES = [
        ('customer_flow', 'Customer Flow'),
        ('demand_growth', 'Demand Growth'),
        ('operational_cost', 'Operational Cost'),
    ]

    name = models.CharField(max_length=100)
    key = models.SlugField(max_length=100, unique=True)
    value = models.FloatField()
    unit = models.CharField(max_length=20, blank=True)
    parameter_type = models.CharField(max_length=20, choices=PARAMETER_TYPES, default='customer_flow')
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.key}): {self.value}{self.unit}"

    class Meta:
        verbose_name = "Simulation Parameter"
        verbose_name_plural = "Simulation Parameters"
