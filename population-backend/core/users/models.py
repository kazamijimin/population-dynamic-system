# population-backend/core/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_ROLES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
    ]
    
    role = models.CharField(max_length=20, choices=USER_ROLES, default='manager')
    email = models.EmailField(unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'custom_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"