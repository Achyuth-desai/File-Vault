import React from 'react';
import { useFiles } from '../hooks/useFiles';
import { FileFilters } from './FileFilters';
import { format } from 'date-fns';
import { FileMetadata } from '../types/file';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
};

export const FileList: React.FC = () => {
  const {
    files,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    uploadFile,
    isUploading,
    uploadError,
    deleteFile,
    isDeleting,
    deleteError,
  } = useFiles();

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div className="space-y-4">
      <FileFilters filters={filters} onFilterChange={setFilters} />
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Uploaded Files {files.length > 0 ? `(${files.length})` : ''}
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 px-4 py-2 text-gray-700 placeholder-gray-400 bg-white transition-colors duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {isLoading ? (
              <li className="px-4 py-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </li>
            ) : error ? (
              <li className="px-4 py-4">
                <div className="text-red-600">Error: {error.message}</div>
              </li>
            ) : files.length === 0 ? (
              <li className="px-4 py-4 text-center text-gray-500">
                No files uploaded yet
              </li>
            ) : (
              files.map((file) => (
                <li key={file.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-gray-400">
                          {file.file_type.startsWith('image/') ? '🖼️' : 
                           file.file_type === 'application/pdf' ? '📄' : '📝'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{file.original_filename}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.uploaded_at)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}; 