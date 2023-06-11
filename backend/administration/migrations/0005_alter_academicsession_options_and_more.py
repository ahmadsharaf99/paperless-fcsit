# Generated by Django 4.1.4 on 2023-02-19 11:06

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0004_academicsession_has_updated'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='academicsession',
            options={'ordering': ['-session'], 'verbose_name_plural': 'Academic Sessions'},
        ),
        migrations.AddField(
            model_name='academicsession',
            name='created_at',
            field=models.DateField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
