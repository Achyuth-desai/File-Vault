export interface FileMetadata {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
  file_hash: string;
  file_url: string;
}

export interface FileUploadResponse {
  id: string;
  message: string;
}

export interface FileListResponse {
  files: FileMetadata[];
  total: number;
}

export interface FileSearchResponse {
  files: FileMetadata[];
  total: number;
  query: string;
}

export interface ApiError {
  message: string;
  status: number;
} 