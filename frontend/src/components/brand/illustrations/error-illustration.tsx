'use client';

import * as React from 'react';

export function ErrorIllustration({ className }: { className?: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="120" height="120" rx="12" fill="#FEF2F2" border="1px solid #FCA5A5" />
      <path d="M60 30L90 85H30L60 30Z" fill="#EF4444" opacity="0.15" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="60" cy="74" r="3" fill="#DC2626" />
      <line x1="60" y1="48" x2="60" y2="66" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
