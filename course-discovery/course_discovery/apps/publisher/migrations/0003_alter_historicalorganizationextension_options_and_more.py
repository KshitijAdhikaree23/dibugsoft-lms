# Generated by Django 4.2.5 on 2023-10-05 05:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0002_auto_20200804_1401'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalorganizationextension',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical organization extension', 'verbose_name_plural': 'historical organization extensions'},
        ),
        migrations.AlterModelOptions(
            name='historicalorganizationuserrole',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical organization user role', 'verbose_name_plural': 'historical organization user roles'},
        ),
    ]
