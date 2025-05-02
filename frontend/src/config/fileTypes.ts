export interface FileType {
  mimeType: string;
  label: string;
  extensions: string[];
}

export const KNOWN_FILE_TYPES: FileType[] = [
  { mimeType: 'application/pdf', label: 'PDF', extensions: ['.pdf'] },
  { mimeType: 'image/png', label: 'PNG Image', extensions: ['.png'] },
  { mimeType: 'image/jpeg', label: 'JPEG Image', extensions: ['.jpg', '.jpeg'] },
  { mimeType: 'image/gif', label: 'GIF Image', extensions: ['.gif'] },
  { mimeType: 'text/plain', label: 'Text File', extensions: ['.txt'] },
  { mimeType: 'text/x-python', label: 'Python', extensions: ['.py'] },
  { mimeType: 'application/json', label: 'JSON', extensions: ['.json'] },
  { mimeType: 'text/csv', label: 'CSV', extensions: ['.csv'] },
  { mimeType: 'text/markdown', label: 'Markdown', extensions: ['.md'] },
  { mimeType: 'application/parquet', label: 'Parquet', extensions: ['.parquet'] },
  { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel (.xlsx)', extensions: ['.xlsx'] },
  { mimeType: 'application/vnd.ms-excel', label: 'Excel (.xls)', extensions: ['.xls'] },
  { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word (.docx)', extensions: ['.docx'] },
  { mimeType: 'application/msword', label: 'Word (.doc)', extensions: ['.doc'] },
  { mimeType: 'application/vnd.ms-powerpoint', label: 'PowerPoint (.ppt)', extensions: ['.ppt'] },
  { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PowerPoint (.pptx)', extensions: ['.pptx'] },
  { mimeType: 'application/zip', label: 'ZIP Archive', extensions: ['.zip'] },
  { mimeType: 'application/x-rar-compressed', label: 'RAR Archive', extensions: ['.rar'] },
  { mimeType: 'application/x-7z-compressed', label: '7-Zip Archive', extensions: ['.7z'] },
  { mimeType: 'application/x-tar', label: 'TAR Archive', extensions: ['.tar'] },
  { mimeType: 'application/gzip', label: 'GZIP Archive', extensions: ['.gz'] },
  { mimeType: 'text/html', label: 'HTML', extensions: ['.html', '.htm'] },
  { mimeType: 'text/css', label: 'CSS', extensions: ['.css'] },
  { mimeType: 'application/javascript', label: 'JavaScript', extensions: ['.js'] },
  { mimeType: 'application/typescript', label: 'TypeScript', extensions: ['.ts'] },
  { mimeType: 'text/x-java-source', label: 'Java', extensions: ['.java'] },
  { mimeType: 'text/x-c', label: 'C', extensions: ['.c'] },
  { mimeType: 'text/x-c++', label: 'C++', extensions: ['.cpp'] },
  { mimeType: 'text/x-c-header', label: 'C Header', extensions: ['.h'] },
  { mimeType: 'text/x-c++-header', label: 'C++ Header', extensions: ['.hpp'] },
  { mimeType: 'text/x-go', label: 'Go', extensions: ['.go'] },
  { mimeType: 'text/x-rust', label: 'Rust', extensions: ['.rs'] },
  { mimeType: 'text/x-ruby', label: 'Ruby', extensions: ['.rb'] },
  { mimeType: 'text/x-php', label: 'PHP', extensions: ['.php'] },
  { mimeType: 'text/x-shellscript', label: 'Shell Script', extensions: ['.sh'] },
  { mimeType: 'application/x-msdos-program', label: 'Batch File', extensions: ['.bat'] },
  { mimeType: 'application/x-powershell', label: 'PowerShell', extensions: ['.ps1'] },
  { mimeType: 'application/sql', label: 'SQL', extensions: ['.sql'] },
  { mimeType: 'application/x-yaml', label: 'YAML', extensions: ['.yaml', '.yml'] },
  { mimeType: 'application/toml', label: 'TOML', extensions: ['.toml'] }
];

export const getFileTypeByMimeType = (mimeType: string): FileType | undefined => {
  return KNOWN_FILE_TYPES.find(type => type.mimeType === mimeType);
};

export const getFileTypeByExtension = (extension: string): FileType | undefined => {
  return KNOWN_FILE_TYPES.find(type => 
    type.extensions.some(ext => ext.toLowerCase() === extension.toLowerCase())
  );
};

export const isKnownFileType = (mimeType: string): boolean => {
  return KNOWN_FILE_TYPES.some(type => type.mimeType === mimeType);
}; 