import React from 'react';

/**
 * Silhueta do veículo, vista lateral. Recuperada do calculador original.
 *
 * A carroçaria e o habitáculo iluminam-se conforme os problemas assinalados,
 * para o cliente ver de relance onde está o trabalho em vez de contar linhas
 * numa lista.
 */
export default function CarVisual({ interiorCount = 0, exteriorCount = 0, ariaLabel }) {
  const extActive = exteriorCount > 0;
  const intActive = interiorCount > 0;

  return (
    <svg viewBox="0 0 400 170" className="w-full h-auto" role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="csc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0b1f4a" />
        </linearGradient>
        <linearGradient id="csc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      <ellipse cx="200" cy="150" rx="160" ry="9" fill="#000" opacity="0.5" />

      {/* habitáculo — acende com os problemas de interior */}
      <path
        d="M126 88 L146 60 C153 53 166 50 182 50 L246 50 C272 50 286 58 296 80 L302 88 Z"
        fill="url(#csc-glass)"
        opacity={intActive ? 0.95 : 0.28}
        stroke={intActive ? '#93c5fd' : 'transparent'}
        strokeWidth="2"
        style={{ transition: 'all .3s ease' }}
      />
      <line x1="214" y1="52" x2="214" y2="88" stroke="#0b1f4a" strokeWidth="3" opacity="0.6" />

      {/* carroçaria — acende com os problemas de exterior */}
      <path
        d="M40 120 C40 100 58 94 96 90 L120 66 C130 55 150 48 182 48 L250 48
           C282 48 298 58 310 80 L332 92 C356 96 362 106 360 120
           C360 126 356 130 350 130 L50 130 C44 130 40 126 40 120 Z"
        fill="url(#csc-body)"
        stroke={extActive ? '#60a5fa' : '#1e3a8a'}
        strokeWidth={extActive ? 3 : 1.5}
        opacity={extActive ? 1 : 0.85}
        style={{
          transition: 'all .3s ease',
          filter: extActive ? 'drop-shadow(0 0 10px rgba(59,130,246,.65))' : 'none',
        }}
      />

      {[120, 286].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="130" r="24" fill="#0a0a0a" stroke="#27272a" strokeWidth="2" />
          <circle cx={cx} cy="130" r="11" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <circle cx={cx} cy="130" r="3" fill="#52525b" />
        </g>
      ))}
    </svg>
  );
}
