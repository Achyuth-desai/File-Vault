from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import File
from .documents import FileDocument
import logging

@receiver(post_save, sender=File)
def update_document(sender, instance=None, created=False, **kwargs):
    """Update the Elasticsearch document when a File is saved."""
    FileDocument().update(instance)

@receiver(post_delete, sender=File)
def delete_document(sender, instance=None, **kwargs):
    """Delete the Elasticsearch document when a File is deleted."""
    try:
        doc = FileDocument()
        doc.meta.id = instance.id
        doc.delete()
    except Exception as e:
        # Log the error but don't prevent the deletion
        logger = logging.getLogger('files')
        logger.error(f"Error deleting Elasticsearch document: {str(e)}") 