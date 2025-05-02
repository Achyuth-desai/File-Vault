from rest_framework import serializers
from .models import File, StoredFile
from django.conf import settings

class StoredFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoredFile
        fields = ['id', 'file_hash', 'reference_count', 'created_at']
        read_only_fields = ['id', 'file_hash', 'reference_count', 'created_at']

class FileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    stored_file = serializers.PrimaryKeyRelatedField(queryset=StoredFile.objects.all())

    class Meta:
        model = File
        fields = ['id', 'stored_file', 'original_filename', 'file_type', 'size', 'uploaded_at', 'file_url']
        read_only_fields = ['id', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        return request.build_absolute_uri(obj.stored_file.file.url)

    def to_representation(self, instance):
        """Convert the instance to a representation that includes the stored_file details"""
        ret = super().to_representation(instance)
        ret['stored_file'] = StoredFileSerializer(instance.stored_file).data
        return ret

    def create(self, validated_data):
        """Create a new file record with a stored file"""
        # The view will handle creating the StoredFile and passing it in validated_data
        return super().create(validated_data) 