import math
import random
from django.contrib.auth.models import BaseUserManager


def generate_otp():
    digits = "0123456789"
    otp = ""

    for i in range(6):
        otp += digits[math.floor(random.random() * 10)]
    return otp


class UserManager(BaseUserManager):
    def create_user(self, first_name, email, last_name, phone_number, username, middle_name='', password=None):
        if not username:
            raise ValueError('username must be provided.')

        if not phone_number:
            raise ValueError('phone number must be provided.')

        if not email:
            raise ValueError('email must be provided.')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            phone_number=phone_number,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name
        )
        user.is_active = True
        user.set_password(phone_number)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, phone_number, first_name, last_name, password=None):
        if not username:
            raise ValueError('username must be provided.')

        if not phone_number:
            raise ValueError('phone number must be provided.')

        if not email:
            raise ValueError('email must be provided.')

        user = self.model(
            username=username,
            email=self.normalize_email(email),
            phone_number=phone_number,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        user.is_admin = True
        user.is_verified = True
        user.is_password_changed = True
        user.is_active = True
        user.is_staff = True
        user.is_superadmin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
