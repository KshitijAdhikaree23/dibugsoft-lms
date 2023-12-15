# Generated by Django 3.2.20 on 2023-08-08 09:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0015_historicalprogramdiscussionsconfiguration_historicalprogramliveconfiguration_programdiscussionsconfi'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalprogramdiscussionsconfiguration',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical program discussions configuration', 'verbose_name_plural': 'historical program discussions configurations'},
        ),
        migrations.AlterModelOptions(
            name='historicalprogramliveconfiguration',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical program live configuration', 'verbose_name_plural': 'historical program live configurations'},
        ),
    ]
