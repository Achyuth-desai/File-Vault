from rest_framework import serializers
from .models import File
from django.conf import settings

class FileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'file_hash', 'uploaded_at', 'file_url']
        read_only_fields = ['id', 'file_hash', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        return request.build_absolute_uri(obj.file.url) 