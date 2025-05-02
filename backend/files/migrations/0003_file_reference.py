from django.db import migrations, models
import uuid

class Migration(migrations.Migration):

    dependencies = [
        ('files', '0002_file_file_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='reference_file',
            field=models.UUIDField(null=True, blank=True, help_text='Reference to the original file if this is a duplicate'),
        ),
    ] 