import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile, isApiError } from '../services/api';
import { useFiles } from '../hooks/useFiles';
import { FileUploadResponse } from '../types/file';

interface FileUploadProps {
  onUploadSuccess: (response: FileUploadResponse) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const { refetch } = useFiles();

  const onDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      // Refresh the file list after successful upload
      await refetch();
      setMessage({ type: 'success', text: 'File uploaded successfully' });
      onUploadSuccess(response);
    } catch (error: unknown) {
      if (isApiError(error) && error.status === 409) {
        const existingFile = error.existingFile;
        const message = existingFile?.name === file.name
          ? `A file with the name "${file.name}" already exists (uploaded on ${new Date(existingFile.uploaded_at || '').toLocaleString()})`
          : `This file has the same content as "${existingFile?.name}" (uploaded on ${new Date(existingFile?.uploaded_at || '').toLocaleString()})`;
        setMessage({ 
          type: 'error', 
          text: message
        });
      } else if (isApiError(error)) {
        setMessage({ type: 'error', text: error.message || 'Failed to upload file' });
      } else {
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
      }
    } finally {
      setIsUploading(false);
    }
  }, [refetch, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p className="text-gray-600">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop the file here...</p>
        ) : (
          <p className="text-gray-600">
            Drag and drop a file here, or click to select a file
          </p>
        )}
      </div>
      {message.text && (
        <div className={`mt-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}; 