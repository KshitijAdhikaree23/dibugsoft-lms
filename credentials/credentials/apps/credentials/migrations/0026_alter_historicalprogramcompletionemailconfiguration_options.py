# Generated by Django 3.2.19 on 2023-06-23 09:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('credentials', '0025_change_usercredentialdateoverride_date'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalprogramcompletionemailconfiguration',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical program completion email configuration', 'verbose_name_plural': 'historical program completion email configurations'},
        ),
    ]
