'use client';

import * as React from 'react';
import { EmptyStateIllustration } from '@/components/brand/illustrations/empty-state-illustration';
import { Card } from '@/components/ui/card';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No Data Found',
  message = 'There are no active records or audit evaluation reports available.',
  action,
}: EmptyStateProps) {
  return (
    <Card hoverEffect={false} className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <EmptyStateIllustration className="w-24 h-24 mb-4" />
      <h3 className="text-sm font-bold text-aegis-text">{title}</h3>
      <p className="text-xs text-aegis-muted mt-1 max-w-sm leading-relaxed">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
