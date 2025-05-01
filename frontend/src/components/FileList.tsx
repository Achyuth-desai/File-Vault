import React, { useState, useRef, useEffect } from 'react';
import { useFiles, useFileDetails } from '../hooks/useFiles';
import { formatFileSize, formatDate } from '../utils/format';
import { FileMetadata } from '../types/file';

export const FileList: React.FC = () => {
  const { files, isLoading, error, deleteFile, searchQuery, setSearchQuery, isDeleting } = useFiles();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const { data: selectedFileDetails, isLoading: isDetailsLoading } = useFileDetails(selectedFileId || '');

  // Maintain focus on search input only after user interaction
  useEffect(() => {
    if (searchInputRef.current && !isLoading && hasUserInteracted) {
      searchInputRef.current.focus();
    }
  }, [isLoading, hasUserInteracted]);

  // Clean up selected file when it's deleted from the list
  useEffect(() => {
    if (selectedFileId && !files.some(file => file.id === selectedFileId)) {
      setSelectedFileId(null);
    }
  }, [files, selectedFileId]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      // Clear selected file immediately
      setSelectedFileId(null);
      await deleteFile(id);
    } catch (error) {
      console.error('Failed to delete file:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedFileId(id);
  };

  const handleCloseDetails = () => {
    setSelectedFileId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHasUserInteracted(true);
  };

  const handleDownload = (fileUrl: string, filename: string) => {
    window.open(fileUrl, '_blank');
  };

  if (isLoading && !files.length) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  if (error && !files.length) {
    return <div className="text-center text-red-500 py-4">Error loading files: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Uploaded Files {files.length > 0 ? `(${files.length})` : ''}
            </h3>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={handleSearchChange}
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
            {files.map((file) => (
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
                  <div className="ml-4 flex-shrink-0 space-x-2">
                    <button
                      onClick={() => handleViewDetails(file.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingId === file.id || isDeleting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === file.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {files.length === 0 && !isLoading && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No files uploaded yet
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* File Details Modal */}
      {selectedFileId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">File Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            {isDetailsLoading ? (
              <div className="mt-4 text-center py-4">Loading file details...</div>
            ) : selectedFileDetails ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Filename</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedFileDetails.original_filename}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File Type</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedFileDetails.file_type}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <div className="mt-1 text-sm text-gray-900">{formatFileSize(selectedFileDetails.size)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Uploaded At</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedFileDetails.uploaded_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File Hash</label>
                  <div className="mt-1 text-sm text-gray-900 font-mono">{selectedFileDetails.file_hash}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Download</label>
                  <div className="mt-2">
                    <a
                      href={selectedFileDetails.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center text-red-500 py-4">
                Failed to load file details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 