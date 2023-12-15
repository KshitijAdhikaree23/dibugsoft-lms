# -*- coding: utf-8 -*-
# Generated by Django 1.11.26 on 2019-11-15 21:51


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offer', '0027_auto_20190913_1756'),
    ]

    operations = [
        migrations.AlterField(
            model_name='historicalbenefit',
            name='type',
            field=models.CharField(blank=True, choices=[('Percentage', "Discount is a percentage off of the product's value"), ('Absolute', "Discount is a fixed amount off of the product's value"), ('Multibuy', 'Discount is to give the cheapest product for free'), ('Fixed price', 'Get the products that meet the condition for a fixed price'), ('Shipping absolute', 'Discount is a fixed amount of the shipping cost'), ('Shipping fixed price', 'Get shipping for a fixed price'), ('Shipping percentage', 'Discount is a percentage off of the shipping cost')], max_length=128, verbose_name='Type'),
        ),
        migrations.AlterField(
            model_name='historicalcondition',
            name='type',
            field=models.CharField(blank=True, choices=[('Count', 'Depends on number of items in basket that are in condition range'), ('Value', 'Depends on value of items in basket that are in condition range'), ('Coverage', 'Needs to contain a set number of DISTINCT items from the condition range')], max_length=128, verbose_name='Type'),
        ),
        migrations.AlterField(
            model_name='historicalconditionaloffer',
            name='offer_type',
            field=models.CharField(choices=[('Site', 'Site offer - available to all users'), ('Voucher', 'Voucher offer - only available after entering the appropriate voucher code'), ('User', 'User offer - available to certain types of user'), ('Session', 'Session offer - temporary offer, available for a user for the duration of their session')], default='Site', max_length=128, verbose_name='Type'),
        ),
        migrations.AlterField(
            model_name='historicalconditionaloffer',
            name='status',
            field=models.CharField(default='Open', max_length=64, verbose_name='Status'),
        ),
        migrations.AlterField(
            model_name='historicalofferassignment',
            name='status',
            field=models.CharField(choices=[('EMAIL_PENDING', 'Email to user pending.'), ('ASSIGNED', 'Code successfully assigned to user.'), ('REDEEMED', 'Code has been redeemed by user.'), ('EMAIL_BOUNCED', 'Email to user bounced.'), ('REVOKED', 'Code has been revoked for this user.')], default='EMAIL_PENDING', max_length=255),
        ),
    ]
