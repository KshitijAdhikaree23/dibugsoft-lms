# Generated by Django 3.2.16 on 2023-01-11 13:00

from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('course_metadata', '0307_additional_metadata_end_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='Source',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name='modified')),
                ('name', models.CharField(help_text='Name of the external source.', max_length=255)),
                ('slug', django_extensions.db.fields.AutoSlugField(blank=True, editable=False, help_text='Leave this field blank to have the value generated automatically.', populate_from='name')),
                ('description', models.CharField(blank=True, help_text='Description of the external source.', max_length=255)),
            ],
            options={
                'get_latest_by': 'modified',
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='course',
            name='product_source',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='courses', to='course_metadata.source'),
        ),
        migrations.AddField(
            model_name='historicalcourse',
            name='product_source',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='course_metadata.source'),
        ),
        migrations.AddField(
            model_name='historicalprogram',
            name='product_source',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='course_metadata.source'),
        ),
        migrations.AddField(
            model_name='program',
            name='product_source',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='programs', to='course_metadata.source'),
        ),
    ]
