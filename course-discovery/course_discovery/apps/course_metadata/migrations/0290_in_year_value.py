# Generated by Django 3.2.13 on 2022-07-29 18:00

from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('course_metadata', '0289_degree_loader_configuration'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name='modified')),
                ('per_lead_usa', models.IntegerField(blank=True, default=0, help_text='U.S. value per lead in U.S. dollars.', null=True, verbose_name='U.S. Value Per Lead')),
                ('per_lead_international', models.IntegerField(blank=True, default=0, help_text='International value per lead in U.S. dollars.', null=True, verbose_name='International Value Per Lead')),
                ('per_click_usa', models.IntegerField(blank=True, default=0, help_text='U.S. value per click in U.S. dollars.', null=True, verbose_name='U.S. Value Per Click')),
                ('per_click_international', models.IntegerField(blank=True, default=0, help_text='International value per click in U.S. dollars.', null=True, verbose_name='International Value Per Click')),
            ],
            options={
                'get_latest_by': 'modified',
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='course',
            name='in_year_value',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='courses', to='course_metadata.productvalue'),
        ),
        migrations.AddField(
            model_name='historicalcourse',
            name='in_year_value',
            field=models.ForeignKey(blank=True, db_constraint=False, default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='course_metadata.productvalue'),
        ),
        migrations.AddField(
            model_name='historicalprogram',
            name='in_year_value',
            field=models.ForeignKey(blank=True, db_constraint=False, default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='course_metadata.productvalue'),
        ),
        migrations.AddField(
            model_name='program',
            name='in_year_value',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='programs', to='course_metadata.productvalue'),
        ),
    ]
