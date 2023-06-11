from django.urls import path
from rest_framework_nested import routers

from . import views

router = routers.DefaultRouter()
router.register('auth', views.LevelCordViewSet, basename='level_cords')
router.register('assign', views.CoordinatorAssigningViewSet, basename='staff-assign')
router.register('profile', views.LevelCordProfileViewSet, basename='staff-profile')

urlpatterns = [
    path('get-assign-id/<int:prog_id>/<int:level>', views.GetAssignIDViewSet.as_view(), name='get-assign-id'),
] + router.urls
