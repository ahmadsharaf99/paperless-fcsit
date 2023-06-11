from django.urls import path, include
from core import views

urlpatterns = [
    path('', views.get_routes),
    path('me/', views.CurrentUserAPIView.as_view(), name='me'),
    path('verify/', views.OTPVerifyAPIView.as_view(), name='verify-otp'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('dashboard/', views.DashboardAPIView.as_view(), name='dashboard'),
    path('get-acad-id/<int:stud_id>', views.AcademicRecordIDView.as_view(), name='academic_rec_id'),
    path('get-info-ids/<int:stud_id>', views.StudentInfoTablesIDsView.as_view(), name='stud_info_ids'),
]
