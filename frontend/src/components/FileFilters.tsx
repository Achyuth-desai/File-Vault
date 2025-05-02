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
    <div className="bg-white/80 shadow-lg rounded-2xl p-8 space-y-6 border border-gray-200 backdrop-blur-sm">
      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="fileType" className="block text-sm font-semibold text-gray-700 mb-2">
            File Type
          </label>
          <div className="relative">
            <select
              id="fileType"
              name="fileType"
              value={filters.fileType}
              onChange={handleInputChange}
              className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-4 pr-10 shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm cursor-pointer transition-all appearance-none"
            >
              <option value="">All Types</option>
              {KNOWN_FILE_TYPES.map(type => (
                <option key={type.mimeType} value={type.mimeType}>
                  {type.label}
                </option>
              ))}
              <option value="other">Other Types</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="sizeRange" className="block text-sm font-semibold text-gray-700 mb-2">
            File Size
          </label>
          <div className="relative">
            <select
              id="sizeRange"
              name="sizeRange"
              value={getCurrentSizeRange()}
              onChange={handleSizeRangeChange}
              className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-4 pr-10 shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm cursor-pointer transition-all appearance-none"
            >
              <option value="">All Sizes</option>
              {SIZE_RANGES.map(range => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
            className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-4 shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm cursor-pointer transition-all"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-4 shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm cursor-pointer transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={clearFilters}
          className="inline-flex items-center px-5 py-2 border border-blue-500 shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 cursor-pointer transition-all"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          Clear Filters
        </button>
      </div>
    </div>
  );
}; 