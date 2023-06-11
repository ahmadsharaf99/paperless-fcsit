from rest_framework_nested import routers

from . import views

router = routers.DefaultRouter()
router.register('faculties', views.FacultyViewSet, basename='faculties')
router.register('departments', views.CustomDeptViewSet, basename='departments')

# NESTED ROUTES
departments_router = routers.NestedSimpleRouter(router, 'faculties', lookup='faculty')
departments_router.register('departments', views.DepartmentsViewSet, basename='faculty-departments')

programmes_router = routers.NestedSimpleRouter(router, 'departments', lookup='department')
programmes_router.register('programmes', views.ProgrammeViewSet, basename='department-programmes')

urlpatterns = router.urls
