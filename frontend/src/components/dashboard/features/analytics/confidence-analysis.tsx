'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaithfulnessScoreCard } from '@/components/dashboard/analytics/faithfulness-score-card';
import { InteractiveConfidenceHistogram } from '@/components/dashboard/analytics/interactive-confidence-histogram';
import { BarChart2 } from 'lucide-react';

export interface ConfidenceAnalysisProps {
  score: number;
  confidenceStatus: string;
  trendPercentage: number;
  activeFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
}

export function ConfidenceAnalysis({
  score,
  confidenceStatus,
  trendPercentage,
  activeFilter,
  onSelectFilter,
}: ConfidenceAnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FaithfulnessScoreCard
        score={score}
        confidenceLevel={confidenceStatus}
        trendPercentage={trendPercentage}
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-aegis-primary" />
                Confidence Histogram
              </CardTitle>
              <CardDescription>Click a bar to filter sentence categories</CardDescription>
            </div>
            {activeFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectFilter(null)}
                className="text-xs h-6 px-2"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <InteractiveConfidenceHistogram
            activeLevel={activeFilter}
            onSelectLevel={(level) =>
              onSelectFilter(level === activeFilter ? null : level)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
