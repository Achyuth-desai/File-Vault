from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import File

@registry.register_document
class FileDocument(Document):
    original_filename = fields.TextField()
    file_type = fields.TextField()
    size = fields.IntegerField()
    file_hash = fields.TextField()
    uploaded_at = fields.DateField()

    class Index:
        name = 'files'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = File

    def prepare_size(self, instance):
        return instance.stored_file.file.size

    def prepare_file_hash(self, instance):
        return instance.stored_file.file_hash 