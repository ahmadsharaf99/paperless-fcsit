# Generated by Django 4.1.7 on 2023-05-17 17:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0017_alter_studentgeneraldocs_a_level_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='studentprofile',
            name='has_graduated',
        ),
    ]