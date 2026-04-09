from django.db import models
from django.conf import settings

class Report(models.Model):
    REPORT_TYPES = [
        ('inventory', 'Inventory Report'),
        ('sales', 'Sales Report'),
        ('usage', 'Usage Report'),
        ('forecast', 'Forecast Report'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=REPORT_TYPES, default='inventory')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True, null=True)
    data = models.JSONField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f'{self.title} ({self.get_type_display()})'

class HistoricalData(models.Model):
    DATA_TYPES = [
        ('sales', 'Historical Sales'),
        ('inventory', 'Historical Inventory'),
        ('weather', 'Weather Data'),
        ('events', 'Local Events'),
    ]
    filename = models.CharField(max_length=255)
    data_type = models.CharField(max_length=50, choices=DATA_TYPES)
    row_count = models.PositiveIntegerField(default=0)
    data = models.JSONField()
    metadata = models.JSONField(default=dict, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name_plural = 'Historical Data'
    def __str__(self):
        return f'{self.filename} ({self.data_type})'
