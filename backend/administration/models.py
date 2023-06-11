import datetime
from django.core.exceptions import ValidationError
from django.db import models


def current_year(increment=0):
    return datetime.date.today().year + increment


class ActiveSessionManager(models.Manager):
    def get_queryset(self):
        return super(ActiveSessionManager, self).get_queryset().filter(toggle_session__is_current_session=True)


class AcademicSession(models.Model):
    session = models.CharField(max_length=200, unique=True, null=True)
    is_update_student_levels = models.BooleanField(default=False, blank=True, null=True)
    is_update_level_cord = models.BooleanField(default=False, blank=True, null=True)
    has_updated = models.BooleanField(default=False, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    active_sessions = ActiveSessionManager()

    class Meta:
        verbose_name_plural = 'Academic Sessions'
        ordering = ['-session']

    def __str__(self):
        return self.session

    @property
    def is_active(self):
        return self.toggle_session.is_current_session

    def clean(self):
        session = AcademicSession.objects.filter(session=self.session)
        if session.exists():
            if session.first().has_updated:
                raise ValidationError('You cannot perform update on students and/or staff more than once.')


class ToggleSession(models.Model):
    session = models.OneToOneField(AcademicSession, on_delete=models.CASCADE, related_name='toggle_session')
    is_current_session = models.BooleanField(default=False, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.session.session

    class Meta:
        verbose_name = 'Toggle Session On/Off'
        verbose_name_plural = 'Toggle Sessions On/Off'
        ordering = ['-session']
