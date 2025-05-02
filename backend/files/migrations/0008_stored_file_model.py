from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0007_alter_file_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='StoredFile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('file', models.FileField(upload_to='uploads/')),
                ('file_hash', models.CharField(max_length=64)),
                ('reference_count', models.PositiveIntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.AddField(
            model_name='file',
            name='stored_file',
            field=models.ForeignKey(null=True, on_delete=models.deletion.CASCADE, related_name='file_records', to='files.storedfile'),
        ),
    ] 