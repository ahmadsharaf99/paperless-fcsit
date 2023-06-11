from rest_framework_nested import routers

from . import views

router = routers.DefaultRouter()
router.register('auth', views.StudentViewSet, basename='students')
router.register('academic-records', views.StudentAcademicDetailViewSet, basename='academic-records')
router.register('profile', views.StudentProfileViewSet, basename='profile')
router.register('general-docs', views.StudentGeneralDocsViewSet, basename='general-docs')
router.register('origins', views.StudentPlaceOfOriginInfoViewSet, basename='student-origins')
router.register('contacts', views.StudentContactInfoViewSet, basename='student-contacts')
router.register('kins', views.StudentNextOfKinInfoViewSet, basename='student-kins')
router.register('health-records', views.StudentHealthInfoViewSet, basename='student-health-records')
router.register('sessionals', views.StudentSessionalRecordViewSet, basename='student-sessional'),
router.register('send-sms', views.StudentSMSMessagingViewSet, basename='send-sms'),

urlpatterns = router.urls
