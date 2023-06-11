from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from faculty.models import Faculty, Department, Programme
from faculty.serializers import FacultySerializer, DepartmentSerializer, ProgrammeSerializer
from level_coordinating.models import LevelCoordinatorProfile, CoordinatingInfo
from students.pagination import DefaultPagination
from students.permissions import IsAdminOrReadOnly


class FacultyViewSet(ModelViewSet):
    serializer_class = FacultySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    pagination_class = DefaultPagination
    search_fields = ['faculty_name', 'faculty_code']

    def get_queryset(self, *args, **kwargs):
        if self.request.user.role == 'LEVEL_CORD':
            try:
                coord_profile = LevelCoordinatorProfile.objects.get(staff_id=self.request.user.id)
                print(coord_profile.faculty_id)
                if coord_profile.faculty_id is None:
                    return Faculty.objects.all()
                return Faculty.objects.filter(id=coord_profile.faculty_id)
            except LevelCoordinatorProfile.DoesNotExist:
                return Response({
                    'error': 'Profile not found for the logged-in coordinator'
                }, status=status.HTTP_404_NOT_FOUND)
        return Faculty.objects.all()


class CustomDeptViewSet(ModelViewSet):
    http_method_names = ['get', 'head', 'options']
    serializer_class = DepartmentSerializer
    queryset = Department.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    pagination_class = DefaultPagination
    search_fields = ['dept_name', 'dept_code']


class DepartmentsViewSet(ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    pagination_class = DefaultPagination
    search_fields = ['dept_name', 'dept_code']

    def get_queryset(self):
        if self.request.user.role == 'LEVEL_CORD':
            # get coordinator programme and level
            try:
                coord_profile = LevelCoordinatorProfile.objects.get(staff_id=self.request.user.id)
                print(coord_profile.department_id)
                if coord_profile.department_id is None:
                    return Department.objects.filter(faculty_id=self.kwargs['faculty__pk'])
                return Department.objects.filter(id=coord_profile.department_id)
            except LevelCoordinatorProfile.DoesNotExist:
                return Response({
                    'error': 'Profile not found for the logged-in coordinator'
                }, status=status.HTTP_404_NOT_FOUND)
        return Department.objects.filter(faculty_id=self.kwargs['faculty__pk'])

    def get_serializer_context(self):
        return {'faculty_id': self.kwargs['faculty__pk']}


class ProgrammeViewSet(ModelViewSet):
    serializer_class = ProgrammeSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    pagination_class = DefaultPagination
    search_fields = ['prog_name']

    def get_queryset(self):
        if self.request.user.role == 'LEVEL_CORD':
            # get coordinator programme and level
            coord_info = CoordinatingInfo.objects.filter(staff_id=self.request.user.id)
            if coord_info.exists():
                return Programme.objects.filter(id=coord_info.first().programme_id)
        return Programme.objects.filter(department_id=self.kwargs['department__pk'])

    def get_serializer_context(self):
        return {
            'department_id': self.kwargs['department__pk']
        }
