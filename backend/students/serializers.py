import re

from rest_framework import serializers

from administration.models import AcademicSession, ToggleSession
from administration.signals import generate_otp
from faculty.models import Faculty, Department, Programme
from level_coordinating.models import LevelCoordinator
from .models import Student, StudentProfile, StudentAcademicDetails, StudentGeneralDocs, StudentPlaceOfOriginInfo, \
    StudentContactInfo, StudentNextOfKinInfo, StudentSessionalRecord, StudentHealthInfo, StudentSMSMessaging


class StudentSerializer(serializers.ModelSerializer):
    reg_number = serializers.CharField(source='username')

    class Meta:
        model = Student
        fields = ['id', 'reg_number', 'email', 'role', 'first_name', 'middle_name', 'last_name',
                  'phone_number']
        extra_kwargs = {
            'role': {'read_only': True},
            'middle_name': {'required': False},
            'phone_number': {'required': True}
        }

    def validate_reg_number(self, value):
        is_user_exist = Student.objects.filter(username=value).exists()
        if is_user_exist:
            raise serializers.ValidationError('Student with given reg number is already registered!')
        return value

    def validate_email(self, value):
        checked = re.search('@buk.edu.ng$', value)
        if checked is None:
            raise serializers.ValidationError('Email must end with @buk.edu.ng!')
        return value

    def create(self, validated_data):
        otp_code = generate_otp()
        student = Student.students.create(**validated_data, otp_code=otp_code, is_active=True)
        student.set_password(validated_data['phone_number'])
        student.save()
        return student


class BasicStudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['phone_number']


class FullStudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['email', 'first_name',
                  'middle_name', 'last_name', 'phone_number']


class InlineStudentSerializer(serializers.ModelSerializer):
    reg_number = serializers.CharField(source='username')

    class Meta:
        model = Student
        fields = ['id', 'reg_number', 'first_name',
                  'last_name', 'phone_number']


class InlineStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelCoordinator
        fields = ['id', 'username', 'first_name', 'last_name', 'phone_number']


class StudentProfileSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)
    level_coordinator = InlineStaffSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'student', 'level_coordinator', 'dob', 'gender', 'marital_status',
                  'passport_photo', 'is_profile_complete', 'created_at', 'modified_at']

        extra_kwargs = {
            'is_profile_complete': {'read_only': True},
        }


class FacultyInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'faculty_name', 'faculty_code']


class DepartmentInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'dept_name', 'dept_code']


class ProgrammeInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = ['id', 'prog_name']


class CustomStudentAcademicDetailSerializer(serializers.ModelSerializer):
    faculty = FacultyInlineSerializer(read_only=True)
    department = DepartmentInlineSerializer(read_only=True)
    programme = ProgrammeInlineSerializer(read_only=True)

    class Meta:
        model = StudentAcademicDetails
        fields = ['id', 'student', 'current_level', 'mode_entry', 'mode_study',
                  'entry_status', 'jamb_number', 'faculty', 'department', 'programme']


class StudentAcademicDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentAcademicDetails
        fields = ['id', 'student', 'current_level', 'mode_entry', 'mode_study',
                  'entry_status', 'jamb_number', 'faculty', 'department', 'programme']


class StudentGeneralDocsSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)

    class Meta:
        model = StudentGeneralDocs
        fields = ['id', 'student', 'birth_cert', 'lg_cert', 'jamb_adm_cert', 'school_adm_letter', 'medical_fitness',
                  'o_level', 'pri_cert', 'sch_testimonial', 'is_complete', 'created_at', 'modified_at']
        extra_kwargs = {'is_complete': {'read_only': True}}


class StudentPlaceOfOriginInfoSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)

    class Meta:
        model = StudentPlaceOfOriginInfo
        fields = ['id', 'student', 'country', 'state',
                  'local_govt', 'created_at', 'modified_at']


class StudentContactInfoSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)

    class Meta:
        model = StudentContactInfo
        fields = ['id', 'student', 'home_address',
                  'contact_address', 'created_at', 'modified_at']
        extra_kwargs = {'is_complete': {'read_only': True}}


class StudentNextOfKinInfoSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)

    class Meta:
        model = StudentNextOfKinInfo
        fields = ['id', 'student', 'full_name', 'phone_number', 'email', 'relationship', 'address', 'created_at',
                  'modified_at']


class StudentHealthInfoSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)

    class Meta:
        model = StudentHealthInfo
        fields = ['id', 'student', 'health_status', 'blood_group', 'disability', 'medication', 'created_at',
                  'modified_at']


class AcademicSessionInlineSerializer(serializers.ModelSerializer):
    is_session_on = serializers.SerializerMethodField()

    class Meta:
        model = AcademicSession
        fields = ['session', 'is_session_on']

    def get_is_session_on(self, obj):
        session = ToggleSession.objects.get(session=obj.id)
        return session.is_current_session


class FullStudentSessionalRecordSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)
    for_session = AcademicSessionInlineSerializer(
        read_only=True, source='academic_session')

    class Meta:
        model = StudentSessionalRecord
        fields = ['id', 'student', 'for_session', 'academic_session', 'crf', 'ras', 'sif', 'spr', 'add_and_drop_crf',
                  'sessional_result', 'studies_suspension', 'additional_doc_1', 'additional_doc_2', 'is_complete',
                  'created_at', 'modified_at']

        extra_kwargs = {
            'is_complete': {'read_only': True},
        }


class BasicStudentSessionalRecordSerializer(serializers.ModelSerializer):
    student = InlineStudentSerializer(read_only=True)

    class Meta:
        model = StudentSessionalRecord
        fields = ['id', 'student', 'academic_session', 'crf', 'ras', 'sif', 'spr', 'add_and_drop_crf',
                  'is_complete', 'created_at', 'modified_at']

        extra_kwargs = {
            'is_complete': {'read_only': True},
        }

    def validate(self, attrs):
        student = self.context['request'].user
        instance = StudentSessionalRecord(**attrs, student=student)
        instance.clean()
        return attrs

    def create(self, validated_data):
        student = self.context['request'].user.id
        return StudentSessionalRecord.objects.create(student_id=student, **validated_data)


class StudentSMSMessagingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSMSMessaging
        fields = ['id', 'student', 'content']
