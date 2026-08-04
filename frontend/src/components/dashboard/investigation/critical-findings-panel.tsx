'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Eye, AlertCircle, FileSearch } from 'lucide-react';
import { SentenceResult } from '@/types/scanner';

export interface CriticalFindingsPanelProps {
  unsupportedSentences?: SentenceResult[];
  onInspectSentence?: (sentence: SentenceResult) => void;
}

const DEFAULT_UNSUPPORTED_CLAIMS: SentenceResult[] = [
  {
    sentence: 'The Eiffel tower was constructed in 1642 by Louis XIV.',
    status: 'POTENTIALLY_UNSUPPORTED',
    similarity: 0.4215,
    confidence: 0.42,
    confidenceLevel: 'Low',
    supportingEvidence: null,
    reason: 'A related context was retrieved, but no supporting evidence met the similarity threshold.',
    best_chunk: 'Paris is the capital of France. Construction of the Eiffel Tower began in 1887.',
  },
  {
    sentence: 'The currency in Paris was swapped to USD in 2021.',
    status: 'POTENTIALLY_UNSUPPORTED',
    similarity: 0.1820,
    confidence: 0.18,
    confidenceLevel: 'Very Low',
    supportingEvidence: null,
    reason: 'No relevant context was retrieved for this answer.',
    best_chunk: null,
  },
];

export function CriticalFindingsPanel({
  unsupportedSentences = DEFAULT_UNSUPPORTED_CLAIMS,
  onInspectSentence,
}: CriticalFindingsPanelProps) {
  if (unsupportedSentences.length === 0) {
    return (
      <Card className="bg-emerald-50/50 border border-emerald-200">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-900">Zero Critical Findings Detected</h3>
            <p className="text-xs text-emerald-700 mt-1 max-w-sm">
              All answer sentences met the 0.75 similarity threshold with valid supporting evidence.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-rose-200 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-small">
              <AlertCircle className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-aegis-text">Critical Findings Panel</CardTitle>
          </div>
          <Badge variant="unsupported">{unsupportedSentences.length} Unsupported Claims Flagged</Badge>
        </div>
        <CardDescription>
          Sentence-level hallucinations requiring context retrieval calibration or prompt engineering.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100">
        {unsupportedSentences.map((item, idx) => (
          <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-rose-700">Claim #{idx + 1}</span>
                <Badge variant="low">{item.confidenceLevel}</Badge>
                <span className="text-[11px] font-mono text-aegis-muted">Sim: {item.similarity.toFixed(4)}</span>
              </div>
              <p className="text-xs font-semibold text-aegis-text italic">"{item.sentence}"</p>
              <p className="text-[11px] text-amber-700 flex items-center">
                <FileSearch className="w-3 h-3 mr-1 text-amber-600 flex-shrink-0" />
                {item.reason}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onInspectSentence && onInspectSentence(item)}
              className="border-rose-200 text-rose-800 hover:bg-rose-50 self-start sm:self-center flex-shrink-0"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Inspect Claim
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
