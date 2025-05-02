import React from 'react';
import { format } from 'date-fns';
import { KNOWN_FILE_TYPES } from '../config/fileTypes';

interface FileFiltersProps {
  filters: {
    fileType: string;
    minSize: string;
    maxSize: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (filters: FileFiltersProps['filters']) => void;
}

// Common file size ranges in MB
const SIZE_RANGES = [
  { label: '0-1MB', min: 0, max: 1 },
  { label: '1-5MB', min: 1, max: 5 },
  { label: '5-10MB', min: 5, max: 10 },
  { label: '10-50MB', min: 10, max: 50 },
  { label: '50-100MB', min: 50, max: 100 },
  { label: '100MB+', min: 100, max: 1000 }
];

export const FileFilters: React.FC<FileFiltersProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
    // Remove focus after change
    e.target.blur();
  };

  const handleSizeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      // Clear size filters when "All sizes" is selected
      onFilterChange({
        ...filters,
        minSize: '',
        maxSize: ''
      });
    } else {
      const selectedRange = SIZE_RANGES.find(range => range.label === selectedValue);
      if (selectedRange) {
        onFilterChange({
          ...filters,
          minSize: selectedRange.min.toString(),
          maxSize: selectedRange.max.toString()
        });
      }
    }
    // Remove focus after change
    e.target.blur();
  };

  const clearFilters = () => {
    onFilterChange({
      fileType: '',
      minSize: '',
      maxSize: '',
      startDate: '',
      endDate: '',
    });
    // Remove focus from any focused element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const getCurrentSizeRange = () => {
    if (!filters.minSize && !filters.maxSize) return '';
    const range = SIZE_RANGES.find(
      range => 
        parseInt(filters.minSize) === range.min && 
        parseInt(filters.maxSize) === range.max
    );
    return range ? range.label : '';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-200">
      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-2">
            File Type
          </label>
          <select
            id="fileType"
            name="fileType"
            value={filters.fileType}
            onChange={handleInputChange}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            {KNOWN_FILE_TYPES.map(type => (
              <option key={type.mimeType} value={type.mimeType}>
                {type.label}
              </option>
            ))}
            <option value="other">Other Types</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="sizeRange" className="block text-sm font-medium text-gray-700 mb-2">
            File Size
          </label>
          <select
            id="sizeRange"
            name="sizeRange"
            value={getCurrentSizeRange()}
            onChange={handleSizeRangeChange}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Sizes</option>
            {SIZE_RANGES.map(range => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={clearFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}; 