from django.db.models import Q
from rest_framework import serializers

from faculty.models import Faculty, Department, Programme


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'faculty_name', 'faculty_code', 'established_date']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'dept_name', 'dept_code', 'established_date']

    def validate(self, attrs):
        if Department.objects.filter(Q(dept_name=attrs['dept_name']) | Q(dept_code=attrs['dept_code'])).exists():
            raise serializers.ValidationError('Department with this name or code is already registered!')
        return attrs

    def create(self, validated_data):
        faculty_id = self.context['faculty_id']
        return Department.objects.create(faculty_id=faculty_id, **validated_data)


class ProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = ['id', 'prog_name', 'prog_duration', 'established_date']

    def validate_prog_name(self, value):
        if Programme.objects.filter(prog_name=value).exists():
            raise serializers.ValidationError('Programme with this name is already registered!')
        return value

    def create(self, validated_data):
        department_id = self.context['department_id']
        faculty_id = Department.objects.get(id=department_id).faculty_id
        return Programme.objects.create(faculty_id=faculty_id, department_id=department_id, **validated_data)
