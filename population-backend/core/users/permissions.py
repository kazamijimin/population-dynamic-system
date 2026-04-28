from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_superuser))

class IsManagerUser(permissions.BasePermission):
    """
    Allows access to manager and admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['manager', 'admin'] or request.user.is_superuser))

class ReadOnlyAcrossTiers(permissions.BasePermission):
    """
    Allows read-only access to all authenticated users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

