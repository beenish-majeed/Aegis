'use client';

import * as React from 'react';
import { LoadingIllustration } from '@/components/brand/illustrations/loading-illustration';
import { Card } from '@/components/ui/card';

export interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({
  title = 'Processing RAG Evaluation',
  message = 'Calculating vector similarity and encoding sentence embeddings...',
}: LoadingStateProps) {
  return (
    <Card hoverEffect={false} className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <LoadingIllustration className="w-16 h-16 mb-4" />
      <h3 className="text-sm font-bold text-aegis-text">{title}</h3>
      <p className="text-xs text-aegis-muted mt-1 max-w-sm leading-relaxed">{message}</p>
    </Card>
  );
}
