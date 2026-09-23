import React from 'react';

export default function DrishtiLogo({ size = 'md', showTagline = false, className = '' }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Custom Handcrafted Retinal Eye Aperture Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-tealDark text-white shadow-md shadow-brand-teal/20 p-1.5 ${iconSizes[size] || iconSizes.md}`}>
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Eye outer contour */}
          <path
            d="M3 18C7.5 10 13 6.5 18 6.5C23 6.5 28.5 10 33 18C28.5 26 23 29.5 18 29.5C13 29.5 7.5 26 3 18Z"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Retinal Fundus Disc */}
          <circle cx="18" cy="18" r="6.2" fill="#F7FAF9" stroke="#FF7A59" strokeWidth="2.2" />
          {/* Fovea Centralis */}
          <circle cx="18" cy="18" r="2.8" fill="#FF7A59" />
          {/* Microvascular Branches */}
          <path d="M14 16.5C12.5 15.5 10.5 16 9.5 14.5" stroke="#0E9488" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M22 16.5C23.5 15.5 25.5 16 26.5 14.5" stroke="#0E9488" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M18 12C18.5 10.5 19.5 9.5 20.5 8.5" stroke="#0E9488" strokeWidth="1" strokeLinecap="round" />
          {/* Optical glint reflection */}
          <circle cx="19.5" cy="16.5" r="0.9" fill="white" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-tight text-brand-dark ${textSizes[size] || textSizes.md}`}>
            Drishti<span className="text-brand-teal">AI</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-tealLight text-brand-teal">
            Rural Health
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-brand-muted font-medium tracking-wide">
            Preventing Blindness in Rural India
          </span>
        )}
      </div>
    </div>
  );
}
