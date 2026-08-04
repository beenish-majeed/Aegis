import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DashboardGridProps {
  mainContent: React.ReactNode;
  sideContent: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ mainContent, sideContent, className }: DashboardGridProps) {
  return (
    <div className={cn('grid grid-cols-12 gap-8 items-start', className)}>
      {/* Main Analytics Area: 8 columns on Desktop, 12 columns on Tablet & Mobile */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {mainContent}
      </div>

      {/* Side Inspector Area: 4 columns on Desktop, 12 columns on Mobile */}
      <div className="col-span-12 lg:col-span-4">
        {sideContent}
      </div>
    </div>
  );
}
