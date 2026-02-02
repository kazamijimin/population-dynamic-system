# population-backend/core/users/apps.py
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.users'  # Full Python path
    label = 'users'      # Add this - the app label Django uses