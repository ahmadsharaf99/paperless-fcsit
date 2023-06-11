# Generated by Django 4.1.4 on 2023-02-21 06:57

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_user_is_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_password_changed',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(max_length=18, validators=[django.core.validators.RegexValidator(message="Entered phone number isn't in a right format!", regex='^(\\+|00)[1-9][0-9 \\-\\(\\)\\.]{7,32}$')]),
        ),
    ]