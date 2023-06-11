# Generated by Django 4.1.4 on 2023-02-20 16:42

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_user_otp_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(max_length=18, validators=[django.core.validators.RegexValidator(message="Entered phone number isn't in a right format!", regex='^[0-9]{10,15}$')]),
        ),
    ]