# Generated by Django 3.2.20 on 2023-08-08 09:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entitlements', '0015_add_unique_together_constraint'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalcourseentitlement',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical course entitlement', 'verbose_name_plural': 'historical course entitlements'},
        ),
        migrations.AlterModelOptions(
            name='historicalcourseentitlementsupportdetail',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical course entitlement support detail', 'verbose_name_plural': 'historical course entitlement support details'},
        ),
    ]
