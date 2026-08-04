'use client';

import * as React from 'react';
import { StickyInspectorPanel } from '@/components/dashboard/investigation/sticky-inspector-panel';
import { SentenceResult } from '@/types/scanner';

export interface InspectorWorkspaceProps {
  sentence: SentenceResult | null;
  currentIndex: number;
  totalFindings: number;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onClear: () => void;
}

export function InspectorWorkspace({
  sentence,
  currentIndex,
  totalFindings,
  onNavigatePrev,
  onNavigateNext,
  onClear,
}: InspectorWorkspaceProps) {
  return (
    <StickyInspectorPanel
      sentence={sentence}
      currentIndex={currentIndex}
      totalFindings={totalFindings}
      onNavigatePrev={onNavigatePrev}
      onNavigateNext={onNavigateNext}
      onClear={onClear}
    />
  );
}
