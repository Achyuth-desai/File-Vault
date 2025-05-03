import { useQuery } from '@tanstack/react-query';
import { getStorageStats } from '../services/api';
import { StorageStats } from '../types/file';

// Helper function to format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function useStorageStats() {
  const { data, error, isLoading, refetch } = useQuery<StorageStats>({
    queryKey: ['storageStats'],
    queryFn: getStorageStats,
    staleTime: 1000 * 60, // 1 minute instead of 5
    refetchOnWindowFocus: true, // Refetch when the window regains focus
    refetchOnMount: true, // Refetch when the component mounts
  });

  // Format the stats for display
  const formattedStats = data
    ? {
        ...data,
        formattedTotalSize: formatBytes(data.total_size),
        formattedActualSize: formatBytes(data.actual_size),
        formattedSpaceSaved: formatBytes(data.space_saved),
      }
    : undefined;

  return {
    stats: formattedStats,
    error,
    isLoading,
    refetch,
  };
} 