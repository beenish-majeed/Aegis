'use client';

import React from 'react';
import { LoadingIllustration } from '@/components/brand/illustrations/loading-illustration';
import { Card } from '@/components/ui/card';

export interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({
  title = 'Processing Faithfulness Audit...',
  message = 'Calculating vector similarity metrics and segmenting sentence claims.',
}: LoadingStateProps) {
  return (
    <Card hoverEffect={false} className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <LoadingIllustration className="w-24 h-24 mb-4" />
      <h3 className="text-sm font-bold text-aegis-text">{title}</h3>
      <p className="text-xs text-aegis-muted mt-1 max-w-sm leading-relaxed">{message}</p>
    </Card>
  );
}
