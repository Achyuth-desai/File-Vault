import React from 'react';

const FileVaultIcon: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg
    className={className}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#444" />
        <stop offset="100%" stopColor="#222" />
      </linearGradient>
      <linearGradient id="top" x1="0" y1="0" x2="0.7" y2="0.7">
        <stop offset="0%" stopColor="#666" />
        <stop offset="100%" stopColor="#333" />
      </linearGradient>
      <linearGradient id="side" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#333" />
        <stop offset="100%" stopColor="#111" />
      </linearGradient>
      <radialGradient id="metal" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="#aaa" />
      </radialGradient>
      <radialGradient id="handle" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#eee" />
        <stop offset="100%" stopColor="#888" />
      </radialGradient>
    </defs>
    {/* 3D Cube Body */}
    <polygon points="12,22 56,10 72,24 72,66 28,78 12,64" fill="url(#body)" stroke="#222" strokeWidth="2" />
    {/* Top Face */}
    <polygon points="12,22 56,10 72,24 28,36" fill="url(#top)" stroke="#222" strokeWidth="1" />
    {/* Side Face */}
    <polygon points="72,24 72,66 28,78 28,36" fill="url(#side)" stroke="#222" strokeWidth="1" />
    {/* Door (front) */}
    <rect x="18" y="28" width="36" height="36" rx="3" fill="#232323" stroke="#444" strokeWidth="3" />
    {/* Door Border */}
    <rect x="22" y="32" width="28" height="28" rx="2" fill="none" stroke="#666" strokeWidth="2" />
    {/* Vault Handle (spokes) */}
    {[0, 1, 2, 3, 4, 5].map(i => (
      <rect
        key={i}
        x={36.5}
        y={46}
        width={3}
        height={16}
        rx={1.2}
        fill="url(#handle)"
        stroke="#bbb"
        strokeWidth="0.7"
        transform={`rotate(${i * 60} 38 54)`}
      />
    ))}
    {/* Vault Handle (center circle) */}
    <circle cx="38" cy="54" r="7" fill="url(#handle)" stroke="#bbb" strokeWidth="2" />
    <circle cx="38" cy="54" r="3" fill="#fff" fillOpacity="0.7" />
    {/* Knob above handle */}
    <circle cx="38" cy="40" r="3.5" fill="url(#metal)" stroke="#bbb" strokeWidth="1.2" />
    <circle cx="38" cy="40" r="1.5" fill="#fff" fillOpacity="0.8" />
    {/* Door shadow for 3D effect */}
    <ellipse cx="38" cy="66" rx="13" ry="3.5" fill="#000" fillOpacity="0.18" />
  </svg>
);

export default FileVaultIcon; 