import React from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';

export default function LegalModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-4">
            <Logo size={32} />
            <div className="font-display text-sm font-bold tracking-[0.2em] text-white/80">
              {title.toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/15 hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 prose prose-invert prose-sm max-w-none
          prose-headings:font-display prose-headings:tracking-wide prose-headings:text-white
          prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
