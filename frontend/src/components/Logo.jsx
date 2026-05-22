import React from 'react';

// Metallic chrome circular logo with sporty car silhouette
export default function Logo({ size = 56, withText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative rounded-full flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          background:
            'radial-gradient(circle at 30% 25%, #ffffff 0%, #c8c8c8 25%, #6a6a6a 55%, #1a1a1a 85%)',
          boxShadow:
            'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div
          className="absolute inset-[3px] rounded-full"
          style={{
            background:
              'linear-gradient(180deg, #2a2a2a 0%, #050505 50%, #1a1a1a 100%)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
          }}
        />
        <svg
          viewBox="0 0 64 64"
          className="relative z-10"
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          <defs>
            <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#9a9a9a" />
              <stop offset="100%" stopColor="#3a3a3a" />
            </linearGradient>
          </defs>
          {/* Stylized sports car silhouette */}
          <path
            fill="url(#carGrad)"
            d="M6 38c0-1.4 1.2-2.4 2.6-2.4h2.1l3.4-7.6c1.2-2.7 3.9-4.4 6.9-4.4h21.4c2.6 0 5 1.4 6.3 3.6l4.7 8.1 4.5 1.2c2 .5 3.4 2.3 3.4 4.3v3.7c0 .9-.7 1.6-1.6 1.6h-3.6a5.4 5.4 0 0 1-10.6 0H22a5.4 5.4 0 0 1-10.6 0H8c-1.1 0-2-.9-2-2v-6.1zm10.5-2.8h32.7l-3.2-5.5c-.6-1-1.7-1.7-2.9-1.7H21.5c-1.3 0-2.5.8-3 2l-2 5.2zM17.5 44a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6zm26.6 0a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z"
          />
        </svg>
      </div>
      {withText && (
        <div className="leading-tight">
          <div
            className="font-display font-bold tracking-[0.18em] text-sm"
            style={{
              background:
                'linear-gradient(180deg, #ffffff 0%, #d4d4d4 45%, #6a6a6a 60%, #cccccc 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CLEAN STATION
          </div>
          <div className="font-display tracking-[0.42em] text-white/55 text-[10px] text-center">
            CAR
          </div>
        </div>
      )}
    </div>
  );
}
