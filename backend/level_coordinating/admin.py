from django.contrib import admin
from core.admin import CustomUserAdmin
from students.models import StudentSMSMessaging
from .models import LevelCoordinator, LevelCoordinatorProfile, CoordinatingInfo


class ProfileInlineAdmin(admin.StackedInline):
    model = LevelCoordinatorProfile
    extra = 1


class CoordinatingInlineAdmin(admin.StackedInline):
    model = CoordinatingInfo
    extra = 1


class CustomLevelCordAdmin(CustomUserAdmin):
    list_display = ('username', 'phone_number', 'otp_code', 'last_name', 'first_name', 'role', 'is_verified')
    inlines = [ProfileInlineAdmin, CoordinatingInlineAdmin]


class CustomLevelCordProfileAdmin(admin.ModelAdmin):
    list_display = ('staff', 'faculty', 'department', 'gender', 'date_of_birth', 'is_profile_complete', 'created_at')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()


class CustomCoordinatingInfoAdmin(admin.ModelAdmin):
    list_display = ('staff', 'programme', 'assigned_level', 'created_at')
    list_editable = ('assigned_level',)
    ordering = ('programme', 'assigned_level')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()


class CustomStudentSMSAdmin(admin.ModelAdmin):
    list_display = ('student', 'content', 'date_created')


admin.site.register(LevelCoordinator, CustomLevelCordAdmin)
admin.site.register(LevelCoordinatorProfile, CustomLevelCordProfileAdmin)
admin.site.register(CoordinatingInfo, CustomCoordinatingInfoAdmin)
admin.site.register(StudentSMSMessaging, CustomStudentSMSAdmin)
