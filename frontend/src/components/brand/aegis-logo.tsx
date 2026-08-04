'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AegisLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export function AegisLogo({ size = 'md', showBadge = true, className }: AegisLogoProps) {
  const sizeStyles = {
    sm: { icon: 'w-7 h-7', text: 'text-sm', badge: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-base', badge: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-xl', badge: 'text-[11px]' },
  };

  return (
    <div className={cn('flex items-center space-x-3 select-none', className)}>
      {/* Aegis Geometric Shield & Vector Matrix Logomark SVG */}
      <div className={cn('relative flex items-center justify-center rounded-small bg-indigo-600 text-white shadow-sm flex-shrink-0', sizeStyles[size].icon)}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          {/* Outer Chamfered Shield Path */}
          <path
            d="M18 4L6 9V17C6 24.5 11.2 31.2 18 33C24.8 31.2 30 24.5 30 17V9L18 4Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inner Vector Matrix Convergence Nodes */}
          <circle cx="18" cy="13" r="2" fill="#38BDF8" />
          <circle cx="13" cy="21" r="2" fill="#38BDF8" />
          <circle cx="23" cy="21" r="2" fill="#38BDF8" />
          {/* Vector Connection Lines */}
          <path d="M18 13L13 21M18 13L23 21M13 21H23" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Brand Logotype & Version Badge */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5">
          <span className={cn('font-black tracking-tight text-aegis-text uppercase leading-none', sizeStyles[size].text)}>
            AEGIS
          </span>
        </div>
        {showBadge && (
          <span className={cn('font-bold text-aegis-primary uppercase tracking-widest leading-tight mt-0.5', sizeStyles[size].badge)}>
            RAG Auditor v5.0
          </span>
        )}
      </div>
    </div>
  );
}
