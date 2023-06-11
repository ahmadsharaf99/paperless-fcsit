from rest_framework import permissions


class IsLevelCordOwnerOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(obj.staff.username == request.user.username)