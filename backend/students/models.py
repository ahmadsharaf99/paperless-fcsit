from django.core.exceptions import ValidationError
from django.db import models
from django.utils.safestring import mark_safe

from .managers import StudentManager
from .upload_to import StudentUploadTo
from core.models import User
from administration.models import AcademicSession, ToggleSession
from level_coordinating.models import LevelCoordinator
from faculty.models import Faculty, Department, Programme
from .validators import validate_file_size


class Student(User):
    class Meta:
        proxy = True

    students = StudentManager()

    def save(self, *args, **kwargs):
        self.role = User.Role.STUDENT
        self.is_student = True
        return super().save(*args, **kwargs)


class StudentProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "MALE", 'Male'
        FEMALE = "FEMALE", 'Female'

    class MaritalStatus(models.TextChoices):
        SINGLE = "SINGLE", 'single'
        MARRIED = "MARRIED", 'married'
        DIVORCED = "DIVORCED", 'divorced'
        WIDOWED = "WIDOWED", 'widowed'

    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='profiles')
    passport_photo = models.ImageField(upload_to=StudentUploadTo('passport_photo'), blank=True, null=True,
                                       validators=[validate_file_size])
    # has_graduated = models.BooleanField(default=False)
    level_coordinator = models.ForeignKey(LevelCoordinator, on_delete=models.SET_NULL, null=True, blank=True,
                                          related_name='students')
    dob = models.DateField('Date of Birth', blank=True, null=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True, default=Gender.MALE)
    marital_status = models.CharField(max_length=10, choices=MaritalStatus.choices, blank=True)
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True)

    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Students Profiles'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def passport_preview(self):
        return mark_safe(f'<img src="{self.passport_photo.url}" width="300" />')

    def __str__(self):
        return self.student.username


class StudentAcademicDetails(models.Model):
    class EntryStatus(models.TextChoices):
        FRESHMAN = "FR", 'Freshman'
        RETURNING = "RE", 'Returning'
        GRADUATED = "GR", 'Graduated'

    class EntryMode(models.TextChoices):
        DIRECT_ENTRY = "DE", 'Direct Entry'
        JAMB = "JAMB", 'JAMB'

    class StudyMode(models.TextChoices):
        FULL_TIME = "FULL_TIME", 'FULL_TIME'
        PART_TIME = "PART_TIME", 'PART_TIME'

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

    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='academic_details')
    mode_entry = models.CharField(max_length=4, choices=EntryMode.choices, default=EntryMode.JAMB)
    mode_study = models.CharField(max_length=10, choices=StudyMode.choices, default=StudyMode.FULL_TIME)
    entry_status = models.CharField(max_length=2, choices=EntryStatus.choices, default=EntryStatus.FRESHMAN)
    jamb_number = models.CharField(max_length=10, blank=True)
    grad_class = models.ForeignKey(AcademicSession, on_delete=models.SET_NULL, null=True, blank=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='faculty_students', blank=True,
                                null=True)
    current_level = models.PositiveSmallIntegerField(choices=LEVELS, default=LEVEL_100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='students', blank=True, null=True)
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='students', blank=True, null=True)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name = 'Student Academic Details'
        verbose_name_plural = 'Students Academic Details'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username

    def clean(self):
        is_faculty = Faculty.objects.filter(id=self.faculty_id, departments__in=[self.department_id])
        if not is_faculty.exists():
            raise ValidationError('The department selected does not belong to the chosen faculty')

        is_programme = is_faculty.filter(programmes__in=[self.programme_id])
        if not is_programme.exists():
            raise ValidationError('The programme selected does not belong to the chosen department')


class StudentGeneralDocs(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='general_records')
    birth_cert = models.ImageField('Birth Certificate', blank=True, null=True, validators=[validate_file_size],
                                   upload_to=StudentUploadTo('birth_certificate'), default='Image-Gallery-SVG.png')
    lg_cert = models.ImageField('Local Govt Certificate', blank=True, null=True, validators=[validate_file_size],
                                upload_to=StudentUploadTo('lg_certificate'), default='Image-Gallery-SVG.png')
    jamb_adm_cert = models.ImageField('JAMB Admission Letter', blank=True, null=True, validators=[validate_file_size],
                                      upload_to=StudentUploadTo('jamb_admission_letter'),
                                      default='Image-Gallery-SVG.png')
    school_adm_letter = models.ImageField('School Admission Letter', blank=True, null=True,
                                          validators=[validate_file_size],
                                          upload_to=StudentUploadTo('sch_admission_letter'),
                                          default='Image-Gallery-SVG.png')
    medical_fitness = models.ImageField(blank=True, null=True, validators=[validate_file_size],
                                        upload_to=StudentUploadTo('medical_fitness'), default='Image-Gallery-SVG.png')
    o_level = models.ImageField("O' Level Result", blank=True, validators=[validate_file_size], null=True,
                                upload_to=StudentUploadTo('o_level_result'), default='Image-Gallery-SVG.png')
    a_level = models.ImageField("A Level Result (For D.E. Students)", blank=True, validators=[validate_file_size],
                                null=True, upload_to=StudentUploadTo('a_level_result'), default='Image-Gallery-SVG.png')
    pri_cert = models.ImageField('Primary Certificate', blank=True, null=True, validators=[validate_file_size],
                                 upload_to=StudentUploadTo('primary_sch_cert'), default='Image-Gallery-SVG.png')
    sch_testimonial = models.ImageField('School Leaving Certificate', blank=True, null=True,
                                        validators=[validate_file_size],
                                        upload_to=StudentUploadTo('sch_testimonial'), default='Image-Gallery-SVG.png')
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name = 'Student General Docs'
        verbose_name_plural = 'Students General Docs'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username


class StudentPlaceOfOriginInfo(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='origins')
    country = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=25, blank=True)
    local_govt = models.CharField('Local Government Area', max_length=100, blank=True)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name = 'Student Place of Origin Info'
        verbose_name_plural = 'Student Origins Info'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username


class StudentContactInfo(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='contacts')
    home_address = models.CharField(max_length=255, blank=True)
    contact_address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name = 'Student Contact Record'
        verbose_name_plural = 'Student Contact Records'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username


class StudentNextOfKinInfo(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='next_kins')
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    relationship = models.CharField(max_length=25, blank=True)
    address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name = 'Student\'s Next of Kin Record'
        verbose_name_plural = 'Students\' Next of Kin Records'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username


class StudentHealthInfo(models.Model):
    class BloodGroup(models.TextChoices):
        TYPE_A_POS = "A+", 'A+'
        TYPE_A_NEG = "A-", 'A-'
        TYPE_B_POS = "B+", 'B+'
        TYPE_B_NEG = "B-", 'B-'
        TYPE_AB_POS = "AB+", 'AB+'
        TYPE_AB_NEG = "AB-", 'AB-'
        TYPE_O_POS = "O+", 'O+'
        TYPE_O_NEG = "O-", 'O-'

    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='health_records')
    health_status = models.CharField(max_length=40, blank=True)
    blood_group = models.CharField(max_length=30, choices=BloodGroup.choices, blank=True)
    disability = models.CharField(max_length=50, blank=True)
    medication = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name = 'Students Health Record'
        verbose_name_plural = 'Students Health Records'
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username


class RecordUploadTo:
    def __init__(self, name):
        self.name = name
        self.img_url = ''

    def __call__(self, instance, filename):
        reg = instance.student.username
        level = StudentAcademicDetails.objects.only('current_level').get(student=instance.student).current_level
        safe_reg_num = reg.replace('/', '_')
        self.img_url = f'students/{safe_reg_num}/{level}_{self.name}.jpg'
        return self.img_url

    def deconstruct(self):
        return ('students.models.RecordUploadTo', [self.img_url], {})


class StudentSessionalRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='sessional_records')
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.PROTECT)
    crf = models.ImageField('Course Registration Form', blank=True, null=True, validators=[validate_file_size],
                            upload_to=RecordUploadTo('CRF'))
    ras = models.ImageField('Registration Acknowledgement Slip', blank=True, null=True, validators=[validate_file_size],
                            upload_to=RecordUploadTo('RAS'))
    sif = models.ImageField('Student Information Form', blank=True, null=True, validators=[validate_file_size],
                            upload_to=RecordUploadTo('SIF'))
    spr = models.ImageField('Student Payment Receipt', blank=True, null=True, validators=[validate_file_size],
                            upload_to=RecordUploadTo('SPR'))
    add_and_drop_crf = models.ImageField('Add and Drop CRF', blank=True, null=True, validators=[validate_file_size],
                                         upload_to=RecordUploadTo('CRF'))
    sessional_result = models.ImageField('Sessional Result', blank=True, null=True, validators=[validate_file_size],
                                         upload_to=RecordUploadTo('result'))
    studies_suspension = models.ImageField('Studies Suspension Letter', blank=True, null=True,
                                           validators=[validate_file_size],
                                           upload_to=RecordUploadTo('suspension'))
    additional_doc_1 = models.ImageField('Additional Document 1', blank=True, null=True,
                                         validators=[validate_file_size],
                                         upload_to=RecordUploadTo('other_doc_1'))
    additional_doc_2 = models.ImageField('Additional Document 2', blank=True, null=True,
                                         validators=[validate_file_size],
                                         upload_to=RecordUploadTo('other_doc_2'))
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True, null=True)

    class Meta:
        verbose_name_plural = 'Student Sessional Records'
        unique_together = ('student', 'academic_session')
        ordering = ['-created_at']

    def reg_number(self):
        return self.student.username

    def __str__(self):
        return self.student.username

    def clean(self):
        try:
            if not ToggleSession.objects.get(session_id=self.academic_session).is_current_session:
                raise ValidationError('Sorry, registration for this session is not ongoing. Contact the admin')
        except ToggleSession.DoesNotExist:
            ToggleSession.objects.create(session=self.academic_session)
            raise ValidationError('Sorry, registration for this session is not ongoing. Contact the admin')


class StudentBulkUpload(models.Model):
    date_uploaded = models.DateTimeField(auto_now=True)
    csv_file = models.FileField('Student CSV', upload_to="students/bulkupload/", )

    def __str__(self):
        return self.csv_file.name

    class Meta:
        ordering = ['-date_uploaded']


class StudentSMSMessaging(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True)
    content = models.CharField(max_length=100)
    date_created = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.student.username

    class Meta:
        verbose_name = 'Student SMS Message'
        verbose_name_plural = 'Student SMS Messages'
