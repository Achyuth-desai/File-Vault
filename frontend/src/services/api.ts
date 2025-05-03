import axios from 'axios';
import { FileMetadata, FileUploadResponse, FileListResponse, FileSearchResponse, StorageStats } from '../types/file';
import { fileService } from './fileService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface ApiError {
  message: string;
  status: number;
  existingFile?: {
    id: string;
    name: string;
    size: number;
    uploaded_at: string;
  };
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
};

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.error || error.message || 'An error occurred',
      status: error.response?.status || 500
    };
  }
  return {
    message: 'An unexpected error occurred',
    status: 500
  };
};

export const uploadFile = async (file: globalThis.File): Promise<FileUploadResponse> => {
  return fileService.uploadFile(file);
};

export const getFiles = async (params?: URLSearchParams): Promise<FileListResponse> => {
  const url = '/files/';
  const response = await fileService.listFiles(url, params);
  return response;
};

export const getFileDetails = async (id: string): Promise<FileMetadata> => {
  return fileService.getFileDetails(id);
};

export const deleteFile = async (id: string): Promise<void> => {
  return fileService.deleteFile(id);
};

export const searchFiles = async (query: string, params?: URLSearchParams): Promise<FileSearchResponse> => {
  const searchParams = new URLSearchParams(params);
  searchParams.append('q', query);
  const url = '/files/search/';
  return fileService.searchFiles(url, searchParams);
};

export const getStorageStats = async (): Promise<StorageStats> => {
  return fileService.getStorageStats();
}; 