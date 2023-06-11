from django.core.validators import RegexValidator
from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'ADMIN'
        STUDENT = 'STUDENT', 'STUDENT'
        LEVEL_CORD = 'LEVEL_CORD', 'LEVEL_CORD'

    base_role = Role.ADMIN
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    phone_num_regex = RegexValidator(
        regex="^(\+|00)[1-9][0-9 \-\(\)\.]{7,32}$", message="Entered phone number isn't in a right format!"
    )
    phone_number = models.CharField(
        validators=[phone_num_regex], max_length=18
    )
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=base_role)
    is_verified = models.BooleanField(default=False)
    is_password_changed = models.BooleanField(default=False)

    #   required
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_superadmin = models.BooleanField(default=False)

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'phone_number']

    objects = UserManager()

    def __str__(self):
        return self.username

    class Meta:
        ordering = ['-date_joined']

    @property
    def full_name(self):
        if self.middle_name is not None:
            return f'{self.first_name} {self.middle_name} {self.last_name}'
        return f'{self.first_name} {self.last_name}'

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True

    def save(self, *args, **kwargs):
        if not self.role or self.role is None:
            self.type = User.Role.ADMIN
        return super().save(*args, **kwargs)
