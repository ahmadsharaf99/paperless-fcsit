# Generated by Django 4.1.4 on 2023-02-03 21:28

from django.db import migrations, models
import students.models
import students.validators


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0002_alter_studentprofile_gender'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentsessionalrecord',
            name='additional_doc_1',
            field=models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo, validators=[students.validators.validate_file_size], verbose_name='Additional Document 1'),
        ),
        migrations.AddField(
            model_name='studentsessionalrecord',
            name='additional_doc_2',
            field=models.ImageField(blank=True, null=True, upload_to=students.models.RecordUploadTo, validators=[students.validators.validate_file_size], verbose_name='Additional Document 2'),
        ),
    ]