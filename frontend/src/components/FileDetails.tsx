import React from 'react';
import { FileMetadata } from '../types/file';
import { format } from 'date-fns';
import { fileService } from '../services/fileService';

interface FileDetailsProps {
  file: FileMetadata;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileDetails: React.FC<FileDetailsProps> = ({ file, onClose }) => {
  const handleDownload = async () => {
    try {
      await fileService.downloadFile(file.file_url, file.original_filename);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              File Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Filename</dt>
              <dd className="mt-1 text-sm text-gray-900">{file.original_filename}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">File Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{file.file_type}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Size</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatFileSize(file.size)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Uploaded At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(file.uploaded_at), 'PPpp')}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">File Hash</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{file.file_hash}</dd>
            </div>
            {file.is_reference && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Reference Information</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  This is a reference to the original file. 
                  {file.original_file_url && (
                    <a
                      href={file.original_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      View original
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Download
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 