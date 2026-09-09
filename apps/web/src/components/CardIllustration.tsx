import React from 'react';

export const CardIllustration = ({ className = '' }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
    >
      {/* Background Circle Removed for transparency */}

      {/* Progress Ring Background */}
      <circle 
        cx="250" cy="250" r="140" 
        stroke="#f6c4c4" strokeWidth="20" 
      />

      {/* Progress Ring Active (Red) */}
      <circle 
        cx="250" cy="250" r="140" 
        stroke="#da4040" strokeWidth="20" 
        strokeLinecap="round"
        strokeDasharray="879.6" 
        strokeDashoffset="250" 
        transform="rotate(-90 250 250)"
      />

      {/* Floating Stars */}
      <path d="M 350 70 Q 350 90 370 90 Q 350 90 350 110 Q 350 90 330 90 Q 350 90 350 70 Z" fill="#e28585" />
      <path d="M 130 420 Q 130 430 140 430 Q 130 430 130 440 Q 130 430 120 430 Q 130 430 130 420 Z" fill="#e28585" />

      {/* Credit Card Group */}
      <g transform="translate(250, 250) rotate(-10) translate(-250, -250)">
        {/* Card Body */}
        <rect x="130" y="160" width="240" height="150" rx="16" fill="#a82d2d" />
        
        {/* Darker Top Area for depth (optional, image has a slightly darker top edge) */}
        <path d="M 130 176 C 130 167.163 137.163 160 146 160 L 354 160 C 362.837 160 370 167.163 370 176 L 370 190 L 130 190 Z" fill="#8f2424" />

        {/* Card Logo Circles */}
        <circle cx="165" cy="235" r="18" fill="#ffffff" fillOpacity="0.4" />
        <circle cx="190" cy="235" r="18" fill="#e28585" fillOpacity="0.5" />

        {/* Card Lines */}
        <rect x="150" y="270" width="100" height="8" rx="4" fill="#e28585" />
        <rect x="150" y="290" width="70" height="8" rx="4" fill="#e28585" />
      </g>

      {/* Floating Coins/Badges */}
      {/* Top Left - Medium */}
      <g transform="translate(130, 160)">
        <circle cx="0" cy="0" r="22" fill="#e28585" />
        <text x="0" y="6" fontFamily="sans-serif" fontWeight="bold" fontSize="18" fill="#4a1515" textAnchor="middle"> $ </text>
      </g>
      
      {/* Top Right - Small (background depth) */}
      <g transform="translate(380, 140)">
        <circle cx="0" cy="0" r="14" fill="#e28585" />
        <text x="0" y="4" fontFamily="sans-serif" fontWeight="bold" fontSize="12" fill="#4a1515" textAnchor="middle"> $ </text>
      </g>

      {/* Bottom Left - Medium small */}
      <g transform="translate(140, 360)">
        <circle cx="0" cy="0" r="18" fill="#da4040" />
        <text x="0" y="5" fontFamily="sans-serif" fontWeight="bold" fontSize="14" fill="#4a1515" textAnchor="middle"> $ </text>
      </g>

      {/* Bottom Right - Large (foreground depth) */}
      <g transform="translate(380, 360)">
        <circle cx="0" cy="0" r="34" fill="#da4040" />
        <text x="0" y="8" fontFamily="sans-serif" fontWeight="bold" fontSize="24" fill="#4a1515" textAnchor="middle"> $ </text>
      </g>

    </svg>
  );
};
