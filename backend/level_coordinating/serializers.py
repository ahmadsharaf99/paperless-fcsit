import re
from rest_framework import serializers

from administration.signals import generate_otp
from .models import LevelCoordinator, CoordinatingInfo, LevelCoordinatorProfile
from students.serializers import FacultyInlineSerializer, DepartmentInlineSerializer, ProgrammeInlineSerializer


class LevelCordSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelCoordinator
        fields = ['id', 'username', 'email', 'role', 'first_name', 'middle_name', 'last_name',
                  'phone_number', 'department_id']
        extra_kwargs = {
            'role': {'read_only': True},
            'middle_name': {'required': False}
        }

    def validate_email(self, value):
        checked = re.search('@buk.edu.ng$', value)
        if checked is None:
            raise serializers.ValidationError('Email must end with @buk.edu.ng!')
        return value

    def create(self, validated_data):
        otp_code = generate_otp()
        level_cord = LevelCoordinator.objects.create(**validated_data, otp_code=otp_code, is_active=True)
        level_cord.set_password(validated_data['phone_number'])
        level_cord.save()
        return level_cord


class InlineStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelCoordinator
        fields = ['id', 'username', 'first_name', 'last_name', 'phone_number']


class LevelCoordinatorProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelCoordinatorProfile
        fields = ['id', 'staff', 'passport_photo', 'gender', 'date_of_birth', 'faculty', 'department', ]


class LevelCoordinatorProfileSerializer(serializers.ModelSerializer):
    staff = InlineStaffSerializer(read_only=True)
    faculty = FacultyInlineSerializer()
    department = DepartmentInlineSerializer()

    class Meta:
        model = LevelCoordinatorProfile
        fields = ['id', 'staff', 'passport_photo', 'gender', 'date_of_birth', 'faculty', 'department']

    extra_kwargs = {
        'is_profile_complete': {'read_only': True}
    }

    def create(self, validated_data):
        staff = self.context['request'].user.id
        return LevelCoordinatorProfile.objects.create(staff_id=staff, **validated_data)


class CustomCoordinatingInfoSerializer(serializers.ModelSerializer):
    staff_info = InlineStaffSerializer(source='staff', read_only=True)
    programme = ProgrammeInlineSerializer(read_only=True)

    class Meta:
        model = CoordinatingInfo
        fields = ['id', 'staff', 'staff_info', 'programme', 'assigned_level']


class CoordinatingInfoSerializer(serializers.ModelSerializer):
    staff_info = InlineStaffSerializer(source='staff', read_only=True)

    class Meta:
        model = CoordinatingInfo
        fields = ['id', 'staff', 'staff_info', 'programme', 'assigned_level']

    def validate(self, attrs):
        if self.context['request'].method in ['POST', 'PUT', 'PATCH']:
            instance = CoordinatingInfo(**attrs)
            instance.clean()
            return attrs
