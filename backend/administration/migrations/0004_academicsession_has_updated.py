# Generated by Django 4.1.4 on 2023-02-18 10:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0003_academicsession_is_update_level_cord'),
    ]

    operations = [
        migrations.AddField(
            model_name='academicsession',
            name='has_updated',
            field=models.BooleanField(default=False, editable=False),
        ),
    ]
