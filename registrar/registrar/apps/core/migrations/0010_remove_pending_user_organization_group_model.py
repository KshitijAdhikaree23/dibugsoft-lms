# Generated by Django 1.11.27 on 2020-01-30 16:15


from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_add_pending_user_group_model'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='pendinguserorganizationgroup',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='pendinguserorganizationgroup',
            name='organization_group',
        ),
        migrations.DeleteModel(
            name='PendingUserOrganizationGroup',
        ),
    ]
