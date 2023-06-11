from django_filters.rest_framework import FilterSet

from level_coordinating.models import LevelCoordinatorProfile, LevelCoordinator, CoordinatingInfo


class LevelCordProfileFilter(FilterSet):
    class Meta:
        model = LevelCoordinatorProfile
        fields = ['faculty', 'department']


class CoordinatingInfoFilter(FilterSet):
    class Meta:
        model = CoordinatingInfo
        fields = ['programme', 'assigned_level']