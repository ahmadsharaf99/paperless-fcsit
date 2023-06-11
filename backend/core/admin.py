from django.contrib import admin
from django.contrib.admin.sites import NotRegistered
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from rest_framework_simplejwt.token_blacklist.admin import OutstandingTokenAdmin
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from .models import User


class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password', 'email')}),
        ('Personal Info', {'fields': (
            'first_name', 'middle_name', 'last_name', 'phone_number', 'role')}),
        ('Permissions', {'fields': (
            'is_active', 'is_verified', 'is_password_changed', 'is_staff', 'is_superuser', 'groups',
            'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2', 'first_name', 'last_name')}
         ),
    )
    list_display = ('username', 'email', 'last_name', 'first_name', 'role', 'is_verified')
    list_editable = ['is_verified']
    list_filter = ['role', 'is_verified', 'is_password_changed', 'is_staff', 'is_superuser']
    form = UserChangeForm
    add_form = UserCreationForm
    ordering = ('-date_joined',)


try:
    admin.site.unregister(User)
except NotRegistered:
    pass


class OutstandingTokenAdmin(OutstandingTokenAdmin):
    def has_delete_permission(self, *args, **kwargs):
        return True


admin.site.unregister(OutstandingToken)
admin.site.register(OutstandingToken, OutstandingTokenAdmin)

admin.site.register(User, CustomUserAdmin)
