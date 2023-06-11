from rest_framework import permissions


class IsUserVerifiedAndPasswordChanged(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_verified and request.user.is_password_changed)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class IsStudentOwnerOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(obj.student.username == request.user.username)


class IsAdminOrLevelCordUser(permissions.BasePermission):
    """
    Allow access only to admins, level_cord users and student's personal record
    """

    def has_permission(self, request, view):
        if 'me' in request.resolver_match.url_name:
            return True
        return bool(request.user and
                    (request.user.role == 'LEVEL_CORD' or
                     request.user.role == 'ADMIN'))


class IsAdminOrLevelCordUserOrStudentCreate(permissions.BasePermission):
    """
    Allow access only to admins and level_cord users
    """
    def has_permission(self, request, view):
        if request.method == 'POST' and (request.user.role == 'LEVEL_CORD' or request.user.role == 'ADMIN'):
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST' and request.user.role == 'STUDENT':
            return True
        if request.method == 'PATCH' and obj.student_id == request.user.id:
            return True
        return True


class IsUserOwnerOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(obj.id == request.user.id)


class IsOwnerOrStaffOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(obj.student.username == request.user.username) or \
               request.user.is_staff or \
               request.user.role == 'LEVEL_CORD'


class FullDjangoModelPermissions(permissions.DjangoModelPermissions):
    def __init__(self) -> None:
        self.perms_map['GET'] = ['%(app_label)s.view_%(model_name)s']
