from django.core.management.base import BaseCommand
from django_elasticsearch_dsl.registries import registry

class Command(BaseCommand):
    help = 'Rebuild Elasticsearch index for all documents or specified apps'

    def add_arguments(self, parser):
        parser.add_argument(
            '--models',
            nargs='+',
            type=str,
            help='Specify the model names to update (e.g. files.File)'
        )

    def handle(self, *args, **options):
        self.stdout.write('Rebuilding Elasticsearch index...')
        models = options.get('models')
        
        if models:
            # Rebuild specific models
            for model_name in models:
                app_label, model_name = model_name.split('.')
                for doc in registry.get_documents():
                    if doc._django.model._meta.app_label == app_label and doc._django.model._meta.model_name == model_name.lower():
                        self.stdout.write(f'Rebuilding index for {model_name}')
                        doc().update()
                        break
        else:
            # Rebuild all documents
            for doc in registry.get_documents():
                model = doc._django.model
                self.stdout.write(f'Rebuilding index for {model._meta.app_label}.{model._meta.model_name}')
                doc().update()
        
        self.stdout.write(self.style.SUCCESS('Index rebuilding completed successfully!')) 