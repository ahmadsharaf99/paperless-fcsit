from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from students.pagination import DefaultPagination
from students.permissions import IsUserVerifiedAndPasswordChanged
from .filters import LevelCordProfileFilter, CoordinatingInfoFilter
from .models import LevelCoordinator, CoordinatingInfo, LevelCoordinatorProfile
from .permissions import IsLevelCordOwnerOnly
from .serializers import LevelCordSerializer, CoordinatingInfoSerializer, LevelCoordinatorProfileSerializer, \
    LevelCoordinatorProfileCreateSerializer


class LevelCordViewSet(ModelViewSet):
    serializer_class = LevelCordSerializer
    permission_classes = [IsAdminUser, IsUserVerifiedAndPasswordChanged]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, ]
    search_fields = ['first_name', 'last_name', 'email']

    def get_queryset(self):
        return LevelCoordinator.level_cords.all()


class LevelCordProfileViewSet(ModelViewSet):
    http_method_names = ['get', 'patch', 'head', 'options']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    queryset = LevelCoordinatorProfile.objects.select_related('staff').all()
    permission_classes = [IsAdminUser]
    filterset_class = LevelCordProfileFilter
    pagination_class = DefaultPagination
    search_fields = ['staff__first_name', 'staff__last_name']

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return LevelCoordinatorProfileSerializer
        return LevelCoordinatorProfileCreateSerializer

    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=[IsAuthenticated, IsUserVerifiedAndPasswordChanged, IsLevelCordOwnerOnly])
    def me(self, request):
        try:
            staff = self.queryset.get(staff_id=self.request.user.id)
        except LevelCoordinatorProfile.DoesNotExist:
            return Response(
                {'error': 'You don\'t have a level coordinator account. '
                          'This endpoint is restricted to level-cords alone.', },
                status=status.HTTP_403_FORBIDDEN
            )
        if request.method == 'GET':
            serializer = LevelCoordinatorProfileSerializer(staff)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = LevelCoordinatorProfileCreateSerializer(instance=staff, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class CoordinatorAssigningViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    serializer_class = CoordinatingInfoSerializer
    queryset = CoordinatingInfo.objects.select_related('staff').all()
    permission_classes = [IsAdminUser]
    pagination_class = DefaultPagination
    filterset_class = CoordinatingInfoFilter
    search_fields = ['staff__first_name', 'staff__last_name', 'programme', 'assigned_level']

    def get_serializer_context(self):
        return {'request': self.request}


class GetAssignIDViewSet(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, prog_id, level):
        assignment = CoordinatingInfo.objects.get(programme_id=prog_id, assigned_level=level)

        return Response({
            'assignment-id': assignment.id
        }, status=status.HTTP_200_OK)