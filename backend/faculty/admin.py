from django.contrib import admin

from .models import Department, Programme, Faculty


class FacultyModel(admin.ModelAdmin):
    list_display = ('faculty_name', 'faculty_code', 'established_date')
    list_filter = ('faculty_name', 'faculty_code')


class DepartmentModel(admin.ModelAdmin):
    list_display = ('dept_name', 'dept_code', 'faculty', 'established_date')
    list_filter = ('dept_name', 'dept_code')


class ProgrammeModel(admin.ModelAdmin):
    list_display = ('prog_name', 'prog_duration', 'faculty', 'department', 'established_date')
    list_filter = ('prog_name', 'faculty', 'department')


admin.site.register(Department, DepartmentModel)
admin.site.register(Programme, ProgrammeModel)
admin.site.register(Faculty, FacultyModel)
