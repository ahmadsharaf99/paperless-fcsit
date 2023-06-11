from core.managers import UserManager
from core.models import User
# from administration.sms_utility import send_sms
from sms import send_sms


class StudentManager(UserManager):
    def get_queryset(self, *args, **kwargs):
        queryset = super().get_queryset(*args, **kwargs)
        queryset = queryset.filter(role=User.Role.STUDENT)
        return queryset

    def bulk_create(self, objs, batch_size=None, ignore_conflicts=False):
        super(StudentManager, self).bulk_create(objs)

        # send an SMS to student with verification OTP code
        for student in objs:
            body = f"Congratulations {student.first_name}, your account has been pre-registered on" \
                   f" Paperless-FCSIT portal. The OTP to activate your account is {student.otp_code}"
            send_sms(
                body,
                '+12065550100',
                [student.phone_number],
                fail_silently=False
            )
            # send_sms(body=body, receiver_number=student.phone_number)
