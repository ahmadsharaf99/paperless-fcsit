import csv

from django.http import HttpResponse
from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.viewsets import ModelViewSet

from rest_framework.permissions import IsAdminUser, IsAuthenticated

from students.models import StudentBulkUpload
from students.pagination import DefaultPagination
from students.permissions import IsAdminOrReadOnly
from .models import AcademicSession, ToggleSession
from .serializers import StudentBulkUploadSerializer, AcademicSessionSerializer, SessionToggleSerializer, \
    CustomAcademicSessionSerializer

from .signals import get_total_registered


class DownloadCSVAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="student_template.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                'registration_number',
                'jamb_number',
                'email',
                'phone_number',
                'first_name',
                'middle_name',
                'last_name',
                'faculty_code',
                'department_code',
                'programme',
                'level',
                'mode_of_entry',
            ]
        )
        return response


class StudentBulkUploadAPIView(CreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = StudentBulkUploadSerializer
    queryset = StudentBulkUpload.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'data': serializer.data,
                'total_registered': get_total_registered(),
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class AcademicSessionViewSet(ModelViewSet):
    filter_backends = [SearchFilter]
    queryset = AcademicSession.objects.all()
    pagination_class = DefaultPagination
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    search_fields = ['session']

    def get_queryset(self):
        if self.request.user.role in ['STUDENT', 'LEVEL_CORD']:
            return AcademicSession.active_sessions.all()
        return AcademicSession.objects.all()

    def get_serializer_class(self):
        if self.request.user.role in ['STUDENT', 'LEVEL_CORD']:
            return CustomAcademicSessionSerializer
        return AcademicSessionSerializer


class SessionToggleViewSet(ModelViewSet):
    http_method_names = ['get', 'put', 'head', 'options']
    filter_backends = [SearchFilter]
    queryset = ToggleSession.objects.all()
    serializer_class = SessionToggleSerializer
    pagination_class = DefaultPagination
    permission_classes = [IsAuthenticated, IsAdminUser]
    search_fields = ['session__session']
