from django.shortcuts import render
from rest_framework import viewsets, status, pagination
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.conf import settings
from elasticsearch_dsl import Q
from .models import File
from .documents import FileDocument
from .serializers import FileSerializer
import hashlib
import logging
from .models import StoredFile
from django.db import models

logger = logging.getLogger('files')

# Cache version key for search results
SEARCH_CACHE_VERSION_KEY = 'file_search_cache_version'
# Default version if not set
DEFAULT_CACHE_VERSION = 1

# Get current search cache version
def get_search_cache_version():
    version = cache.get(SEARCH_CACHE_VERSION_KEY, DEFAULT_CACHE_VERSION)
    return version

# Increment search cache version to invalidate all search caches
def invalidate_search_cache():
    version = get_search_cache_version()
    cache.set(SEARCH_CACHE_VERSION_KEY, version + 1)
    logger.info(f"Search cache invalidated. New version: {version + 1}")

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

# Configure pagination
class FilePagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Create your views here.
class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    pagination_class = FilePagination

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
            # Calculate hash using the original file object
            file_hash = calculate_file_hash(file_obj)
            file_obj.seek(0)  # Reset file pointer after hash calculation
            
            # Check for existing stored file
            stored_file = StoredFile.objects.filter(file_hash=file_hash).first()
            if stored_file:
                logger.info(f"Duplicate file detected: {file_obj.name} (hash: {file_hash}) - Creating reference")
                # Reference count will be incremented in File.save()
            else:
                logger.info(f"New file detected: {file_obj.name} (hash: {file_hash})")
                # Create new stored file
                stored_file = StoredFile.objects.create(
                    file=file_obj,
                    file_hash=file_hash
                )
            
            # Create file record
            data = {
                'stored_file': stored_file.id,  # Pass the ID instead of the instance
                'original_filename': file_obj.name,
                'file_type': file_obj.content_type,
                'size': file_obj.size
            }
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            logger.info(f"File uploaded successfully: {file_obj.name} (id: {serializer.data['id']})")
            return Response({
                'id': serializer.data['id'],
                'message': 'File uploaded successfully',
                'is_reference': not stored_file.reference_count == 1
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error uploading file {file_obj.name}: {str(e)}")
            return Response({
                'error': f'Error uploading file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info(f"Deleting file: {instance.original_filename} (id: {instance.id})")
        
        # Delete the database record (this will handle reference counting)
        self.perform_destroy(instance)
        
        # Invalidate all search caches by incrementing the version
        invalidate_search_cache()
        
        logger.info(f"File deleted successfully: {instance.original_filename}")
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search for files using Elasticsearch with advanced search capabilities.
        """
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({
                'error': 'Search query parameter "q" is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Convert query to lowercase to ensure case-insensitive search
        query = query.lower()

        # Generate cache key based on query, filters and cache version
        file_type = request.query_params.get('file_type', '')
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', self.pagination_class.page_size)
        cache_version = get_search_cache_version()
        cache_key = f'search_{query}_{file_type}_{page}_{page_size}_v{cache_version}'
        
        # Try to get cached results
        cached_results = cache.get(cache_key)
        if cached_results:
            logger.info(f"Returning cached search results for query: {query}")
            return Response(cached_results)

        logger.info(f"Searching files with query: {query}")
        
        # Build Elasticsearch query
        search = FileDocument.search()
        
        # Add search query with multiple matching strategies
        search = search.query(
            Q('bool',
              should=[
                  Q('prefix', original_filename=query),
                  Q('match_phrase', original_filename={'query': query, 'slop': 2}),
                  Q('wildcard', original_filename={'value': f'*{query}*'}),
                  Q('match', original_filename={'query': query, 'fuzziness': 'AUTO'})
              ],
              minimum_should_match=1)
        )
        
        # Apply file type filter if provided
        if file_type:
            if '/' in file_type:
                search = search.filter('term', file_type=file_type)
            else:
                mime_type = get_mime_type_from_extension(f'.{file_type}')
                search = search.filter('term', file_type=mime_type)

        # Apply pagination
        start = (int(page) - 1) * int(page_size)
        search = search[start:start + int(page_size)]
        
        # Execute search
        response = search.execute()
        logger.info(f"Elasticsearch query: {search.to_dict()}")
        logger.info(f"Elasticsearch response: {response.to_dict()}")
        
        # Get total count
        total = response.hits.total.value
        logger.info(f"Total hits: {total}")
        
        # Get file IDs from search results
        file_ids = [hit.meta.id for hit in response]
        logger.info(f"Found file IDs: {file_ids}")
        
        # Get actual file objects
        files = File.objects.filter(id__in=file_ids)
        logger.info(f"Found files: {files}")
        
        # Serialize results
        serializer = self.get_serializer(files, many=True)
        
        # Prepare response data
        response_data = {
            'files': serializer.data,
            'total': total,
            'query': query,
            'page': int(page),
            'page_size': int(page_size)
        }
        
        # Cache the results for 5 minutes
        cache.set(cache_key, response_data, timeout=300)
        
        return Response(response_data)

    @action(detail=False, methods=['get'])
    def storage_stats(self, request):
        """
        Provides statistics about file storage efficiency including:
        - Total number of files
        - Number of unique files
        - Number of duplicate references
        - Total space used (if all files were stored individually)
        - Actual space used (with deduplication)
        - Space saved through deduplication
        """
        # Get total file count
        total_files = File.objects.count()
        
        # Get unique file count (StoredFile entries)
        unique_files = StoredFile.objects.count()
        
        # Calculate duplicate references
        duplicate_files = total_files - unique_files
        
        # Calculate total size if all files were stored individually
        total_size = File.objects.aggregate(total=models.Sum('size'))['total'] or 0
        
        # Calculate actual storage used (sum of unique StoredFile sizes)
        # We join to get the size from File model since that's where size is stored
        stored_files = StoredFile.objects.all()
        actual_size = 0
        for stored_file in stored_files:
            # Get the size from any file reference (they all have the same size)
            file_ref = File.objects.filter(stored_file=stored_file).first()
            if file_ref:
                actual_size += file_ref.size
        
        # Calculate space saved
        space_saved = total_size - actual_size
        
        # Calculate percentage saved
        percentage_saved = (space_saved / total_size * 100) if total_size > 0 else 0
        
        stats = {
            'total_files': total_files,
            'unique_files': unique_files,
            'duplicate_files': duplicate_files,
            'total_size': total_size,  # Size if all files were stored individually
            'actual_size': actual_size,  # Actual storage used
            'space_saved': space_saved,  # Bytes saved
            'percentage_saved': round(percentage_saved, 2),  # Percentage saved
        }
        
        logger.info(f"Storage statistics: {stats}")
        return Response(stats)
