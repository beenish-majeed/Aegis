'use client';

import * as React from 'react';
import { ErrorIllustration } from '@/components/brand/illustrations/error-illustration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Evaluation Request Failed',
  message = 'An unexpected API network error occurred. Please check backend connectivity and retry.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card hoverEffect={false} className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] border-rose-200 bg-rose-50/20">
      <ErrorIllustration className="w-16 h-16 mb-4" />
      <h3 className="text-sm font-bold text-rose-950">{title}</h3>
      <p className="text-xs text-rose-700 mt-1 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry Connection
        </Button>
      )}
    </Card>
  );
}
