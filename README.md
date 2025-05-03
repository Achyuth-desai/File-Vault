# Abnormal File Vault

A full-stack file management application built with React and Django, designed for efficient file handling and storage.

## 🚀 Technology Stack

### Backend
- Django 4.x (Python web framework)
- Django REST Framework (API development)
- SQLite (Development database)
- Gunicorn (WSGI HTTP Server)
- WhiteNoise (Static file serving)

### Frontend
- React 18 with TypeScript
- TanStack Query (React Query) for data fetching
- Axios for API communication
- Tailwind CSS for styling
- Heroicons for UI elements

### Infrastructure
- Docker and Docker Compose
- Local file storage with volume mounting

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Docker (20.10.x or higher) and Docker Compose (2.x or higher)
- Node.js (18.x or higher) - for local development
- Python (3.9 or higher) - for local development

## 🛠️ Installation & Setup

### Using Docker (Recommended)

```bash
docker-compose up --build
```

### Local Development Setup

#### Backend Setup
1. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create necessary directories**
   ```bash
   mkdir -p media staticfiles data
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup
1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**
   Create `.env.local`:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🌐 Accessing the Application

- Frontend Application: http://localhost:3000
- Backend API: http://localhost:8000/api

## 📝 API Documentation

### File Management Endpoints

#### List Files
- **GET** `/api/files/`
- Returns a list of all uploaded files
- Response includes file metadata (name, size, type, upload date)

#### Upload File
- **POST** `/api/files/`
- Upload a new file
- Request: Multipart form data with 'file' field
- Returns: File metadata including ID and upload status

#### Get File Details
- **GET** `/api/files/<file_id>/`
- Retrieve details of a specific file
- Returns: Complete file metadata

#### Delete File
- **DELETE** `/api/files/<file_id>/`
- Remove a file from the system
- Returns: 204 No Content on success

#### Download File
- Access file directly through the file URL provided in metadata

#### Storage Statistics
- **GET** `/api/files/storage_stats/`
- Provides statistics about file storage efficiency
- Returns: Storage metrics including total files, unique files, duplicates, total space, actual space used, and space saved

## 🗄️ Project Structure

```
file-hub/
├── backend/                # Django backend
│   ├── files/             # Main application
│   │   ├── documents.py   # Elasticsearch document mappings
│   │   ├── models.py      # Data models (includes StoredFile model for deduplication)
│   │   ├── views.py       # API views (includes search and storage_stats endpoints)
│   │   ├── signals.py     # Signal handlers for Elasticsearch indexing
│   │   ├── urls.py        # URL routing
│   │   └── serializers.py # Data serialization (includes StoredFileSerializer)
│   ├── core/              # Project settings
│   │   └── settings.py    # Includes Elasticsearch configuration
│   ├── start.sh           # Server startup script with Elasticsearch setup
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── FileFilters.tsx       # Advanced file filtering component
│   │   │   ├── FileList.tsx          # Main file listing with search
│   │   │   ├── FileDetails.tsx       # File details modal
│   │   │   ├── FileUpload.tsx        # Drag-and-drop file upload
│   │   │   ├── StorageStatsCard.tsx  # Storage efficiency visualization
│   │   │   └── icons/                # Icon components
│   │   │       ├── FileTypeIcon.tsx  # File type-specific icons
│   │   │       └── FileVaultIcon.tsx # Application branding icons
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useFiles.ts           # Files data and operations hook
│   │   │   └── useStorageStats.ts    # Hook for storage efficiency data
│   │   ├── services/      # API services
│   │   │   ├── api.ts     # API functions including search and storage stats
│   │   │   └── fileService.ts # File operations implementation
│   │   ├── config/        # Frontend configuration
│   │   │   └── fileTypes.ts # File type definitions
│   │   └── types/         # TypeScript types
│   │       └── file.ts    # Includes StorageStats and FileSearch interfaces
│   └── package.json      # Node.js dependencies
└── docker-compose.yml    # Docker composition (includes Elasticsearch service)
```

## 🔧 Development Features

- Hot reloading for both frontend and backend
- React Query DevTools for debugging data fetching
- TypeScript for better development experience
- Tailwind CSS for rapid UI development

## 🐛 Troubleshooting

1. **Port Conflicts**
   ```bash
   # If ports 3000 or 8000 are in use, modify docker-compose.yml or use:
   # Frontend: npm start -- --port 3001
   # Backend: python manage.py runserver 8001
   ```

2. **File Upload Issues**
   - Maximum file size: 10MB
   - Ensure proper permissions on media directory
   - Check network tab for detailed error messages

3. **Database Issues**
   ```bash
   # Reset database
   rm backend/data/db.sqlite3
   python manage.py migrate
   ```

4. **MacOS Docker Issues**
   If you encounter the following error on MacOS when building with docker-compose:
   ```
   E: Problem executing scripts APT::Update::Post-Invoke 'rm -f /var/cache/apt/archives/.deb /var/cache/apt/archives/partial/.deb /var/cache/apt/*.bin || true'
   ```
   
   Try these solutions:
   - Update your Docker Desktop to the latest version
   - Increase Docker resources (Memory/CPU) in Docker Desktop preferences
   - Modify the backend Dockerfile to break up the apt commands:
     ```dockerfile
     RUN apt-get update
     RUN apt-get install -y --no-install-recommends build-essential curl
     RUN rm -rf /var/lib/apt/lists/*
     ```
   - Reset Docker's cache:
     ```bash
     docker system prune -a
     docker volume prune
     ```

# Project Submission Instructions

## Preparing Your Submission

1. Before creating your submission zip file, ensure:
   - All features are implemented and working as expected
   - All tests are passing
   - The application runs successfully locally
   - Remove any unnecessary files or dependencies
   - Clean up any debug/console logs

2. Create the submission zip file:
   ```bash
   # Activate your backend virtual environment first
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Run the submission script from the project root
   cd ..
   python create_submission_zip.py
   ```

   The script will:
   - Create a zip file named `username_YYYYMMDD.zip` (e.g., `johndoe_20240224.zip`)
   - Respect .gitignore rules to exclude unnecessary files
   - Preserve file timestamps
   - Show you a list of included files and total size
   - Warn you if the zip is unusually large

3. Verify your submission zip file:
   - Extract the zip file to a new directory
   - Ensure all necessary files are included
   - Verify that no unnecessary files (like node_modules, __pycache__, etc.) are included
   - Test the application from the extracted files to ensure everything works

## Video Documentation Requirement

**Video Guidance** - Record a screen share demonstrating:
- How you leveraged Gen AI to help build the features
- Your prompting techniques and strategies
- Any challenges you faced and how you overcame them
- Your thought process in using AI effectively

**IMPORTANT**: Please do not provide a demo of the application functionality. Focus only on your Gen AI usage and approach.

## Submission Process

1. Submit your project through this Google Form:
   [Project Submission Form](https://forms.gle/nr6DZAX3nv6r7bru9)

2. The form will require:
   - Your project zip file (named `username_YYYYMMDD.zip`)
   - Your video documentation
   - Any additional notes or comments about your implementation

Make sure to test the zip file and video before submitting to ensure they are complete and working as expected.

# Docker Installation Instructions

## Installing Docker on Ubuntu

1. First, uninstall any old versions and conflicting packages:
```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

2. Set up Docker's apt repository:
```bash
# Update apt and install required packages
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

3. Install Docker Engine and Docker Compose:
```bash
# Update apt package index
sudo apt-get update

# Install Docker Engine, containerd, and Docker Compose
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. Verify the installation:
```bash
# Verify Docker Engine installation
sudo docker run hello-world

# Verify Docker Compose installation
docker compose version
```

5. (Optional but recommended) Add your user to the docker group to run Docker commands without sudo:
```bash
sudo usermod -aG docker $USER
```
Note: You'll need to log out and back in for this change to take effect.

After installation, you can start using Docker with your project. The README indicates that you can start the application using:
```bash
docker-compose up --build
```

This will build and start both the frontend and backend services as defined in your project's `docker-compose.yml` file.

Would you like me to verify any of these steps or provide more details about any part of the installation process?