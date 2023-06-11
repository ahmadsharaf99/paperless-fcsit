import csv
import math
import os
import random
from io import StringIO

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from administration.models import AcademicSession, ToggleSession
from faculty.models import Faculty, Department, Programme
from students.models import (
    Student,
    StudentBulkUpload,
    StudentAcademicDetails,
    StudentProfile,
    StudentGeneralDocs,
    StudentPlaceOfOriginInfo,
    StudentContactInfo,
    StudentNextOfKinInfo,
    StudentHealthInfo,
)

TOTAL_REGISTERED = 0


def generate_otp():
    digits = "0123456789"
    otp = ""

    for i in range(6):
        otp += digits[math.floor(random.random() * 10)]
    return otp


@receiver(post_save, sender=StudentBulkUpload)
def post_save_student_bulk_upload(sender, created, instance, *args, **kwargs):
    if created:
        students = []
        student_academics = []
        student_profiles = []
        student_general_docs = []
        student_origins = []
        student_contacts = []
        student_kins = []
        student_health = []

        try:
            opened = StringIO(instance.csv_file.read().decode('UTF-8'))
            reading = csv.DictReader(opened, delimiter=',')

            for row in reading:
                if 'registration_number' in row and row['registration_number']:
                    username = row['registration_number'].strip()
                    email = row['email'].strip() if 'email' in row and row['email'] else ''
                    phone_number = row['phone_number'] if 'phone_number' in row and row['phone_number'] else ''
                    first_name = row['first_name'].strip() if 'first_name' in row and row['first_name'] else ''
                    middle_name = row['middle_name'].strip() if 'middle_name' in row and row['middle_name'] else ''
                    last_name = row['last_name'].strip() if 'last_name' in row and row['last_name'] else ''
                    faculty_code = row['faculty_code'].strip() if 'faculty_code' in row and row['faculty_code'] else ''
                    dept_code = row['department_code'].strip() if 'department_code' in row and row[
                        'department_code'] else ''
                    programme = row['programme'].strip() if 'programme' in row and row['programme'] else ''
                    level = row['level'].strip() if 'level' in row and row['level'] else ''
                    mode_entry = row['mode_of_entry'].strip() if 'mode_of_entry' in row and row['mode_of_entry'] else ''
                    jamb_number = row['jamb_number'].strip() if 'jamb_number' in row and row['jamb_number'] else ''

                    if phone_number[0] == '0':
                        phone_number = phone_number[1:]
                    if not phone_number.startswith('+234'):
                        phone_number = '+234' + phone_number

                    check = Student.students.filter(username=username, email=email).exists()
                    if not check:
                        faculty = Faculty.objects.only('faculty_code').get(faculty_code__exact=faculty_code)
                        department = Department.objects.only('dept_code').get(dept_code__exact=dept_code)
                        programme = Programme.objects.only('prog_name').get(prog_name__iregex=programme)
                        otp_code = generate_otp()
                        print('OTP CODE', otp_code)

                        student = Student(
                            username=username,
                            email=email,
                            role='STUDENT',
                            phone_number=phone_number,
                            otp_code=otp_code,
                            first_name=first_name,
                            middle_name=middle_name,
                            last_name=last_name,
                        )
                        student.is_active = True
                        student.set_password(phone_number)
                        students.append(student)

                        student_detail = StudentAcademicDetails(
                            student=student,
                            current_level=level,
                            faculty=faculty,
                            department=department,
                            programme=programme,
                            jamb_number=jamb_number,
                            mode_entry=mode_entry,
                        )
                        student_academics.append(student_detail)
                        student_profiles.append(StudentProfile(student=student))
                        student_general_docs.append(StudentGeneralDocs(student=student))
                        student_origins.append(StudentPlaceOfOriginInfo(student=student))
                        student_contacts.append(StudentContactInfo(student=student))
                        student_kins.append(StudentNextOfKinInfo(student=student))
                        student_health.append(StudentHealthInfo(student=student))

                        global TOTAL_REGISTERED
                        TOTAL_REGISTERED += 1
                    else:
                        continue
            Student.students.bulk_create(students)
            StudentAcademicDetails.objects.bulk_create(student_academics)
            StudentProfile.objects.bulk_create(student_profiles)
            StudentGeneralDocs.objects.bulk_create(student_general_docs)
            StudentPlaceOfOriginInfo.objects.bulk_create(student_origins)
            StudentContactInfo.objects.bulk_create(student_contacts)
            StudentNextOfKinInfo.objects.bulk_create(student_kins)
            StudentHealthInfo.objects.bulk_create(student_health)
            instance.csv_file.close()
            instance.delete()
        except UnicodeDecodeError as e:
            pass


def get_total_registered():
    return TOTAL_REGISTERED


def _delete_file(path):
    """Deletes file from filesystem."""
    if os.path.isfile(path):
        os.remove(path)


@receiver(post_delete, sender=StudentBulkUpload)
def delete_csv_file(sender, instance, *args, **kwargs):
    if instance.csv_file:
        _delete_file(instance.csv_file.path)


@receiver(post_save, sender=AcademicSession)
def post_save_session(sender, created, instance, *args, **kwargs):
    if created:
        ToggleSession.objects.create(session=instance)


@receiver(post_save, sender=AcademicSession)
def post_save_session_update(sender, created, instance, *args, **kwargs):
    session = AcademicSession.objects.filter(session=instance.session)
    selected = session.first()
    if selected.is_update_student_levels or selected.is_update_level_cord:
        session.update(has_updated=True)
    print('CREATED ACADEMIC SESSION')
