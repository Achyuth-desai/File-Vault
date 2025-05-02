from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0009_migrate_existing_files'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='stored_file',
            field=models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='file_records', to='files.storedfile'),
        ),
        migrations.RemoveField(
            model_name='file',
            name='file',
        ),
        migrations.RemoveField(
            model_name='file',
            name='file_hash',
        ),
        migrations.RemoveField(
            model_name='file',
            name='reference_file',
        ),
    ] 