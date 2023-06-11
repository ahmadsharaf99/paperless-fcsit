from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from level_coordinating.models import CoordinatingInfo
from .permissions import (
    IsAdminOrLevelCordUser,
    IsUserOwnerOnly,
    IsStudentOwnerOnly, IsAdminOrLevelCordUserOrStudentCreate, IsUserVerifiedAndPasswordChanged
)

from .serializers import (
    StudentSerializer,
    BasicStudentUpdateSerializer,
    FullStudentUpdateSerializer,
    StudentProfileSerializer, StudentGeneralDocsSerializer, StudentPlaceOfOriginInfoSerializer,
    StudentContactInfoSerializer, StudentNextOfKinInfoSerializer, StudentHealthInfoSerializer,
    BasicStudentSessionalRecordSerializer, FullStudentSessionalRecordSerializer, StudentSMSMessagingSerializer,
    CustomStudentAcademicDetailSerializer, StudentAcademicDetailSerializer,
)

from .pagination import DefaultPagination
from .filters import (
    StudentFilter,
    StudentProfileFilter,
    StudentAcademicsFilter,
    StudentGenericDocsFilter,
    StudentOriginFilter,
    StudentHealthInfoFilter,
    StudentSessionalRecordFilter
)

from students.models import (
    Student,
    StudentProfile,
    StudentAcademicDetails,
    StudentGeneralDocs,
    StudentPlaceOfOriginInfo,
    StudentContactInfo,
    StudentNextOfKinInfo,
    StudentSessionalRecord,
    StudentHealthInfo, StudentSMSMessaging
)


class StudentModelViewSet(ModelViewSet):
    http_method_names = ['get', 'patch', 'put', 'head', 'options']
    serializer_class = None
    queryset = None
    filter_backends = [DjangoFilterBackend, SearchFilter, ]
    permission_classes = [IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsAdminOrLevelCordUser]
    pagination_class = DefaultPagination

    @action(detail=False, methods=['GET', 'PATCH'],
            permission_classes=[IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsStudentOwnerOnly])
    def me(self, request):
        try:
            student = self.queryset.get(student_id=self.request.user.id)
        except self.serializer_class.Meta.model.DoesNotExist:
            return Response(
                {'error': 'You don\'t have a student account. This endpoint is restricted to students alone.', },
                status=status.HTTP_403_FORBIDDEN
            )
        if request.method == 'GET':
            serializer = self.serializer_class(student)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.serializer_class(instance=student, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class StudentQuerySetClass(ModelViewSet):
    queryset = None

    def get_queryset(self):
        user = self.request.user
        if user.role == 'LEVEL_CORD':
            coordinating_info = CoordinatingInfo.objects.filter(staff_id=user.id)
            assigned_students_levels = coordinating_info.values_list('assigned_level')
            assigned_students_programmes = coordinating_info.values_list('programme')
            qs = self.queryset.filter(
                student__academic_details__programme__in=assigned_students_programmes,
                student__academic_details__current_level__in=assigned_students_levels
            )
            anonymous_acad_list_qs = self.queryset.filter(
                student__academic_details__programme__isnull=True,
                student__academic_details__current_level=100
            )
            combined_qs = qs | anonymous_acad_list_qs
            return combined_qs
        return self.queryset


class StudentViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    permission_classes = [IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsAdminOrLevelCordUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, ]
    pagination_class = DefaultPagination
    filterset_class = StudentFilter
    search_fields = ['username', 'first_name', 'last_name', 'email', 'phone_number']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'LEVEL_CORD':
            coordinating_info = CoordinatingInfo.objects.filter(staff_id=user.id)
            assigned_students_levels = coordinating_info.values_list('assigned_level')
            assigned_students_programmes = coordinating_info.values_list('programme__prog_name')
            students = Student.students.filter(
                academic_details__programme__prog_name__in=assigned_students_programmes,
                academic_details__current_level__in=assigned_students_levels
            )
            return students
        return Student.students.all()

    def get_serializer_class(self):
        if 'me' in self.request.resolver_match.url_name:
            return BasicStudentUpdateSerializer
        elif self.request.method == 'PATCH':
            return FullStudentUpdateSerializer
        return StudentSerializer

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs['partial'])
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    @action(detail=False, methods=['GET', 'PATCH'],
            permission_classes=[IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsUserOwnerOnly])
    def me(self, request):
        try:
            student = Student.objects.get(id=request.user.id, role='STUDENT')
        except Student.DoesNotExist:
            return Response(
                {'error': 'You don\'t have a student account. This endpoint is restricted to students alone.', },
                status=status.HTTP_403_FORBIDDEN
            )
        if request.method == 'GET':
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = BasicStudentUpdateSerializer(instance=student, data=request.data)
            serializer.is_valid(raise_exception=True)
            student = serializer.save()
            serializer = StudentSerializer(student)
            return Response(serializer.data)


class StudentProfileViewSet(StudentModelViewSet, StudentQuerySetClass):
    http_method_names = ['get', 'patch', 'head', 'options']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    serializer_class = StudentProfileSerializer
    queryset = StudentProfile.objects.select_related('student').all()
    filterset_class = StudentProfileFilter
    search_fields = ['student__username', 'student__first_name', 'student__last_name']


class StudentAcademicDetailViewSet(StudentModelViewSet, StudentQuerySetClass):
    http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']
    queryset = StudentAcademicDetails.objects.select_related('student').all()
    serializer_class = CustomStudentAcademicDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminOrLevelCordUser]
    filterset_class = StudentAcademicsFilter
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'jamb_number']

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return CustomStudentAcademicDetailSerializer
        return StudentAcademicDetailSerializer

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsStudentOwnerOnly])
    def me(self, request):
        try:
            student = self.queryset.get(student_id=self.request.user.id)
        except StudentAcademicDetails.DoesNotExist:
            return Response(
                {'error': 'You don\'t have a student account. This endpoint is restricted to students alone.', },
                status=status.HTTP_403_FORBIDDEN
            )
        if request.method == 'GET':
            serializer = self.serializer_class(student)
            return Response(serializer.data)


class StudentGeneralDocsViewSet(StudentModelViewSet, StudentQuerySetClass):
    http_method_names = ['get', 'patch', 'head', 'options']
    queryset = StudentGeneralDocs.objects.select_related('student').all()
    serializer_class = StudentGeneralDocsSerializer
    filterset_class = StudentGenericDocsFilter
    search_fields = ['student__username', 'student__first_name', 'student__last_name' 'birth_cert', 'lg_cert',
                     'jamb_adm_cert', 'school_adm_letter', 'medical_fitness', 'o_level', 'pri_cert',
                     'sch_testimonial', ]


class StudentPlaceOfOriginInfoViewSet(StudentModelViewSet, StudentQuerySetClass):
    queryset = StudentPlaceOfOriginInfo.objects.select_related('student').all()
    serializer_class = StudentPlaceOfOriginInfoSerializer
    filterset_class = StudentOriginFilter
    search_fields = ['student__username', 'student__first_name', 'student__last_name']


class StudentContactInfoViewSet(StudentModelViewSet, StudentQuerySetClass):
    queryset = StudentContactInfo.objects.select_related('student').all()
    serializer_class = StudentContactInfoSerializer
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'contact_address']


class StudentNextOfKinInfoViewSet(StudentModelViewSet, StudentQuerySetClass):
    queryset = StudentNextOfKinInfo.objects.select_related('student').all()
    serializer_class = StudentNextOfKinInfoSerializer
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'full_name', 'phone_number']


class StudentHealthInfoViewSet(StudentModelViewSet, StudentQuerySetClass):
    queryset = StudentHealthInfo.objects.select_related('student').all()
    serializer_class = StudentHealthInfoSerializer
    filterset_class = StudentHealthInfoFilter
    search_fields = ['student__username', 'student__first_name', 'student__last_name']


class StudentSessionalRecordViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    filter_backends = [DjangoFilterBackend, SearchFilter, ]
    permission_classes = [IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsAdminOrLevelCordUserOrStudentCreate]
    pagination_class = DefaultPagination
    filterset_class = StudentSessionalRecordFilter
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'crf', 'ras', 'sif', 'spr',
                     'sessional_result']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BasicStudentSessionalRecordSerializer
        if self.request.method == 'PATCH' and self.request.user.role == 'STUDENT':
            return BasicStudentSessionalRecordSerializer
        return FullStudentSessionalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return StudentSessionalRecord.objects.select_related('student').filter(student_id=user.id)
        if user.role == 'LEVEL_CORD':
            coordinating_info = CoordinatingInfo.objects.filter(staff_id=user.id)
            assigned_students_levels = coordinating_info.values_list('assigned_level')
            assigned_students_programmes = coordinating_info.values_list('programme')
            sessional_records = StudentSessionalRecord.objects.select_related('student').filter(
                student__academic_details__programme__in=assigned_students_programmes,
                student__academic_details__current_level__in=assigned_students_levels
            )
            return sessional_records
        return StudentSessionalRecord.objects.select_related('student').all()

    def create(self, request, *args, **kwargs):
        serializer = BasicStudentSessionalRecordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        if StudentSessionalRecord.objects.filter(
                student_id=request.user.id,
                academic_session_id=serializer.validated_data['academic_session']).exists():
            return Response(
                {'error': 'You\'ve registered for this session before, you can only modify it'}
            )
        record = serializer.save()
        serializer = FullStudentSessionalRecordSerializer(record)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        if self.request.user.role == 'STUDENT':
            serializer = BasicStudentSessionalRecordSerializer(instance, data=request.data, partial=kwargs['partial'],
                                                               context={'request': request})
        else:
            serializer = FullStudentSessionalRecordSerializer(instance, data=request.data, partial=kwargs['partial'])
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        serializer = FullStudentSessionalRecordSerializer(record)
        return Response(serializer.data)


class StudentSMSMessagingViewSet(StudentQuerySetClass):
    http_method_names = ['get', 'post', 'head', 'options']
    permission_classes = [IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsAdminOrLevelCordUser]
    serializer_class = StudentSMSMessagingSerializer
    queryset = StudentSMSMessaging.objects.select_related('student').all()
