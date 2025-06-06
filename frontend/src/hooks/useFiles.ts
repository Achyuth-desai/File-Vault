import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile, getFiles, getFileDetails, deleteFile, searchFiles } from '../services/api';
import { FileMetadata, FileListResponse, FileUploadResponse, FileSearchResponse, ApiError } from '../types/file';
import { useState, useEffect } from 'react';

// Custom hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useFiles = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState({
    fileType: '',
    minSize: '',
    maxSize: '',
    startDate: '',
    endDate: '',
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedFilters = useDebounce(filters, 300);

  // Query for listing all files or searching files
  const { data: files, isLoading, error, refetch } = useQuery<FileListResponse | FileSearchResponse, ApiError>({
    queryKey: ['files', 'list', debouncedSearchQuery, debouncedFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) {
        params.append('q', debouncedSearchQuery);
      }
      if (debouncedFilters.fileType) {
        console.log('Setting file type filter:', debouncedFilters.fileType);
        // For XML files, ensure we're using the correct MIME type
        if (debouncedFilters.fileType === 'application/xml') {
          params.append('file_type', 'application/xml');
        } else {
          params.append('file_type', debouncedFilters.fileType);
        }
      }
      if (debouncedFilters.minSize) {
        params.append('min_size', (parseInt(debouncedFilters.minSize) * 1024 * 1024).toString());
      }
      if (debouncedFilters.maxSize) {
        params.append('max_size', (parseInt(debouncedFilters.maxSize) * 1024 * 1024).toString());
      }
      if (debouncedFilters.startDate) {
        params.append('start_date', debouncedFilters.startDate);
      }
      if (debouncedFilters.endDate) {
        params.append('end_date', debouncedFilters.endDate);
      }
      console.log('Query params:', params.toString());
      return debouncedSearchQuery ? 
        searchFiles(debouncedSearchQuery, params) : 
        getFiles(params);
    },
    retry: 1,
    staleTime: 0,
    notifyOnChangeProps: ['data', 'error'],
  });

  // Mutation for uploading files
  const uploadMutation = useMutation<FileUploadResponse, ApiError, globalThis.File>({
    mutationFn: uploadFile,
    onSuccess: async (response) => {
      if (response.is_reference) {
        // If it's a reference to an existing file, don't update the list
        return;
      }
      
      // Invalidate and refetch with current filters
      await queryClient.invalidateQueries({
        queryKey: ['files', 'list', debouncedSearchQuery, debouncedFilters],
        refetchType: 'active',
        exact: true
      });
      
      // Invalidate storage stats
      await queryClient.invalidateQueries({ queryKey: ['storageStats'] });
      
      // Force a refetch with current filters
      await refetch();
    },
  });

  // Mutation for deleting files
  const deleteMutation = useMutation<void, ApiError, string, { previousFiles: FileListResponse | undefined }>({
    mutationFn: deleteFile,
    onMutate: async (fileId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['files', 'list'] });
      
      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData<FileListResponse>(['files', 'list']);
      
      // Optimistically update the cache
      if (previousFiles) {
        queryClient.setQueryData<FileListResponse>(['files', 'list'], {
          ...previousFiles,
          files: previousFiles.files.filter(file => file.id !== fileId),
          total: previousFiles.total - 1
        });
      }
      
      return { previousFiles };
    },
    onError: (err, fileId, context) => {
      console.error('Error deleting file:', err);
      // Revert to the previous state on error
      if (context?.previousFiles) {
        queryClient.setQueryData(['files', 'list'], context.previousFiles);
      }
    },
    onSuccess: () => {
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['files', 'list'] });
      
      // Invalidate storage stats
      queryClient.invalidateQueries({ queryKey: ['storageStats'] });
    },
  });

  // Function to handle file deletion with retry
  const handleDelete = async (fileId: string) => {
    try {
      await deleteMutation.mutateAsync(fileId);
    } catch (error: unknown) {
      console.error('Failed to delete file:', error);
      // If the error is a 404, the file might have been deleted already
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ['files', 'list'] });
        // Also invalidate storage stats
        queryClient.invalidateQueries({ queryKey: ['storageStats'] });
      }
    }
  };

  return {
    // List operations
    files: files?.files || [],
    totalFiles: files?.total || 0,
    isLoading,
    error,
    refetch,

    // Search operations
    searchQuery,
    setSearchQuery,

    // Filter operations
    filters,
    setFilters: (newFilters: typeof filters) => {
      setFilters(newFilters);
      // Don't invalidate the query here, let the debounced effect handle it
    },

    // Upload operations
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,

    // Delete operations
    deleteFile: handleDelete,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
};

// Separate hook for getting file details
export const useFileDetails = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery<FileMetadata, ApiError>({
    queryKey: ['files', 'details', id],
    queryFn: () => getFileDetails(id),
    enabled: !!id,
    // Remove the query from cache when it's disabled
    gcTime: 0,
    // Don't retry on 404 errors
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}; 