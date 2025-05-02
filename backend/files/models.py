from django.db import models
import uuid
import os
from django.conf import settings

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

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    file_hash = models.CharField(max_length=32, unique=True, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'files_metadata'  # Custom table name
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.original_filename

    def delete(self, *args, **kwargs):
        """Override delete to ensure the file is deleted from storage"""
        if self.file:
            # Delete the file from storage
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
