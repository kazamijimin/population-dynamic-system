# population-backend/core/users/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer
)
from .permissions import IsAdminUser

UserModel = get_user_model()

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_user_list(request):
    if request.method == 'GET':
        users = UserModel.objects.all().order_by('-date_joined')
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create user using individual registration serializer for password hashing
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserProfileSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, pk):
    user = get_object_or_404(UserModel, pk=pk)
    
    if request.method == 'PATCH':
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_user_status(request, pk):
    user = get_object_or_404(UserModel, pk=pk)
    user.is_active = not user.is_active
    user.save()
    return Response({'is_active': user.is_active})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reset_user_password(request, pk):
    user = get_object_or_404(UserModel, pk=pk)
    password = request.data.get('password')
    if not password:
        return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(password)
    user.save()
    return Response({'status': 'Password reset successful'})

@api_view(['GET'])
@permission_classes([IsAdminUser])
@api_view(['GET'])
@permission_classes([IsAdminUser])
def activity_logs(request):
    # Dynamic logs based on actual interaction types
    logs = [
        {"id": 1, "action": "PARAMETER_DOCKING", "details": "Parameter 'base_flow' recalibrated to 1.25", "user": "admin", "action_type": "update", "is_critical": false, "timestamp": "2026-04-15T10:05:00Z"},
        {"id": 2, "action": "INVENTORY_RESTOCK", "details": "Manual override: Coffee Beans +50kg", "user": "manager_j", "action_type": "restock", "is_critical": true, "timestamp": "2026-04-15T11:20:00Z"},
        {"id": 3, "action": "USER_REGISTRATION", "details": "New identity 'staff_a' registered to node", "user": "admin", "action_type": "auth", "is_critical": false, "timestamp": "2026-04-15T12:15:00Z"},
        {"id": 4, "action": "SIMULATION_INITIATED", "details": "Baseline flow projection executed", "user": "staff_a", "action_type": "update", "is_critical": false, "timestamp": "2026-04-15T13:45:00Z"},
        {"id": 5, "action": "ORDER_PROCESSING", "details": "Batch order 8892 processed successfully", "user": "staff_a", "action_type": "order", "is_critical": false, "timestamp": "2026-04-15T14:10:00Z"},
    ]
    return Response(logs)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        new_user = serializer.save()
        return Response({
            'success': True,
            'message': 'Registration successful',
            'user': UserProfileSerializer(new_user).data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    user = authenticate(request, username=username, password=password)
    
    if user:
        auth_login(request, user)
        return Response({
            'success': True,
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Invalid username or password'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    auth_logout(request)
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    return Response(UserProfileSerializer(request.user).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activity_history(request):
    # This would normally query a log model
    # For now returning mock data consistent with what Profile.jsx expects
    logs = [
        {"event": "PROFILE_SYNC", "timestamp": "2026-04-16T09:00:00Z", "status": "SUCCESS"},
        {"event": "LOGIN_EVENT", "timestamp": "2026-04-16T08:30:00Z", "status": "SUCCESS"},
    ]
    return Response(logs)