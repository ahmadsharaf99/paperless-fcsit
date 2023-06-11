from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
# from sms import send_sms  # django dev sms

from administration.sms_utility import send_sms
from level_coordinating.models import LevelCoordinator
from students.models import (Student,
                             StudentProfile,
                             StudentAcademicDetails,
                             StudentGeneralDocs,
                             StudentPlaceOfOriginInfo,
                             StudentContactInfo,
                             StudentNextOfKinInfo,
                             StudentHealthInfo,
                             StudentSessionalRecord,
                             StudentSMSMessaging, )


@receiver(post_save, sender=Student)
def post_save_student(sender, instance, created, **kwargs):
    if created:
        StudentProfile.objects.only('student').create(student=instance)
        StudentAcademicDetails.objects.only('student').create(student=instance)
        StudentGeneralDocs.objects.only('student').create(student=instance)
        StudentPlaceOfOriginInfo.objects.only(
            'student').create(student=instance)
        StudentContactInfo.objects.only('student').create(student=instance)
        StudentNextOfKinInfo.objects.only('student').create(student=instance)
        StudentHealthInfo.objects.only('student').create(student=instance)
        body = f"Congratulations {instance.first_name}, your account has been pre-registered on" \
               f" Paperless-FCSIT portal. The OTP to activate your account is {instance.otp_code}"
        send_sms(body=body, receiver_number='+2347066402941')
        # send_sms(body, '+2347023236700', [instance.phone_number])
        print('Student tables created successfully!')


@receiver(post_save, sender=StudentAcademicDetails)
def post_save_student_academic_detail(sender, instance, created, **kwargs):
    student = Student.students.get(id=instance.student.id)
    student_level_cord = LevelCoordinator.objects.filter(level_cords__programme=instance.programme,
                                                         level_cords__assigned_level=instance.current_level)
    if student_level_cord.exists():
        student_profile = StudentProfile.objects.filter(student=student)
        student_profile.update(level_coordinator=student_level_cord.first())
    print('Student Level Cord Updated Successfully')


@receiver(post_save, sender=StudentProfile)
def post_save_profile(sender, created, instance, **kwargs):
    if instance.passport_photo and instance.dob and instance.gender and instance.marital_status:
        profile = StudentProfile.objects.filter(student=instance.student)
        profile.update(is_profile_complete=True)


@receiver(post_save, sender=StudentGeneralDocs)
def post_save_docs(sender, created, instance, **kwargs):
    if instance.birth_cert and instance.lg_cert and instance.jamb_adm_cert and instance.school_adm_letter and \
            instance.medical_fitness and instance.o_level and instance.pri_cert and instance.sch_testimonial:
        stud_docs = StudentGeneralDocs.objects.filter(student=instance.student)
        stud_docs.update(is_complete=True)


@receiver(post_save, sender=StudentSessionalRecord)
def post_save_record(sender, created, instance, **kwargs):
    if instance.crf and instance.ras and instance.sif and instance.spr:
        record = StudentSessionalRecord.objects.filter(
            student=instance.student)
        record.update(is_complete=True)


@receiver(post_save, sender=StudentSMSMessaging)
def post_save_sms_messaging(sender, instance, created, **kwargs):
    if created:
        # send an sms to student with verification code
        student = Student.objects.get(username=instance.student.username)

        body = f"Dear {student.first_name} {student.last_name}, {instance.content} \n\n " \
               f"Your Level Coordinator"
        send_sms(body=body, receiver_number='+2347066402941')
        # send_sms(
        #     body,
        #     '+2347023236700',
        #     [student.phone_number],
        #     fail_silently=False
        # )
