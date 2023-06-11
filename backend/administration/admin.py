from django.contrib import admin, messages

from students.models import Student
from .models import AcademicSession, ToggleSession


class CustomAcademicSessionAdmin(admin.ModelAdmin):
    list_display = ('session', 'is_update_student_levels', 'is_update_level_cord')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()
    ordering = ('-session',)


class CustomToggleAcademicSessionAdmin(admin.ModelAdmin):
    list_display = ('session', 'is_current_session')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()
    ordering = ('session',)


admin.site.register(AcademicSession, CustomAcademicSessionAdmin)
admin.site.register(ToggleSession, CustomToggleAcademicSessionAdmin)
