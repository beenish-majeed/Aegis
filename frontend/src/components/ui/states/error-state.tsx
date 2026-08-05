'use client';

import React from 'react';
import { ErrorIllustration } from '@/components/brand/illustrations/error-illustration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export function ErrorState({
  title = 'An Error Occurred',
  message = 'Failed to fetch scan results or complete faithfulness evaluation.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <Card hoverEffect={false} className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <ErrorIllustration className="w-24 h-24 mb-4" />
      <h3 className="text-sm font-bold text-rose-800">{title}</h3>
      <p className="text-xs text-rose-600/80 mt-1 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
