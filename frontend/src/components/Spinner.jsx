import React from 'react';

export default function Spinner({ size = 'md', className = '', label = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[2.5px]',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`rounded-full border-brand-teal/20 border-t-brand-teal animate-spin ${
          sizeMap[size] || sizeMap.md
        }`}
        role="status"
        aria-label="Loading"
      />
      {label && <span className="text-sm font-medium text-brand-dark">{label}</span>}
    </div>
  );
}
