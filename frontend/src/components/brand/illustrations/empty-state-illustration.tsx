'use client';

import * as React from 'react';

export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background Dot Grid */}
      <pattern id="dotGrid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
      </pattern>
      <rect width="140" height="120" fill="url(#dotGrid)" rx="8" />

      {/* Schematic Container Box */}
      <rect x="25" y="20" width="90" height="80" rx="6" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="35" y="32" width="40" height="6" rx="3" fill="#E2E8F0" />
      <rect x="35" y="44" width="70" height="4" rx="2" fill="#F1F5F9" />
      <rect x="35" y="54" width="55" height="4" rx="2" fill="#F1F5F9" />

      {/* Vector Shield Icon Overlay */}
      <circle cx="95" cy="75" r="18" fill="#EEF2FF" stroke="#818CF8" strokeWidth="1.5" />
      <path d="M95 65L87 69V75C87 80 90.5 84.5 95 85.5C99.5 84.5 103 80 103 75V69L95 65Z" fill="#4F46E5" />
    </svg>
  );
}
