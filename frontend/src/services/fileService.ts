import axios from 'axios';
import { FileMetadata, FileUploadResponse, FileListResponse, FileSearchResponse, ApiError, StorageStats } from '../types/file';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fileService = {
  listFiles: async (url: string = '/files/', params?: URLSearchParams): Promise<FileListResponse> => {
    try {
      console.log('List files params:', params?.toString());
      // Convert URLSearchParams to object for axios
      const paramsObj = params ? Object.fromEntries(params.entries()) : undefined;
      console.log('Params object:', paramsObj);
      const response = await api.get(url, { params: paramsObj });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  uploadFile: async (file: globalThis.File): Promise<FileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/files/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFileDetails: async (id: string): Promise<FileMetadata> => {
    try {
      const response = await api.get(`/files/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteFile: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/files/${id}/`);
      // Handle 204 No Content response
      if (response.status === 204) {
        return;
      }
      // For any other successful response
      return response.data;
    } catch (error) {
      // If it's a 404, the file might have been deleted already
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return;
      }
      throw handleApiError(error);
    }
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },

  searchFiles: async (url: string, params?: URLSearchParams): Promise<FileSearchResponse> => {
    try {
      console.log('Search files params:', params?.toString());
      const paramsObj = params ? Object.fromEntries(params.entries()) : undefined;
      console.log('Search params object:', paramsObj);
      const response = await api.get(url, { params: paramsObj });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getStorageStats: async (): Promise<StorageStats> => {
    try {
      const response = await api.get('/files/storage_stats/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.error || error.message || 'An error occurred',
      status: error.response?.status || 500,
      existingFile: error.response?.data?.existing_file
    };
  }
  return {
    message: 'An unexpected error occurred',
    status: 500
  };
}; 