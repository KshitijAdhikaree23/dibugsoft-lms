# Generated by Django 3.2.20 on 2023-08-07 19:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('instructor_task', '0005_alter_instructortaskschedule_task'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalinstructortaskschedule',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical instructor task schedule', 'verbose_name_plural': 'historical instructor task schedules'},
        ),
    ]
