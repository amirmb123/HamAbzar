from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('disputes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dispute',
            name='penalty_amount',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
