import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn('w-full space-y-8 pb-12', className)}>
      {children}
    </div>
  );
}
