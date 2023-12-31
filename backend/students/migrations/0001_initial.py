# Generated by Django 4.1.4 on 2023-02-02 06:08

from django.db import migrations, models
import django.db.models.deletion
import django.db.models.manager
import students.models
import students.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
        ('administration', '0001_initial'),
        ('level_coordinating', '0001_initial'),
        ('faculty', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentBulkUpload',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_uploaded', models.DateTimeField(auto_now=True)),
                ('csv_file', models.FileField(upload_to='students/bulkupload/')),
            ],
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('core.user',),
            managers=[
                ('students', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='StudentProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('passport_photo', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size])),
                ('has_graduated', models.BooleanField(default=False)),
                ('pin_code', models.CharField(blank=True, max_length=6, null=True)),
                ('dob', models.DateField(blank=True, null=True, verbose_name='Date of Birth')),
                ('gender', models.CharField(blank=True, choices=[('MALE', 'Male'), ('FEMALE', 'Male')], default='MALE', max_length=10)),
                ('marital_status', models.CharField(blank=True, choices=[('SINGLE', 'single'), ('MARRIED', 'married'), ('DIVORCED', 'divorced'), ('WIDOWED', 'widowed')], max_length=10)),
                ('is_profile_complete', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('level_coordinator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students', to='level_coordinating.levelcoordinator')),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profiles', to='students.student')),
            ],
            options={
                'verbose_name': 'Student Profile',
                'verbose_name_plural': 'Students Profiles',
                'ordering': ['-student'],
            },
        ),
        migrations.CreateModel(
            name='StudentPlaceOfOriginInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('country', models.CharField(blank=True, max_length=50)),
                ('state', models.CharField(blank=True, max_length=25)),
                ('local_govt', models.CharField(blank=True, max_length=100, verbose_name='Local Government Area')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='origins', to='students.student')),
            ],
            options={
                'verbose_name': 'Student Place of Origin Info',
                'verbose_name_plural': 'Student Origins Info',
            },
        ),
        migrations.CreateModel(
            name='StudentNextOfKinInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(blank=True, max_length=255)),
                ('phone_number', models.CharField(blank=True, max_length=255)),
                ('email', models.EmailField(blank=True, max_length=255)),
                ('relationship', models.CharField(blank=True, max_length=25)),
                ('address', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='next_kins', to='students.student')),
            ],
            options={
                'verbose_name': "Student's Next of Kin Record",
                'verbose_name_plural': "Students' Next of Kin Records",
            },
        ),
        migrations.CreateModel(
            name='StudentHealthInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('health_status', models.CharField(blank=True, max_length=40)),
                ('blood_group', models.CharField(choices=[('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')], max_length=30)),
                ('disability', models.CharField(blank=True, max_length=50)),
                ('medication', models.CharField(blank=True, max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='health_records', to='students.student')),
            ],
            options={
                'verbose_name': 'Students Health Record',
                'verbose_name_plural': 'Students Health Records',
            },
        ),
        migrations.CreateModel(
            name='StudentGeneralDocs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('birth_cert', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Birth Certificate')),
                ('lg_cert', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Local Govt Certificate')),
                ('jamb_adm_cert', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='JAMB Admission Letter')),
                ('school_adm_letter', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='School Admission Letter')),
                ('medical_fitness', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size])),
                ('o_level', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name="O' Level Result")),
                ('pri_cert', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Primary Certificate')),
                ('sch_testimonial', models.ImageField(blank=True, null=True, upload_to=students.models.StudentUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='School Leaving Certificate')),
                ('is_complete', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='general_records', to='students.student')),
            ],
            options={
                'verbose_name': 'Student General Docs',
                'verbose_name_plural': 'Students General Docs',
            },
        ),
        migrations.CreateModel(
            name='StudentContactInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('home_address', models.CharField(blank=True, max_length=255)),
                ('contact_address', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='contacts', to='students.student')),
            ],
            options={
                'verbose_name': 'Student Contact Record',
                'verbose_name_plural': 'Student Contact Records',
            },
        ),
        migrations.CreateModel(
            name='StudentAcademicDetails',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode_entry', models.CharField(choices=[('DE', 'Direct Entry'), ('JAMB', 'JAMB')], default='JAMB', max_length=4)),
                ('mode_study', models.CharField(choices=[('FULL_TIME', 'FULL_TIME'), ('PART_TIME', 'PART_TIME')], default='FULL_TIME', max_length=10)),
                ('entry_status', models.CharField(choices=[('FR', 'Freshman'), ('RE', 'Returning'), ('GR', 'Graduated')], default='FR', max_length=2)),
                ('jamb_number', models.CharField(blank=True, max_length=10)),
                ('current_level', models.PositiveSmallIntegerField(choices=[(100, '100 Level'), (200, '200 Level'), (300, '300 Level'), (400, '400 Level'), (500, 'Spill Over 1'), (600, 'Spill Over 2'), (700, 'Spill Over 3')], default=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='students', to='faculty.department')),
                ('faculty', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='faculty_students', to='faculty.faculty')),
                ('grad_class', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='administration.academicsession')),
                ('programme', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='students', to='faculty.programme')),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='academic_details', to='students.student')),
            ],
            options={
                'verbose_name': 'Student Academic Details',
                'verbose_name_plural': 'Students Academic Details',
            },
        ),
        migrations.CreateModel(
            name='StudentSessionalRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('crf', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Course Registration Form')),
                ('ras', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Registration Acknowledgement Slip')),
                ('sif', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Student Information Form')),
                ('spr', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Student Payment Receipt')),
                ('add_and_drop_crf', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Add and Drop CRF')),
                ('sessional_result', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Sessional Result')),
                ('studies_suspension', models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo(''), validators=[students.validators.validate_file_size], verbose_name='Studies Suspension Letter')),
                ('is_complete', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('academic_session', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='administration.academicsession')),
                ('student', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='sessional_records', to='students.student')),
            ],
            options={
                'verbose_name_plural': 'Student Sessional Records',
                'unique_together': {('student', 'academic_session')},
            },
        ),
    ]
