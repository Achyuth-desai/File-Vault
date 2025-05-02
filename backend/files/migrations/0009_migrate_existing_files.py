from django.db import migrations
import os
import shutil


def migrate_files_to_stored_files(apps, schema_editor):
    File = apps.get_model('files', 'File')
    StoredFile = apps.get_model('files', 'StoredFile')
    
    # Group files by hash to find duplicates
    files_by_hash = {}
    for file in File.objects.all():
        if not file.file_hash:
            continue
        if file.file_hash not in files_by_hash:
            files_by_hash[file.file_hash] = []
        files_by_hash[file.file_hash].append(file)
    
    # Create StoredFile records and update references
    for file_hash, files in files_by_hash.items():
        original_file = None
        for file in files:
            if not file.reference_file:
                original_file = file
                break
        
        if not original_file:
            continue
        
        # Create StoredFile record
        stored_file = StoredFile.objects.create(
            file=original_file.file,
            file_hash=file_hash,
            reference_count=len(files)
        )
        
        # Update all files with this hash to reference the StoredFile
        for file in files:
            file.stored_file = stored_file
            file.save()


def reverse_migrate_files(apps, schema_editor):
    File = apps.get_model('files', 'File')
    StoredFile = apps.get_model('files', 'StoredFile')
    
    # Copy file from StoredFile back to File
    for file in File.objects.all():
        if file.stored_file:
            file.file = file.stored_file.file
            file.save()
    
    # Delete all StoredFile records
    StoredFile.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0008_stored_file_model'),
    ]

    operations = [
        migrations.RunPython(migrate_files_to_stored_files, reverse_migrate_files),
    ] 