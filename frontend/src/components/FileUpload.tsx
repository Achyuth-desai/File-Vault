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
      setMessage({ 
        type: 'success', 
        text: response.is_reference && response.original_file?.name
          ? `File reference created successfully (original: ${response.original_file.name})`
          : 'File uploaded successfully' 
      });
      onUploadSuccess(response);
    } catch (error: unknown) {
      if (isApiError(error)) {
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
      'application/xml': ['.xml', '.xsd', '.xsl', '.xslt', '.dtd'],
      'text/html': ['.html'],
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
      'application/toml': ['.toml'],
      'application/octet-stream': ['.dat', '.bin', '.exe', '.dll', '.so', '.dylib', '.class', '.jar', '.war', '.ear', '.apk', '.ipa', '.deb', '.rpm', '.iso', '.img', '.dmg', '.vhd', '.vhdx', '.ova', '.ovf', '.vmdk', '.qcow2', '.raw', '.vdi']
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-green-200 shadow-lg rounded-lg p-8 text-center cursor-pointer transition-colors bg-white
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-green-200 hover:bg-gray-50'}`}
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
        <div className={`mt-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}; 