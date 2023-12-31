# Generated by Django 3.2.20 on 2023-08-08 09:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('certificates', '0034_auto_20220401_1213'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalcertificateallowlist',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical certificate allowlist', 'verbose_name_plural': 'historical certificate allowlists'},
        ),
        migrations.AlterModelOptions(
            name='historicalcertificatedateoverride',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical certificate date override', 'verbose_name_plural': 'historical certificate date overrides'},
        ),
        migrations.AlterModelOptions(
            name='historicalcertificateinvalidation',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical certificate invalidation', 'verbose_name_plural': 'historical certificate invalidations'},
        ),
        migrations.AlterModelOptions(
            name='historicalgeneratedcertificate',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical generated certificate', 'verbose_name_plural': 'historical generated certificates'},
        ),
    ]
