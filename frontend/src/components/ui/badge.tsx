import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'supported'
  | 'unsupported'
  | 'very-high'
  | 'high'
  | 'medium'
  | 'low'
  | 'very-low'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    supported:
      'bg-aegis-success-bg text-aegis-success border-aegis-success-border font-bold',
    unsupported:
      'bg-aegis-danger-bg text-aegis-danger border-aegis-danger-border font-bold',
    'very-high':
      'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    high:
      'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    medium:
      'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    low:
      'bg-orange-50 text-orange-700 border-orange-200 font-semibold',
    'very-low':
      'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
