import React from 'react';
import { format } from 'date-fns';

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
            <option value="application/pdf">PDF</option>
            <option value="image/png">PNG Image</option>
            <option value="image/jpeg">JPEG Image</option>
            <option value="image/gif">GIF Image</option>
            <option value="text/plain">Text File</option>
            <option value="text/x-python">Python</option>
            <option value="application/json">JSON</option>
            <option value="text/csv">CSV</option>
            <option value="text/markdown">Markdown</option>
            <option value="application/parquet">Parquet</option>
            <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel (.xlsx)</option>
            <option value="application/vnd.ms-excel">Excel (.xls)</option>
            <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (.docx)</option>
            <option value="application/msword">Word (.doc)</option>
            <option value="application/vnd.ms-powerpoint">PowerPoint (.ppt)</option>
            <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">PowerPoint (.pptx)</option>
            <option value="application/zip">ZIP Archive</option>
            <option value="application/x-rar-compressed">RAR Archive</option>
            <option value="application/x-7z-compressed">7-Zip Archive</option>
            <option value="application/x-tar">TAR Archive</option>
            <option value="application/gzip">GZIP Archive</option>
            <option value="application/xml">XML</option>
            <option value="text/html">HTML</option>
            <option value="text/css">CSS</option>
            <option value="application/javascript">JavaScript</option>
            <option value="application/typescript">TypeScript</option>
            <option value="text/x-java-source">Java</option>
            <option value="text/x-c">C</option>
            <option value="text/x-c++">C++</option>
            <option value="text/x-c-header">C Header</option>
            <option value="text/x-c++-header">C++ Header</option>
            <option value="text/x-go">Go</option>
            <option value="text/x-rust">Rust</option>
            <option value="text/x-ruby">Ruby</option>
            <option value="text/x-php">PHP</option>
            <option value="text/x-shellscript">Shell Script</option>
            <option value="application/x-msdos-program">Batch File</option>
            <option value="application/x-powershell">PowerShell</option>
            <option value="application/sql">SQL</option>
            <option value="application/x-yaml">YAML</option>
            <option value="application/toml">TOML</option>
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