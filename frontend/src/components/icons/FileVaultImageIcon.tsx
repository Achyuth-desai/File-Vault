import React from 'react';

const FileVaultImageIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <img
    src={process.env.PUBLIC_URL + '/file-vault.png'}
    alt="File Vault Icon"
    className={className + ' object-contain'}
    style={{ display: 'block' }}
    draggable={false}
  />
);

export default FileVaultImageIcon; 