'use client';

import * as React from 'react';
import { CriticalFindingsPanel } from '@/components/dashboard/investigation/critical-findings-panel';
import { SentenceResult } from '@/types/scanner';

export interface FindingsWorkspaceProps {
  unsupportedClaims: SentenceResult[];
  onInspectSentence: (sentence: SentenceResult) => void;
}

export function FindingsWorkspace({ unsupportedClaims, onInspectSentence }: FindingsWorkspaceProps) {
  return (
    <CriticalFindingsPanel
      unsupportedSentences={unsupportedClaims}
      onInspectSentence={onInspectSentence}
    />
  );
}
