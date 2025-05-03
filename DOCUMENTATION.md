# Abnormal File Vault - Technical Documentation

This document provides detailed information about each component in the Abnormal File Vault project, explaining their purpose, functionality, and interactions.

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [Key Features](#key-features)
6. [Data Flow](#data-flow)

## Project Overview

Abnormal File Vault is a full-stack file management application designed for efficient file handling and storage. The application utilizes file deduplication to optimize storage space by identifying and consolidating duplicate files.

## System Architecture

The application follows a client-server architecture:

- **Backend**: Django REST Framework API providing file management services
- **Frontend**: React with TypeScript providing the user interface
- **Search Engine**: Elasticsearch for powerful file search capabilities
- **Database**: SQLite (development) storing file metadata and references
- **Storage**: Local file system storage with deduplication

## Backend Components

### Models (`backend/files/models.py`)

#### `StoredFile` Model
- **Purpose**: Stores the actual file content and manages deduplication
- **Key Fields**:
  - `id`: UUID primary key
  - `file`: FileField storing the actual file
  - `file_hash`: MD5 hash for identifying duplicates
  - `reference_count`: Number of `File` records that reference this stored file
- **Functions**:
  - `increment_reference_count()`: Increases the reference count when new files reference this stored file

#### `File` Model
- **Purpose**: Stores metadata about user-uploaded files
- **Key Fields**:
  - `id`: UUID primary key
  - `stored_file`: ForeignKey to `StoredFile` model
  - `original_filename`: The name of the file as uploaded by the user
  - `file_type`: MIME type of the file
  - `size`: File size in bytes
  - `uploaded_at`: Timestamp of upload
- **Functions**:
  - Overridden `save()` method to handle reference counting

### Views (`backend/files/views.py`)

#### `FileViewSet`
- **Purpose**: Provides API endpoints for file operations
- **Endpoints**:
  - `GET /files/`: List all files
  - `POST /files/`: Upload a new file
  - `GET /files/<id>/`: Get file details
  - `DELETE /files/<id>/`: Delete a file
  - `GET /files/search/`: Search for files
  - `GET /files/storage_stats/`: Get storage efficiency statistics
- **Features**:
  - Handles file upload with deduplication logic
  - Implements file filtering by type, size, date
  - Provides storage statistics for deduplication efficiency

### Serializers (`backend/files/serializers.py`)

#### `StoredFileSerializer`
- **Purpose**: Serializes `StoredFile` model data for API responses
- **Fields**: `id`, `file_hash`, `reference_count`, `created_at`

#### `FileSerializer`
- **Purpose**: Serializes `File` model data for API responses
- **Fields**: `id`, `stored_file`, `original_filename`, `file_type`, `size`, `uploaded_at`, `file_url`
- **Features**:
  - Custom `get_file_url` method to generate download URLs
  - Includes `stored_file` details in responses

### Elasticsearch Integration

#### `FileDocument` (`backend/files/documents.py`)
- **Purpose**: Defines mapping for indexing file metadata in Elasticsearch
- **Indexed Fields**: `original_filename`, `file_type`, `size`, `file_hash`, `uploaded_at`
- **Features**:
  - Case-insensitive text search
  - Text analysis for improved search relevance

#### Signal Handlers (`backend/files/signals.py`)
- **Purpose**: Sync database models with Elasticsearch
- **Functions**:
  - `update_document`: Updates Elasticsearch when a file is saved
  - `delete_document`: Removes from Elasticsearch when a file is deleted

## Frontend Components

### React Components

#### `FileList` (`frontend/src/components/FileList.tsx`)
- **Purpose**: Displays the list of uploaded files
- **Features**:
  - Search functionality with debounce
  - File filtering interface
  - File deletion
  - View file details

#### `FileFilters` (`frontend/src/components/FileFilters.tsx`)
- **Purpose**: Provides UI for filtering files
- **Filters**:
  - File type (PDF, images, documents, etc.)
  - File size ranges
  - Date ranges (start/end date)
- **Features**:
  - Predefined size ranges
  - Clear filters function

#### `FileUpload` (`frontend/src/components/FileUpload.tsx`)
- **Purpose**: Handles file upload UI and logic
- **Features**:
  - Drag-and-drop interface
  - Upload progress feedback
  - Error handling for duplicates
  - Success/failure messages

#### `FileDetails` (`frontend/src/components/FileDetails.tsx`)
- **Purpose**: Modal to display detailed file information
- **Features**:
  - Shows complete file metadata
  - Provides download option
  - Shows file hash for reference

#### `StorageStatsCard` (`frontend/src/components/StorageStatsCard.tsx`)
- **Purpose**: Visualizes storage efficiency from deduplication
- **Features**:
  - Shows duplicate file count
  - Displays percentage of space saved
  - Visualizes storage usage with progress bar
  - Shows formatted space metrics

#### Icon Components (`frontend/src/components/icons/`)
- **FileTypeIcon**: Displays different icons based on file type
- **FileVaultIcon**: Application branding icon/logo

### Hooks and Services

#### `useFiles` (`frontend/src/hooks/useFiles.ts`)
- **Purpose**: Custom hook managing file data and operations
- **Features**:
  - File listing with search and filters
  - File upload functionality
  - File deletion with optimistic updates
  - Error handling

#### `useStorageStats` (`frontend/src/hooks/useStorageStats.ts`)
- **Purpose**: Custom hook for storage statistics
- **Features**:
  - Fetches storage efficiency data
  - Formats byte values to human-readable format
  - Caching with React Query

#### API Services (`frontend/src/services/`)
- **`api.ts`**: Defines API endpoints and functions
- **`fileService.ts`**: Implements file operations (upload, list, search, delete)
- **Features**:
  - Axios for HTTP requests
  - Error handling
  - Response type definitions

## Key Features

### File Deduplication

**How it works:**
1. When a file is uploaded, its MD5 hash is calculated
2. The system checks if a file with the same hash already exists
3. If a duplicate is found:
   - A new `File` record is created with metadata
   - The record references the existing `StoredFile`
   - The `reference_count` is incremented
4. If no duplicate is found:
   - A new `StoredFile` record is created with the file content
   - A new `File` record is created with metadata
   - The `File` references the new `StoredFile`

**Benefits:**
- Reduced storage space requirements
- Faster upload times for duplicate files
- Preserved file metadata for each upload

### Elasticsearch Search

**How it works:**
1. File metadata is indexed in Elasticsearch when files are uploaded
2. Search queries are sent to the `/files/search/` endpoint
3. The backend formulates an Elasticsearch query with:
   - Prefix matching
   - Phrase matching with slop
   - Wildcard matching
   - Fuzzy matching
4. Results are returned ordered by relevance

**Features:**
- Fast text search across file names
- Filtering by file type, size, and date
- Fuzzy matching for typo tolerance
- Result caching for improved performance

### Storage Statistics

**How it works:**
1. The `/files/storage_stats/` endpoint calculates:
   - Total number of files
   - Number of unique files (distinct `StoredFile` records)
   - Number of duplicate references
   - Total size if all files were stored individually
   - Actual storage used with deduplication
   - Space and percentage saved
2. The frontend visualizes this data in the `StorageStatsCard` component

## Data Flow

### File Upload Flow
1. User selects or drops a file in the UI
2. Frontend sends the file to the API using multipart/form-data
3. Backend calculates the file's MD5 hash
4. Backend checks for existing files with the same hash
5. Backend creates necessary database records with deduplication
6. Backend indexes the file metadata in Elasticsearch
7. Frontend updates the file list and storage statistics

### File Search Flow
1. User enters search text or applies filters
2. Frontend debounces the input to prevent excessive API calls
3. Frontend sends search request to the API
4. Backend constructs and executes Elasticsearch query
5. Results are returned to the frontend
6. Frontend displays matching files

### File Deletion Flow
1. User clicks the delete button for a file
2. Frontend sends a DELETE request to the API
3. Backend deletes the `File` record
4. Backend decrements the `reference_count` on the associated `StoredFile`
5. If `reference_count` reaches 0, the `StoredFile` and physical file are deleted
6. Frontend updates the file list and storage statistics optimistically
7. Backend removes the file from Elasticsearch index 