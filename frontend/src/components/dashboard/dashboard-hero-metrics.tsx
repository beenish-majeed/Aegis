'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaithfulnessRadialRing } from './faithfulness-radial-ring';
import { ConfidenceHistogram } from './confidence-histogram';
import { ShieldCheck, ShieldAlert, BarChart2, Sliders } from 'lucide-react';

export interface DashboardHeroMetricsProps {
  score?: number;
  totalSentences?: number;
  supportedCount?: number;
  unsupportedCount?: number;
  avgConfidence?: number;
  threshold?: number;
}

export function DashboardHeroMetrics({
  score = 85.7,
  totalSentences = 28,
  supportedCount = 24,
  unsupportedCount = 4,
  avgConfidence = 0.91,
  threshold = 0.75,
}: DashboardHeroMetricsProps) {
  const passRate = totalSentences > 0 ? (supportedCount / totalSentences) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Faithfulness Score Radial Gauge Card */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-0 border-b-0">
          <div className="flex items-center justify-between">
            <CardDescription className="font-semibold text-xs uppercase tracking-wider">
              Faithfulness Score
            </CardDescription>
            <Badge variant={score >= 75 ? 'supported' : 'unsupported'}>
              {score >= 75 ? 'SUPPORTED' : 'UNSUPPORTED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-4">
          <FaithfulnessRadialRing score={score} size={130} />
        </CardContent>
      </Card>

      {/* 2. Supported vs Unsupported Sentences Card */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3">
          <CardDescription className="font-semibold text-xs uppercase tracking-wider">
            Sentence Verification
          </CardDescription>
          <CardTitle className="text-2xl font-extrabold text-aegis-text mt-1">
            {totalSentences} Total Sentences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Supported ({supportedCount})
              </span>
              <span>{passRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${passRate}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center text-rose-700">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Unsupported ({unsupportedCount})
              </span>
              <span>{(100 - passRate).toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${100 - passRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Confidence Distribution Histogram Card */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <CardDescription className="font-semibold text-xs uppercase tracking-wider">
              Confidence Distribution
            </CardDescription>
            <BarChart2 className="w-4 h-4 text-aegis-muted" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ConfidenceHistogram />
        </CardContent>
      </Card>

      {/* 4. Average Confidence & Threshold Calibration Card */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription className="font-semibold text-xs uppercase tracking-wider">
              Avg Confidence
            </CardDescription>
            <Badge variant="very-high">Very High</Badge>
          </div>
          <CardTitle className="text-3xl font-extrabold text-indigo-600 mt-1">
            {avgConfidence.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="p-3 bg-slate-50 rounded-medium border border-aegis-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-aegis-muted" />
              <span className="text-xs font-medium text-aegis-text">Active Threshold</span>
            </div>
            <span className="text-xs font-bold text-aegis-primary">{threshold.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-aegis-muted">
            Sentences exceeding 0.75 cosine similarity are classified as SUPPORTED.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
