from django.urls import reverse

from administration.models import AcademicSession, ToggleSession
from core.models import User
from rest_framework import status
from rest_framework.generics import UpdateAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView

from core.serializers import CodeVerifySerializer, ChangePasswordSerializer, CurrentUserSerializer
from faculty.models import Faculty, Department, Programme
from level_coordinating.models import CoordinatingInfo
from students.models import StudentProfile, StudentAcademicDetails, StudentSessionalRecord, StudentGeneralDocs, \
    StudentPlaceOfOriginInfo, StudentContactInfo, StudentNextOfKinInfo, StudentHealthInfo, Student
from students.permissions import IsAdminOrLevelCordUser


@api_view(['GET'])
def get_routes(request):
    routes = [
        reverse('me'),
        reverse('verify-otp'),
        reverse('change-password'),
    ]

    return Response(routes)


class OTPVerifyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.method == 'POST':
            serializer = CodeVerifySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            otp_code = serializer.validated_data['otp_code']
            if request.user.otp_code == otp_code:
                request.user.is_verified = True
                request.user.save()
                return Response(
                    {
                        'success': f'{request.user.first_name}, your account has been successfully verified.',
                        'change_password_url': reverse('change-password')
                    },
                    status=status.HTTP_200_OK
                )
            return Response(
                {'error': f'{request.user.first_name}, the OTP you entered is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangePasswordView(IsAuthenticated, UpdateAPIView):
    """
    An endpoint for changing password.
    """
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def update(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            print(serializer.validated_data.get("current_password"))
            if not user.check_password(serializer.validated_data.get("current_password")):
                return Response({"current_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            user.set_password(serializer.validated_data.get("new_password"))
            user.is_password_changed = True
            user.save()
            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'Password updated successfully',
                'data': []
            }

            return Response(response)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.method == 'GET':
            serializer = CurrentUserSerializer(request.user)
            return Response(
                {
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )


class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_academic_sessions = AcademicSession.objects.all().count()
        total_active_academic_sessions = ToggleSession.objects.filter(is_current_session=True).count()

        # get counts
        if self.request.user.role == 'ADMIN' and self.request.user.is_staff:
            total_admins = User.objects.filter(role='ADMIN').count()
            total_students = User.objects.filter(role='STUDENT').count()
            total_coordinators = User.objects.filter(role='LEVEL_CORD').count()
            total_coordinators_assigned = CoordinatingInfo.objects.all().order_by('staff__first_name').distinct(
                'staff__first_name').count()
            total_faculties = Faculty.objects.all().count()
            total_departments = Department.objects.all().count()
            total_programmes = Programme.objects.all().count()
            total_completed_general_records = StudentGeneralDocs.objects.filter(is_complete=True).count()
            total_completed_sessional_records = StudentSessionalRecord.objects.filter(is_complete=True).count()

            return Response(
                {
                    'total_admins': total_admins,
                    'total_students': total_students,
                    'total_coordinators': total_coordinators,
                    'total_coordinators_assigned': total_coordinators_assigned,
                    'total_faculties': total_faculties,
                    'total_departments': total_departments,
                    'total_programmes': total_programmes,
                    'total_academic_sessions': total_academic_sessions,
                    'total_ongoing_academic_sessions': total_active_academic_sessions,
                    'total_completed_general_records': total_completed_general_records,
                    'total_completed_sessional_records': total_completed_sessional_records,
                },
                status=status.HTTP_200_OK
            )

        elif self.request.user.role == 'LEVEL_CORD':
            coordinating_info = CoordinatingInfo.objects.filter(staff_id=request.user.id)
            coord_programmes = coordinating_info.values_list('programme__prog_name', flat=True)
            coord_ass_levels = coordinating_info.values_list('assigned_level', flat=True)
            total_coordinator_students = StudentAcademicDetails.objects.filter(
                programme__prog_name__in=coord_programmes,
                current_level__in=coord_ass_levels).count()
            total_completed_general_records = StudentGeneralDocs.objects.filter(
                student__academic_details__current_level__in=coord_ass_levels,
                student__academic_details__programme__prog_name__in=coord_programmes,
                is_complete=True,
            ).count()
            total_completed_sessional_records = StudentSessionalRecord.objects.filter(
                student__academic_details__current_level__in=coord_ass_levels,
                student__academic_details__programme__prog_name__in=coord_programmes,
                is_complete=True,
            ).count()

            if not coord_programmes:
                coord_programmes = 'None yet!'
            else:
                coord_programmes = coord_programmes.first()

            return Response(
                {
                    'assigned_levels': coord_ass_levels,
                    'assigned_programme': coord_programmes,
                    'total_coordinator_students': total_coordinator_students,
                    'total_completed_general_records': total_completed_general_records,
                    'total_completed_sessional_records': total_completed_sessional_records,
                    'total_academic_sessions': total_academic_sessions,
                    'total_ongoing_academic_sessions': total_active_academic_sessions,
                },
                status=status.HTTP_200_OK
            )

        elif self.request.user.role == 'STUDENT':
            student = StudentAcademicDetails.objects.get(student=request.user)
            stud_coordinator = StudentProfile.objects.get(student=request.user).level_coordinator

            if stud_coordinator is not None:
                stud_coordinator = stud_coordinator.full_name

            total_same_level_students = StudentAcademicDetails.objects.filter(current_level=student.current_level,
                                                                              programme=student.programme).count()
            is_general_records_complete = StudentGeneralDocs.objects.get(student=request.user).is_complete
            total_sessions_registered = StudentSessionalRecord.objects.filter(student=request.user).count()
            total_sessions_reg_completed = StudentSessionalRecord.objects.filter(student=request.user,
                                                                                 is_complete=True).count()
            total_active_academic_sessions = ToggleSession.objects.filter(is_current_session=True).count()

            return Response(
                {
                    'student_coordinator': stud_coordinator,
                    'student_faculty': student.faculty.faculty_name,
                    'student_department': student.department.dept_name,
                    'student_programme': student.programme.prog_name,
                    'is_general_records_complete': is_general_records_complete,
                    'total_same_level_students': total_same_level_students,
                    'total_sessions_registered_for': total_sessions_registered,
                    'total_sessions_reg_completed': total_sessions_reg_completed,
                    'total_ongoing_academic_sessions': total_active_academic_sessions,
                },
                status=status.HTTP_200_OK
            )


class AcademicRecordIDView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrLevelCordUser]

    def get(self, request, stud_id):
        acad_record = StudentAcademicDetails.objects.only('student_id').get(student_id=stud_id)

        return Response({
            'acad_record_id': acad_record.id
        }, status=status.HTTP_200_OK)


class StudentInfoTablesIDsView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrLevelCordUser]

    def get(self, request, stud_id):
        try:
            Student.objects.get(id=stud_id)
        except Student.DoesNotExist:
            return Response({
                'error': 'Student with the given ID does not exist!'

            }, status=status.HTTP_404_NOT_FOUND)

        acad_record = StudentAcademicDetails.objects.only('student_id').get(student_id=stud_id)
        stud_profile = StudentProfile.objects.only('student_id').get(student_id=stud_id)
        stud_gen_docs = StudentGeneralDocs.objects.only('student_id').get(student_id=stud_id)
        stud_origin = StudentPlaceOfOriginInfo.objects.only('student_id').get(student_id=stud_id)
        stud_contact = StudentContactInfo.objects.only('student_id').get(student_id=stud_id)
        stud_kin = StudentNextOfKinInfo.objects.only('student_id').get(student_id=stud_id)
        stud_health = StudentHealthInfo.objects.only('student_id').get(student_id=stud_id)
        stud_sessional = StudentSessionalRecord.objects.only('student_id').filter(student_id=stud_id).values_list(
            'id', flat=True)

        return Response({
            'acad_record_id': acad_record.id,
            'stud_profile_id': stud_profile.id,
            'stud_gen_docs_id': stud_gen_docs.id,
            'stud_origin_id': stud_origin.id,
            'stud_contact_id': stud_contact.id,
            'stud_kin_id': stud_kin.id,
            'stud_health_id': stud_health.id,
            'stud_sessional_ids': stud_sessional,

        }, status=status.HTTP_200_OK)
