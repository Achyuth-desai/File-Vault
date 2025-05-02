from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import File
from .serializers import FileSerializer
import hashlib
import logging

logger = logging.getLogger('files')

# List of known MIME types and their extensions
KNOWN_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/gif': ['.gif'],
    'text/plain': ['.txt'],
    'text/x-python': ['.py'],
    'application/json': ['.json'],
    'text/csv': ['.csv'],
    'text/markdown': ['.md'],
    'application/parquet': ['.parquet'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    'application/x-7z-compressed': ['.7z'],
    'application/x-tar': ['.tar'],
    'application/gzip': ['.gz'],
    'text/html': ['.html', '.htm'],
    'text/css': ['.css'],
    'application/javascript': ['.js'],
    'application/typescript': ['.ts'],
    'text/x-java-source': ['.java'],
    'text/x-c': ['.c'],
    'text/x-c++': ['.cpp'],
    'text/x-c-header': ['.h'],
    'text/x-c++-header': ['.hpp'],
    'text/x-go': ['.go'],
    'text/x-rust': ['.rs'],
    'text/x-ruby': ['.rb'],
    'text/x-php': ['.php'],
    'text/x-shellscript': ['.sh'],
    'application/x-msdos-program': ['.bat'],
    'application/x-powershell': ['.ps1'],
    'application/sql': ['.sql'],
    'application/x-yaml': ['.yaml', '.yml'],
    'application/toml': ['.toml']
}

def calculate_file_hash(file_obj):
    """Calculate MD5 hash of a file"""
    md5_hash = hashlib.md5()
    for chunk in file_obj.chunks():
        md5_hash.update(chunk)
    return md5_hash.hexdigest()

def get_mime_type_from_extension(extension):
    """Get MIME type from file extension"""
    for mime_type, extensions in KNOWN_FILE_TYPES.items():
        if extension.lower() in [ext.lower() for ext in extensions]:
            return mime_type
    return 'application/octet-stream'

# Create your views here.
class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def list(self, request, *args, **kwargs):
        logger.info(f"Listing files with params: {request.query_params}")
        queryset = self.get_queryset()
        
        # Apply filters if provided
        file_type = request.query_params.get('file_type')
        logger.info(f"File type filter: {file_type}")
        if file_type:
            if file_type == 'other':
                # Filter out files with known MIME types
                queryset = queryset.exclude(file_type__in=KNOWN_FILE_TYPES.keys())
            # Check if it's a MIME type (contains '/')
            elif '/' in file_type:
                queryset = queryset.filter(file_type=file_type)
            else:
                # Filter by file extension
                mime_type = get_mime_type_from_extension(f'.{file_type}')
                queryset = queryset.filter(file_type=mime_type)
            
        min_size = request.query_params.get('min_size')
        if min_size:
            queryset = queryset.filter(size__gte=int(min_size))
            
        max_size = request.query_params.get('max_size')
        if max_size:
            queryset = queryset.filter(size__lte=int(max_size))
            
        start_date = request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(uploaded_at__gte=start_date)
            
        end_date = request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(uploaded_at__lte=end_date)
            
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
                content_type = get_mime_type_from_extension(f'.{ext}')
            
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
        
        # Start with the base queryset
        queryset = self.get_queryset()
        
        # Apply search query
        queryset = queryset.filter(original_filename__icontains=query)
        
        # Apply the same filters as the list endpoint
        file_type = request.query_params.get('file_type')
        logger.info(f"File type filter in search: {file_type}")
        if file_type:
            # Check if it's a MIME type (contains '/')
            if '/' in file_type:
                queryset = queryset.filter(file_type=file_type)
            else:
                # Filter by file extension
                mime_type = get_mime_type_from_extension(f'.{file_type}')
                queryset = queryset.filter(file_type=mime_type)
            
        min_size = request.query_params.get('min_size')
        if min_size:
            queryset = queryset.filter(size__gte=int(min_size))
            
        max_size = request.query_params.get('max_size')
        if max_size:
            queryset = queryset.filter(size__lte=int(max_size))
            
        start_date = request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(uploaded_at__gte=start_date)
            
        end_date = request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(uploaded_at__lte=end_date)
        
        # Order by most recent first
        queryset = queryset.order_by('-uploaded_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'files': serializer.data,
            'total': queryset.count(),
            'query': query
        })
