from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_medicinereminder_last_sms_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatmessage',
            name='session_id',
            field=models.CharField(blank=True, db_index=True, default='', max_length=64),
        ),
    ]
