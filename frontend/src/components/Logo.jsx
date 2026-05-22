import React from 'react';

// Outline car silhouette logo (Audi-style sedan), pure white line art
export default function Logo({ size = 56, withText = true, textColor = 'text-white' }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 120 70"
        style={{ width: size * 1.45, height: size * 0.85 }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${textColor} shrink-0`}
        aria-hidden="true"
      >
        {/* Car body silhouette */}
        <path d="M6 50 L14 50 C14 56, 22 56, 22 50 L78 50 C78 56, 86 56, 86 50 L114 50 L114 44 C114 41, 112 39, 109 38 L98 36 L86 22 C82 17, 76 14, 70 14 L44 14 C39 14, 34 16, 30 19 L18 33 L10 36 C8 36, 6 38, 6 41 Z" />
        {/* Roof line */}
        <path d="M30 33 L42 19 L70 19 C73 19, 76 21, 78 23 L92 36" />
        {/* Window split */}
        <path d="M54 20 L54 33" opacity="0.7" />
        {/* Front wheel */}
        <circle cx="18" cy="50" r="6" />
        <circle cx="18" cy="50" r="2.2" />
        {/* Rear wheel */}
        <circle cx="82" cy="50" r="6" />
        <circle cx="82" cy="50" r="2.2" />
        {/* Headlight detail */}
        <path d="M102 38 L110 41" opacity="0.6" />
      </svg>

      {withText && (
        <div className={`leading-tight ${textColor}`}>
          <div className="font-display font-bold tracking-[0.22em] text-[15px]">
            CLEAN STATION
          </div>
          <div className="font-display tracking-[0.55em] text-[10px] opacity-80 text-center mt-0.5">
            CAR
          </div>
        </div>
      )}
    </div>
  );
}
