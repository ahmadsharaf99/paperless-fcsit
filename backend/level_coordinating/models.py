from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.base_user import BaseUserManager
from django.db import models

from core.models import User
from administration.models import AcademicSession
from faculty.models import Faculty, Programme, Department
from students.validators import validate_file_size


class LevelCordManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        queryset = super().get_queryset(*args, **kwargs)
        queryset = queryset.filter(role=User.Role.LEVEL_CORD)
        return queryset


class LevelCoordinator(User):
    base_role = User.Role.LEVEL_CORD

    class Meta:
        proxy = True

    level_cords = LevelCordManager()

    @property
    def department_id(self):
        coord_profile = LevelCoordinatorProfile.objects.get(staff_id=self.id)
        return coord_profile.department_id

    def save(self, *args, **kwargs):
        self.role = User.Role.LEVEL_CORD
        self.is_level_cord = True
        return super().save(*args, **kwargs)


class LevelCoordinatorProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "MALE", 'Male'
        FEMALE = "FEMALE", 'Female'

    staff = models.OneToOneField(LevelCoordinator, on_delete=models.CASCADE, related_name='level_cord')
    passport_photo = models.ImageField(upload_to='staff/passports', blank=True, null=True,
                                       validators=[validate_file_size])
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.MALE)
    date_of_birth = models.DateField(default=timezone.now)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='level_cords', blank=True,
                                null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='level_cords', blank=True,
                                   null=True)
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Lecturer Coordinator Profile'
        verbose_name_plural = 'Level Cord Profiles'

    def __str__(self):
        return self.staff.email


class CoordinatingInfo(models.Model):
    LEVEL_100 = 100
    LEVEL_200 = 200
    LEVEL_300 = 300
    LEVEL_400 = 400
    SPILL_OVER_1 = 500
    SPILL_OVER_2 = 600
    SPILL_OVER_3 = 700
    LEVELS = [
        (LEVEL_100, '100 Level'),
        (LEVEL_200, '200 Level'),
        (LEVEL_300, '300 Level'),
        (LEVEL_400, '400 Level'),
        (SPILL_OVER_1, 'Spill Over 1'),
        (SPILL_OVER_2, 'Spill Over 2'),
        (SPILL_OVER_3, 'Spill Over 3'),
    ]

    staff = models.ForeignKey(LevelCoordinator, on_delete=models.CASCADE, related_name='level_cords', null=True)
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='level_cords', null=True)
    assigned_level = models.PositiveSmallIntegerField(choices=LEVELS, default=LEVEL_100)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    def __str__(self):
        if self.staff is not None:
            return self.staff.username
        return f'anonymous_staff'

    class Meta:
        verbose_name = 'Lecturer Coordinating Info'
        verbose_name_plural = 'Lecturers Coordinating Info'
        unique_together = ['programme', 'assigned_level']
        ordering = ['assigned_level', 'programme', ]

    def clean(self):
        try:
            level_cord_department = LevelCoordinatorProfile.objects.get(staff_id=self.staff).department
            allowed_programmes = Programme.objects.filter(department=level_cord_department)
            if self.programme not in allowed_programmes:
                raise ValidationError(
                    'The level coordinator you chose does not belong to the selected programme.'
                )
        except LevelCoordinatorProfile.DoesNotExist:
            pass
