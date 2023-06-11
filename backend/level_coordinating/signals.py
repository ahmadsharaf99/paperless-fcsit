from django.db.models.signals import post_save
from django.dispatch import receiver
from sms import send_sms  # django dev sms

# from administration.sms_utility import send_sms
from level_coordinating.models import LevelCoordinator, LevelCoordinatorProfile, CoordinatingInfo
from students.models import StudentProfile


@receiver(post_save, sender=LevelCoordinator)
def post_save_level_cord(sender, instance, created, **kwargs):
    if created:
        LevelCoordinatorProfile.objects.create(staff=instance)
        CoordinatingInfo.objects.create(staff=instance)
        body = f"Dear {instance.first_name}, your level coordinator account has been pre-registered on" \
               f" Paperless-FCSIT portal with username: {instance.username}. The OTP to activate your account is {instance.otp_code}"
        # send_sms(body=body, receiver_number=instance.phone_number)
        send_sms(
            body,
            '+2347023236700',
            [instance.phone_number],
            fail_silently=False )
        print('Level Cord tables created successfully!')


@receiver(post_save, sender=CoordinatingInfo)
def post_save_coordinator(sender, instance, created, **kwargs):
    try:
        level_cord = LevelCoordinator.objects.get(id=instance.staff_id)
        staff_students = StudentProfile.objects.filter(
            student__academic_details__current_level=instance.assigned_level,
            student__academic_details__programme=instance.programme,
        )
        if staff_students.exists():
            staff_students.update(level_coordinator=level_cord)
    except LevelCoordinator.DoesNotExist:
        pass
    print('Student level cords updated successfully!')
