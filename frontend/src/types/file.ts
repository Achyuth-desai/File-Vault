export interface FileMetadata {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
  file_hash: string;
  file_url: string;
  reference_file?: string;
  is_reference: boolean;
  original_file_url?: string;
}

export interface FileUploadResponse {
  id?: string;
  message?: string;
  error?: string;
  is_reference?: boolean;
  original_file?: {
    id: string;
    name: string;
    size: number;
    uploaded_at: string;
  };
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
  existingFile?: {
    id: string;
    name: string;
    size: number;
    uploaded_at: string;
  };
}

export interface StorageStats {
  total_files: number;
  unique_files: number;
  duplicate_files: number;
  total_size: number;
  actual_size: number;
  space_saved: number;
  percentage_saved: number;
} 