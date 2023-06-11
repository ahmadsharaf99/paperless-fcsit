from django.db.models import F
from rest_framework import serializers

from administration.models import AcademicSession, ToggleSession
from students.models import StudentBulkUpload, StudentProfile, StudentAcademicDetails
from level_coordinating.models import CoordinatingInfo


class StudentBulkUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentBulkUpload
        fields = ['csv_file']


class LevelCordAssigningSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoordinatingInfo
        fields = ['staff', 'programme', 'assigned_level', 'created_at', 'modified_at']


class CustomAcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['id', 'session', 'has_updated',  'created_at', 'modified_at']


class AcademicSessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AcademicSession
        fields = ['id', 'session', 'is_update_student_levels', 'is_update_level_cord',
                  'has_updated', 'is_active', 'created_at', 'modified_at']

    def validate(self, attrs):
        instance = AcademicSession(**attrs)
        instance.clean()
        return attrs

    def save(self, **kwargs):
        instance = super(AcademicSessionSerializer, self).save(**self.validated_data)

        if self.validated_data['is_update_student_levels']:
            students = StudentAcademicDetails.objects.exclude(student__academic_details__current_level=400)
            students.update(current_level=F('current_level') + 100)
        if self.validated_data['is_update_level_cord']:
            staff_assignments = CoordinatingInfo.objects.exclude(assigned_level=400)
            updated_staff = []
            for staff_assign in staff_assignments:
                if staff_assign.staff is not None:
                    try:
                        new_assignment = CoordinatingInfo.objects.get(assigned_level=staff_assign.assigned_level + 100,
                                                                      programme=staff_assign.programme)

                        new_assignment.staff = staff_assign.staff
                        updated_staff.append(new_assignment)

                        # reset old students in case student levels not updated
                        old_students = StudentProfile.objects.filter(level_coordinator=staff_assign.staff)
                        old_students.update(level_coordinator=None)

                        # update students with new level cord assignment
                        new_students = StudentProfile.objects.filter(
                            student__academic_details__current_level=new_assignment.assigned_level,
                            student__academic_details__programme=new_assignment.programme,
                        )
                        new_students.update(level_coordinator=new_assignment.staff)

                        # reset staff
                        staff_assign.staff = None
                        staff_assign.save()

                    except CoordinatingInfo.DoesNotExist:
                        CoordinatingInfo.objects.create(
                            staff=staff_assign.staff,
                            assigned_level=staff_assign.assigned_level + 100,
                            programme=staff_assign.programme
                        )
                else:
                    continue
                CoordinatingInfo.objects.bulk_update(updated_staff, fields=['staff'])
        return instance


class InlineAcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['id', 'session', 'is_update_student_levels', 'is_update_level_cord', ]


class SessionToggleSerializer(serializers.ModelSerializer):
    academic_session = InlineAcademicSessionSerializer(source='session', read_only=True)

    class Meta:
        model = ToggleSession
        fields = ['id', 'academic_session', 'is_current_session', 'created_at', 'modified_at']
