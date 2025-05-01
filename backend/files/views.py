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
        logger.info(f"Listing files with params: {request.query_params}")
        queryset = self.get_queryset()
        
        # Apply filters if provided
        file_type = request.query_params.get('file_type')
        logger.info(f"File type filter: {file_type}")
        if file_type:
            # Check if it's a MIME type (contains '/')
            if '/' in file_type:
                queryset = queryset.filter(file_type=file_type)
            else:
                # Filter by file extension
                queryset = queryset.filter(original_filename__iendswith=file_type)
            
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
                content_type = {
                    'py': 'text/x-python',
                    'json': 'application/json',
                    'csv': 'text/csv',
                    'txt': 'text/plain',
                    'md': 'text/markdown',
                    'parquet': 'application/parquet',
                    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'xls': 'application/vnd.ms-excel',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'doc': 'application/msword',
                    'ppt': 'application/vnd.ms-powerpoint',
                    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'zip': 'application/zip',
                    'rar': 'application/x-rar-compressed',
                    '7z': 'application/x-7z-compressed',
                    'tar': 'application/x-tar',
                    'gz': 'application/gzip',
                    'xml': 'application/xml',
                    'html': 'text/html',
                    'css': 'text/css',
                    'js': 'application/javascript',
                    'ts': 'application/typescript',
                    'java': 'text/x-java-source',
                    'c': 'text/x-c',
                    'cpp': 'text/x-c++',
                    'h': 'text/x-c-header',
                    'hpp': 'text/x-c++-header',
                    'go': 'text/x-go',
                    'rs': 'text/x-rust',
                    'rb': 'text/x-ruby',
                    'php': 'text/x-php',
                    'sh': 'text/x-shellscript',
                    'bat': 'application/x-msdos-program',
                    'ps1': 'application/x-powershell',
                    'sql': 'application/sql',
                    'yaml': 'application/x-yaml',
                    'yml': 'application/x-yaml',
                    'toml': 'application/toml',
                    'ini': 'text/plain',
                    'conf': 'text/plain',
                    'log': 'text/plain',
                    'dat': 'application/octet-stream',
                    'bin': 'application/octet-stream',
                    'exe': 'application/x-msdownload',
                    'dll': 'application/x-msdownload',
                    'so': 'application/x-sharedlib',
                    'dylib': 'application/x-mach-binary',
                    'class': 'application/java-vm',
                    'jar': 'application/java-archive',
                    'war': 'application/java-archive',
                    'ear': 'application/java-archive',
                    'apk': 'application/vnd.android.package-archive',
                    'ipa': 'application/x-itunes-ipa',
                    'deb': 'application/x-debian-package',
                    'rpm': 'application/x-rpm',
                    'iso': 'application/x-iso9660-image',
                    'img': 'application/octet-stream',
                    'dmg': 'application/x-apple-diskimage',
                    'vhd': 'application/x-vhd',
                    'vhdx': 'application/x-vhdx',
                    'ova': 'application/x-virtualbox-ova',
                    'ovf': 'application/x-virtualbox-ovf',
                    'vmdk': 'application/x-vmdk',
                    'qcow2': 'application/x-qcow2',
                    'raw': 'application/octet-stream',
                    'vdi': 'application/x-virtualbox-vdi',
                    'vbox': 'application/x-virtualbox-vbox',
                    'vbox-extpack': 'application/x-virtualbox-extpack',
                    'vbox-settings': 'application/x-virtualbox-settings',
                    'vbox-prev': 'application/x-virtualbox-prev',
                    'vbox-sav': 'application/x-virtualbox-sav',
                    'vbox-tmp': 'application/x-virtualbox-tmp',
                    'vbox-cid': 'application/x-virtualbox-cid',
                    'vbox-evm': 'application/x-virtualbox-evm',
                    'vbox-nvram': 'application/x-virtualbox-nvram',
                    'vbox-ovf': 'application/x-virtualbox-ovf',
                    'vbox-snap': 'application/x-virtualbox-snap',
                    'vbox-vmdk': 'application/x-virtualbox-vmdk',
                    'vbox-vhd': 'application/x-virtualbox-vhd',
                    'vbox-vhdx': 'application/x-virtualbox-vhdx',
                    'vbox-iso': 'application/x-virtualbox-iso',
                    'vbox-floppy': 'application/x-virtualbox-floppy',
                    'vbox-dvd': 'application/x-virtualbox-dvd',
                    'vbox-hdd': 'application/x-virtualbox-hdd',
                    'vbox-cdrom': 'application/x-virtualbox-cdrom',
                    'vbox-fdd': 'application/x-virtualbox-fdd',
                    'vbox-hd': 'application/x-virtualbox-hd',
                    'vbox-cd': 'application/x-virtualbox-cd',
                    'vbox-fd': 'application/x-virtualbox-fd',
                    'vbox-h': 'application/x-virtualbox-h',
                    'vbox-c': 'application/x-virtualbox-c',
                    'vbox-f': 'application/x-virtualbox-f',
                    'vbox-': 'application/x-virtualbox-',
                    'vdi': 'application/x-virtualbox-vdi',
                    'vmdk': 'application/x-virtualbox-vmdk',
                    'vhd': 'application/x-virtualbox-vhd',
                    'vhdx': 'application/x-virtualbox-vhdx',
                    'iso': 'application/x-virtualbox-iso',
                    'floppy': 'application/x-virtualbox-floppy',
                    'dvd': 'application/x-virtualbox-dvd',
                    'hdd': 'application/x-virtualbox-hdd',
                    'cdrom': 'application/x-virtualbox-cdrom',
                    'fdd': 'application/x-virtualbox-fdd',
                    'hd': 'application/x-virtualbox-hd',
                    'cd': 'application/x-virtualbox-cd',
                    'fd': 'application/x-virtualbox-fd',
                    'h': 'application/x-virtualbox-h',
                    'c': 'application/x-virtualbox-c',
                    'f': 'application/x-virtualbox-f',
                    '-': 'application/x-virtualbox-',
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
                queryset = queryset.filter(original_filename__iendswith=file_type)
            
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
