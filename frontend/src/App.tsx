import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { FileList } from './components/FileList';
import { FileUpload } from './components/FileUpload';
import { FileUploadResponse, ApiError } from './types/file';
import FileVaultImageIcon from './components/icons/FileVaultImageIcon';
import { StorageStatsCard } from './components/StorageStatsCard';

const queryClient = new QueryClient();

// Create a wrapper component to access QueryClient context
const AppContent: React.FC = () => {
  const queryClient = useQueryClient();

  const handleUploadSuccess = (response: FileUploadResponse) => {
    console.log('Upload successful:', response);
    // Invalidate storage stats when a file is uploaded
    queryClient.invalidateQueries({ queryKey: ['storageStats'] });
  };

  const handleUploadError = (error: ApiError) => {
    console.error('Upload failed:', error);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center text-xl font-bold text-gray-900">
                    <FileVaultImageIcon className="w-10 h-10 mr-3" />
                    Abnormal File Vault
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="pt-4 md:pt-8">
                      <FileUpload 
                        onUploadSuccess={handleUploadSuccess}
                      />
                    </div>
                  </div>
                  <div>
                    <StorageStatsCard />
                  </div>
                </div>
                <FileList />
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
