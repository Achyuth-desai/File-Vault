from django.apps import AppConfig
import atexit
import os
from django.conf import settings


class FilesConfig(AppConfig):
  default_auto_field = "django.db.models.BigAutoField"
  name = "files"

  def ready(self):
    # Only register cleanup if we're not in a test environment
    if not os.environ.get('DJANGO_TEST'):
      atexit.register(self.cleanup_files)

  def cleanup_files(self):
    """Clean up uploaded files when the application shuts down"""
    try:
      # Get the path to the media directory
      media_path = settings.MEDIA_ROOT
      if os.path.exists(media_path):
        # Remove all files in the uploads directory
        uploads_path = os.path.join(media_path, 'uploads')
        if os.path.exists(uploads_path):
          for filename in os.listdir(uploads_path):
            file_path = os.path.join(uploads_path, filename)
            try:
              if os.path.isfile(file_path):
                os.unlink(file_path)
            except Exception as e:
              print(f"Error deleting {file_path}: {e}")
    except Exception as e:
      print(f"Error during cleanup: {e}")
