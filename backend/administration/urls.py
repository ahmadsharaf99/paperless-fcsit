from django.urls import path
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register('academic-session', views.AcademicSessionViewSet, basename='academic-session')
router.register('toggle-session', views.SessionToggleViewSet, basename='toggle-session')

urlpatterns = [
    path('upload/', views.StudentBulkUploadAPIView.as_view(), name='student-upload'),
    path('download-csv/', views.DownloadCSVAPIView.as_view(), name='download-csv'),
]

urlpatterns += router.urls
