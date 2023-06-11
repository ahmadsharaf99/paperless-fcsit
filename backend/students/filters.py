from django_filters.rest_framework import FilterSet
from .models import (
    Student,
    StudentProfile,
    StudentAcademicDetails, StudentGeneralDocs, StudentPlaceOfOriginInfo, StudentHealthInfo, StudentSessionalRecord,
)


class StudentFilter(FilterSet):
    class Meta:
        model = Student
        fields = ['username', 'first_name', 'last_name', 'phone_number']


class StudentProfileFilter(FilterSet):
    class Meta:
        model = StudentProfile
        fields = ['gender', 'marital_status', 'level_coordinator', 'is_profile_complete']


class StudentAcademicsFilter(FilterSet):
    class Meta:
        model = StudentAcademicDetails
        fields = ['current_level', 'mode_entry', 'faculty', 'programme']


class StudentGenericDocsFilter(FilterSet):
    class Meta:
        model = StudentGeneralDocs
        fields = ['is_complete']


class StudentOriginFilter(FilterSet):
    class Meta:
        model = StudentPlaceOfOriginInfo
        fields = ['state']


class StudentHealthInfoFilter(FilterSet):
    class Meta:
        model = StudentHealthInfo
        fields = ['blood_group', 'health_status', 'disability']


class StudentSessionalRecordFilter(FilterSet):
    class Meta:
        model = StudentSessionalRecord
        fields = ['academic_session', 'is_complete']
