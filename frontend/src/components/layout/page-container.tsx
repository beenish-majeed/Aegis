import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('flex-1 space-y-6 p-8 max-w-7xl mx-auto w-full', className)}>
      {/* Page Header Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-aegis-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-aegis-text">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-aegis-muted max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>

      {/* Main Page Content */}
      <div>{children}</div>
    </div>
  );
}
