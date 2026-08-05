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
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    supported:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold',
    unsupported:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold',
    'very-high':
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-semibold',
    high:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold',
    medium:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold',
    low:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-semibold',
    'very-low':
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold',
    neutral:
      'bg-aegis-surface-subtle text-aegis-muted border-aegis-border font-medium',
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
