from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0002_toolimage_is_primary'),
    ]

    operations = [
        migrations.AddField(
            model_name='tool',
            name='address',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
