# Generated by Django 4.1.4 on 2023-02-20 10:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('level_coordinating', '0006_smsmessage'),
    ]

    operations = [
        migrations.RenameField(
            model_name='smsmessage',
            old_name='title',
            new_name='student_name',
        ),
    ]
