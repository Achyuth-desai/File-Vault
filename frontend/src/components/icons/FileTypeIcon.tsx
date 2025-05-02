import React from 'react';

interface FileTypeIconProps {
  mimeType: string;
  className?: string;
}

const icons: Record<string, React.ReactElement> = {
  image: (
    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
      <circle cx="8" cy="9" r="2" />
      <path d="M21 19l-5-5a2 2 0 0 0-2.8 0l-5.2 5" strokeWidth="2" />
    </svg>
  ),
  pdf: (
    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
      <text x="8" y="16" fontSize="8" fill="currentColor">PDF</text>
    </svg>
  ),
  text: (
    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
      <line x1="8" y1="8" x2="16" y2="8" strokeWidth="2" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" />
      <line x1="8" y1="16" x2="12" y2="16" strokeWidth="2" />
    </svg>
  ),
  spreadsheet: (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
      <line x1="8" y1="8" x2="8" y2="16" strokeWidth="2" />
      <line x1="16" y1="8" x2="16" y2="16" strokeWidth="2" />
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
    </svg>
  ),
  code: (
    <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
      <polyline points="9 9 7 12 9 15" strokeWidth="2" />
      <polyline points="15 9 17 12 15 15" strokeWidth="2" />
    </svg>
  ),
  archive: (
    <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="7" width="16" height="13" rx="2" strokeWidth="2" />
      <rect x="4" y="4" width="16" height="4" rx="1" strokeWidth="2" />
      <line x1="12" y1="11" x2="12" y2="17" strokeWidth="2" />
    </svg>
  ),
  default: (
    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
      <line x1="8" y1="8" x2="16" y2="8" strokeWidth="2" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" />
      <line x1="8" y1="16" x2="12" y2="16" strokeWidth="2" />
    </svg>
  ),
};

function getIconKey(mimeType: string): keyof typeof icons {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('python') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('java') || mimeType.includes('c++') || mimeType.includes('c-header') || mimeType.includes('go') || mimeType.includes('rust') || mimeType.includes('ruby') || mimeType.includes('php') || mimeType.includes('shellscript')) return 'code';
  return 'default';
}

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ mimeType, className }) => {
  const iconKey = getIconKey(mimeType);
  return <span className={className}>{icons[iconKey]}</span>;
};

export default FileTypeIcon; 