# Generated by Django 4.1.4 on 2023-02-14 00:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0008_alter_studentacademicdetails_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='studentbulkupload',
            options={'ordering': ['-date_uploaded']},
        ),
        migrations.AlterField(
            model_name='studentsessionalrecord',
            name='student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessional_records', to='students.student'),
        ),
    ]