from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import File
from .serializers import FileSerializer
import hashlib
import logging

logger = logging.getLogger('files')

def calculate_file_hash(file_obj):
    """Calculate MD5 hash of a file"""
    md5_hash = hashlib.md5()
    for chunk in file_obj.chunks():
        md5_hash.update(chunk)
    return md5_hash.hexdigest()

# Create your views here.
class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def list(self, request, *args, **kwargs):
        logger.info(f"Listing files")
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'files': serializer.data,
            'total': queryset.count()
        })

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            logger.warning("No file provided in upload request")
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            logger.info(f"Processing file upload: {file_obj.name}")
            # Calculate file hash
            file_hash = calculate_file_hash(file_obj)
            
            # Check for duplicate file by hash or filename
            existing_file = File.objects.filter(
                file_hash=file_hash
            ).first() or File.objects.filter(
                original_filename=file_obj.name
            ).first()

            if existing_file:
                logger.warning(f"Duplicate file detected: {file_obj.name} (hash: {file_hash})")
                return Response({
                    'error': 'File already exists',
                    'existing_file': {
                        'id': str(existing_file.id),
                        'name': existing_file.original_filename,
                        'size': existing_file.size,
                        'uploaded_at': existing_file.uploaded_at
                    }
                }, status=status.HTTP_409_CONFLICT)
            
            # Get file type from content type or extension
            content_type = file_obj.content_type
            if not content_type or content_type == 'application/octet-stream':
                ext = file_obj.name.split('.')[-1].lower()
                content_type = {
                    'py': 'text/x-python',
                    'json': 'application/json',
                    'csv': 'text/csv',
                    'txt': 'text/plain',
                    'md': 'text/markdown',
                }.get(ext, 'application/octet-stream')
            
            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': content_type,
                'size': file_obj.size,
                'file_hash': file_hash
            }
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            logger.info(f"File uploaded successfully: {file_obj.name} (id: {serializer.data['id']})")
            return Response({
                'id': serializer.data['id'],
                'message': 'File uploaded successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error uploading file {file_obj.name}: {str(e)}")
            return Response({
                'error': f'Error uploading file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info(f"Deleting file: {instance.original_filename} (id: {instance.id})")
        # Delete the file from storage
        instance.file.delete(save=False)
        # Delete the database record
        self.perform_destroy(instance)
        logger.info(f"File deleted successfully: {instance.original_filename}")
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search for files by filename using case-insensitive partial matching.
        """
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({
                'error': 'Search query parameter "q" is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Searching files with query: {query}")
        
        # Use case-insensitive contains search on original_filename
        queryset = File.objects.filter(original_filename__icontains=query)
        
        # Order by most recent first
        queryset = queryset.order_by('-uploaded_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'files': serializer.data,
            'total': queryset.count(),
            'query': query
        })
