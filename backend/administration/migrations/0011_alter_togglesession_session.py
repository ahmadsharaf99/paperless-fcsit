# Generated by Django 4.1.7 on 2023-05-22 13:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0010_alter_togglesession_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='togglesession',
            name='session',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='toggle_session', to='administration.academicsession'),
        ),
    ]
