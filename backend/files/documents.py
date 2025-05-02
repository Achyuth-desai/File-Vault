from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import File

@registry.register_document
class FileDocument(Document):
    id = fields.KeywordField()
    original_filename = fields.TextField(
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField()
        }
    )
    file_type = fields.KeywordField()
    size = fields.LongField()
    uploaded_at = fields.DateField()

    class Index:
        name = 'files'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = File
        fields = [
            'file_hash'
        ]

    def prepare_original_filename(self, instance):
        return instance.original_filename

    def prepare_file_type(self, instance):
        return instance.file_type

    def prepare_size(self, instance):
        return instance.size

    def prepare_uploaded_at(self, instance):
        return instance.uploaded_at 