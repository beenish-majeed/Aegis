'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UpgradedSimilarityTimeline, TimelinePoint } from '@/components/dashboard/analytics/upgraded-similarity-timeline';
import { Activity } from 'lucide-react';

export interface SimilarityAnalysisProps {
  onSentenceClick: (point: TimelinePoint) => void;
}

export function SimilarityAnalysis({ onSentenceClick }: SimilarityAnalysisProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-aegis-text flex items-center">
              <Activity className="w-4 h-4 mr-2 text-aegis-primary" />
              Sentence Similarity Timeline
            </CardTitle>
            <CardDescription>
              Interactive similarity scores across answer sentence indices (S1…Sn). Click node to inspect.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <UpgradedSimilarityTimeline onSentenceClick={onSentenceClick} />
      </CardContent>
    </Card>
  );
}
