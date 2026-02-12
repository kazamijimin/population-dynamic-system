from django.db import models
from django.conf import settings


class Report(models.Model):
    """Report model for generated analytics reports"""
    
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
    data = models.JSONField(blank=True, null=True)  # Store report data as JSON
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
        return f"{self.title} ({self.get_type_display()})"