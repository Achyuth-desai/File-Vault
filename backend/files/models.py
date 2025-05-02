from django.db import models
import uuid
import os
import shutil
from django.conf import settings
import logging
from django.db import transaction
from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver
from django.core.files import File
import tempfile

def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    upload_path = os.path.join('uploads', filename)
    
    # Ensure uploads directory exists and has proper permissions
    uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    os.chmod(uploads_dir, 0o777)
    
    return upload_path

@receiver(pre_delete, sender='files.File')
def handle_file_deletion(sender, instance, **kwargs):
    """Handle file deletion by copying the file to a new location if needed"""
    logger = logging.getLogger('files')
    logger.info(f"PRE_DELETE signal triggered for file {instance.id} ({instance.original_filename})")
    
    # For files with stored_file, check if there are other references
    if instance.stored_file:
        # Get the count of other references before this deletion
        other_references = File.objects.filter(stored_file=instance.stored_file).exclude(id=instance.id).count()
        if other_references > 0 and instance.stored_file.file:
            try:
                # Check if the file exists before trying to copy it
                if not os.path.exists(instance.stored_file.file.path):
                    logger.warning(f"File {instance.stored_file.file.path} does not exist, skipping copy")
                    return
                
                logger.info(f"File {instance.id} has {other_references} other references, preserving file before deletion")
                logger.info(f"Original file path: {instance.stored_file.file.path}")
                
                # Use a transaction to ensure atomicity
                with transaction.atomic():
                    # First, update the database to remove the file path
                    logger.info(f"Updating database to remove file path for {instance.id}")
                    File.objects.filter(id=instance.id).update(stored_file=None)
                    logger.info(f"Database updated, file path removed")
                    
                    # Now we can safely copy the file
                    # Generate a new filename
                    ext = instance.original_filename.split('.')[-1]
                    new_filename = f"{uuid.uuid4()}.{ext}"
                    new_path = os.path.join('uploads', new_filename)
                    
                    # Ensure uploads directory exists
                    uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
                    os.makedirs(uploads_dir, exist_ok=True)
                    os.chmod(uploads_dir, 0o777)
                    
                    # Copy the file to the new location
                    new_full_path = os.path.join(settings.MEDIA_ROOT, new_path)
                    shutil.copy2(instance.stored_file.file.path, new_full_path)
                    logger.info(f"Copied file to new location: {new_path}")
                    
                    # Find the first other reference and update it with the new file path
                    first_other = File.objects.filter(stored_file=instance.stored_file).exclude(id=instance.id).order_by('uploaded_at').first()
                    if first_other:
                        logger.info(f"Updating first other reference {first_other.id} with new file path")
                        first_other.stored_file.file = new_path
                        first_other.stored_file.save()
                        logger.info(f"First other reference updated with new file path: {new_path}")
            except Exception as e:
                logger.error(f"Error handling file deletion: {str(e)}")
                logger.exception("Full traceback:")
                # Don't raise the exception, let the deletion continue
    else:
        logger.info(f"File {instance.id} has no stored file, allowing normal deletion")

@receiver(post_delete, sender='files.File')
def cleanup_stored_file(sender, instance, **kwargs):
    """Clean up stored file after File deletion"""
    logger = logging.getLogger('files')
    logger.info(f"POST_DELETE signal triggered for file {instance.id} ({instance.original_filename})")
    
    if instance.stored_file:
        # Get the current reference count from the database
        stored_file = StoredFile.objects.get(id=instance.stored_file.id)
        # Decrement reference count
        stored_file.reference_count -= 1
        stored_file.save()
        
        # If no more references, delete the stored file
        if stored_file.reference_count <= 0:
            logger.info(f"No more references to stored file {stored_file.id}, deleting")
            if stored_file.file:
                stored_file.file.delete(save=False)
            stored_file.delete()

class StoredFile(models.Model):
    """Model to store physical files and manage reference counts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    file_hash = models.CharField(max_length=32, unique=True)
    reference_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def increment_reference_count(self):
        """Increment the reference count and save"""
        # Get the current reference count from the database
        self.refresh_from_db()
        self.reference_count += 1
        self.save()

    def __str__(self):
        return f"{self.file_hash} ({self.reference_count} references)"

class File(models.Model):
    """Model to store file metadata and references to stored files"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stored_file = models.ForeignKey(StoredFile, on_delete=models.CASCADE, related_name='file_records', null=True)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'files_metadata'  # Custom table name
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.original_filename

    def save(self, *args, **kwargs):
        """Override save to handle reference counting"""
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        # If this is a new file and has a stored_file, increment the reference count
        if is_new and self.stored_file:
            self.stored_file.increment_reference_count()
