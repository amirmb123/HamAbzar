from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rentals', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # حذف فیلد قدیمی user
        migrations.RemoveField(
            model_name='transaction',
            name='user',
        ),
        # اضافه کردن from_user
        migrations.AddField(
            model_name='transaction',
            name='from_user',
            field=models.ForeignKey(
                blank=True, null=True,
                help_text='کاربری که پول از کیف پولش کم شد (null = سیستم/پلتفرم)',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='outgoing_transactions',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # اضافه کردن to_user
        migrations.AddField(
            model_name='transaction',
            name='to_user',
            field=models.ForeignKey(
                blank=True, null=True,
                help_text='کاربری که پول به کیف پولش اضافه شد (null = سیستم/پلتفرم)',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='incoming_transactions',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # amount از IntegerField به PositiveIntegerField
        migrations.AlterField(
            model_name='transaction',
            name='amount',
            field=models.PositiveIntegerField(),
        ),
    ]
