# Generated by Django 3.2.8 on 2022-04-27 05:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taxonomy_support', '0002_updatecourserecommendationsconfig'),
    ]

    operations = [
        migrations.AddField(
            model_name='updatecourserecommendationsconfig',
            name='num_past_days',
            field=models.IntegerField(default=10, verbose_name='Adds recommendations for courses created or modified in the past num days'),
        ),
    ]
