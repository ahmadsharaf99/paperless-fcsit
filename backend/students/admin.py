from pathlib import Path

from django.contrib import admin
from django.contrib.admin.widgets import AdminFileWidget
from django.db import models
from django.utils.html import format_html

from core.admin import CustomUserAdmin
from .models import (
    Student,
    StudentProfile,
    StudentPlaceOfOriginInfo,
    StudentSessionalRecord,
    StudentAcademicDetails,
    StudentAcademicDetails,
    StudentGeneralDocs,
    StudentContactInfo,
    StudentNextOfKinInfo,
    StudentHealthInfo, StudentBulkUpload
)


class ProfileInlineAdmin(admin.StackedInline):
    model = StudentProfile
    fk_name = 'student'
    extra = 1


class StudentAcademicInlineAdmin(admin.StackedInline):
    model = StudentAcademicDetails
    extra = 1


class StudentGeneralDocsInlineAdmin(admin.StackedInline):
    model = StudentGeneralDocs
    extra = 1


class StudentPlaceOfOriginInlineAdmin(admin.StackedInline):
    model = StudentPlaceOfOriginInfo
    extra = 1


class StudentContactInfoInlineAdmin(admin.StackedInline):
    model = StudentContactInfo
    extra = 1


class StudentNextOfKinInfoInlineAdmin(admin.StackedInline):
    model = StudentNextOfKinInfo
    extra = 1


class StudentHealthInfoInlineAdmin(admin.StackedInline):
    model = StudentHealthInfo
    extra = 1


class StudentSessionalRecordInlineAdmin(admin.StackedInline):
    model = StudentSessionalRecord
    extra = 1


class CustomStudentAdmin(CustomUserAdmin):
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'phone_number')}
         ),
    )
    list_display = ('username', 'first_name', 'otp_code', 'phone_number', 'role', 'is_verified')
    inlines = [ProfileInlineAdmin,
               StudentAcademicInlineAdmin,
               StudentGeneralDocsInlineAdmin,
               StudentPlaceOfOriginInlineAdmin,
               StudentContactInfoInlineAdmin,
               StudentNextOfKinInfoInlineAdmin,
               StudentHealthInfoInlineAdmin,
               StudentSessionalRecordInlineAdmin, ]


class RecordInlineAdmin(admin.StackedInline):
    model = StudentSessionalRecord
    extra = 1


class CustomStudentProfileAdmin(admin.ModelAdmin):
    readonly_fields = ('current_level', 'level_coordinator')
    list_display = (
        'student', 'current_level', 'gender', 'dob', 'level_coordinator', 'is_profile_complete')
    filter_horizontal = ()
    list_filter = ('gender', 'level_coordinator', 'is_profile_complete')
    fieldsets = ()

    def current_level(self, obj):
        return StudentAcademicDetails.objects.select_related('student').get(student=obj.student).current_level


class CustomStudentRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'academic_session', 'is_complete')
    filter_horizontal = ()
    list_filter = ('academic_session', 'is_complete')
    fieldsets = ()

    ordering = ('-created_at',)


class StudentAcademicDetailsAdmin(admin.ModelAdmin):
    list_display = ('student', 'current_level', 'mode_entry', 'entry_status', 'jamb_number', 'faculty', 'programme')
    filter_horizontal = ()
    list_filter = ('current_level', 'mode_entry', 'faculty', 'programme')
    list_editable = ('current_level',)
    fieldsets = ()


class StudentGeneralDocsAdmin(admin.ModelAdmin):
    list_display = ('student', 'is_complete')
    filter_horizontal = ()
    list_filter = ('is_complete',)
    fieldsets = ()


class StudentOriginInfoAdmin(admin.ModelAdmin):
    list_display = ('student', 'local_govt', 'state', 'country')
    filter_horizontal = ()
    list_filter = ('state',)
    fieldsets = ()


class StudentContactInfoAdmin(admin.ModelAdmin):
    list_display = ('student', 'home_address', 'contact_address')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()


class StudentNextOfKinAdmin(admin.ModelAdmin):
    list_display = ('student', 'full_name', 'phone_number', 'relationship', 'address')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()


class StudentHealthInfoAdmin(admin.ModelAdmin):
    list_display = ('student', 'health_status', 'blood_group', 'disability', 'medication')
    filter_horizontal = ()
    list_filter = ('blood_group',)
    fieldsets = ()


class StudentBulkUploadAdmin(admin.ModelAdmin):
    list_display = ('csv_file', 'date_uploaded')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()


admin.site.register(Student, CustomStudentAdmin)
admin.site.register(StudentProfile, CustomStudentProfileAdmin)
admin.site.register(StudentAcademicDetails, StudentAcademicDetailsAdmin)
admin.site.register(StudentGeneralDocs, StudentGeneralDocsAdmin)
admin.site.register(StudentPlaceOfOriginInfo, StudentOriginInfoAdmin)
admin.site.register(StudentContactInfo, StudentContactInfoAdmin)
admin.site.register(StudentNextOfKinInfo, StudentNextOfKinAdmin)
admin.site.register(StudentHealthInfo, StudentHealthInfoAdmin)
admin.site.register(StudentSessionalRecord, CustomStudentRecordAdmin)
admin.site.register(StudentBulkUpload, StudentBulkUploadAdmin)
