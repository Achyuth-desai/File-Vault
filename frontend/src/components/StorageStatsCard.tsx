import React from 'react';
import { useStorageStats } from '../hooks/useStorageStats';

export const StorageStatsCard: React.FC = () => {
  const { stats, isLoading, error } = useStorageStats();

  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-2 bg-gray-200 rounded mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Statistics</h3>
        <p className="text-sm text-red-500">Failed to load storage statistics</p>
      </div>
    );
  }

  // Calculate percentages for the progress bar
  const usedStoragePercent = stats.percentage_saved;
  const savedStoragePercent = 100 - usedStoragePercent;

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Efficiency</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <span className="block text-3xl font-bold text-indigo-600">{stats.duplicate_files}</span>
          <span className="text-sm text-gray-500">Duplicate Files</span>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-bold text-indigo-600">
            {stats.percentage_saved === 0 ? '0' : 
             stats.percentage_saved > 0 && stats.percentage_saved < 0.1 ? '< 0.1' : 
             stats.percentage_saved.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">Space Saved</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Space Usage</span>
          <span>{stats.formattedActualSize} / {stats.formattedTotalSize}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${savedStoragePercent}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Total Files</p>
          <p className="font-medium">{stats.total_files}</p>
        </div>
        <div>
          <p className="text-gray-500">Unique Files</p>
          <p className="font-medium">{stats.unique_files}</p>
        </div>
        <div>
          <p className="text-gray-500">Space Used</p>
          <p className="font-medium">{stats.formattedActualSize}</p>
        </div>
        <div>
          <p className="text-gray-500">Space Saved</p>
          <p className="font-medium">{stats.formattedSpaceSaved}</p>
        </div>
      </div>
    </div>
  );
}; 