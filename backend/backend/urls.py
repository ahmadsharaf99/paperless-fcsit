from django.contrib import admin
from django.urls import path, include
import debug_toolbar

from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Paperless FCSIT'
admin.site.index_title = 'Admin'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('core/', include('core.urls')),
    path('students/', include('students.urls')),
    path('staff/', include('level_coordinating.urls')),
    path('divisions/', include('faculty.urls')),
    path('administration/', include('administration.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('__debug__/', include('debug_toolbar.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
