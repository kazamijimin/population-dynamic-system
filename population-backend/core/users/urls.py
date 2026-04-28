# population-backend/core/users/urls.py
from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Auth
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('current/', views.get_current_user, name='current'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('activity/', views.get_activity_history, name='activity-history'),
    
    # Admin
    path('admin/users/', views.admin_user_list, name='admin-user-list'),
    path('admin/users/<int:pk>/', views.admin_user_detail, name='admin-user-detail'),
    path('admin/users/<int:pk>/toggle_status/', views.toggle_user_status, name='admin-user-toggle-status'),
    path('admin/users/<int:pk>/reset_password/', views.reset_user_password, name='admin-user-reset-password'),
    path('admin/activity-logs/', views.activity_logs, name='admin-activity-logs'),
]
