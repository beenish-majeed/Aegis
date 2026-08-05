import * as React from 'react';
import { cn } from '@/lib/utils';
import { CardSkeleton } from '@/components/ui/card';
import { FolderX } from 'lucide-react';

export interface DashboardSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  description,
  actions,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There is no data to display for this section.',
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-bold text-aegis-text">{title}</h2>}
            {description && <p className="text-xs text-aegis-muted mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}

      {isLoading ? (
        <CardSkeleton />
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-aegis-surface border border-dashed border-aegis-border rounded-large">
          <div className="p-3 mb-2 bg-aegis-surface-subtle rounded-full text-aegis-muted border border-aegis-border">
            <FolderX className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-aegis-text">{emptyTitle}</h3>
          <p className="text-xs text-aegis-muted mt-0.5 max-w-sm">{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
