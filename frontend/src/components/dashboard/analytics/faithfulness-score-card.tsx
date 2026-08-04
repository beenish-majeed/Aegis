'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaithfulnessRadialRing } from '../faithfulness-radial-ring';
import { TrendingUp, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

export interface FaithfulnessScoreCardProps {
  score?: number;
  confidenceLevel?: string;
  trendPercentage?: number;
  onViewDetails?: () => void;
}

export function FaithfulnessScoreCard({
  score = 85.7,
  confidenceLevel = 'Very High',
  trendPercentage = 1.8,
  onViewDetails,
}: FaithfulnessScoreCardProps) {
  const getQualityLabel = (val: number) => {
    if (val >= 90) return { label: 'Excellent', color: 'text-emerald-600', badge: 'supported' as const };
    if (val >= 75) return { label: 'Good', color: 'text-indigo-600', badge: 'supported' as const };
    if (val >= 50) return { label: 'Warning', color: 'text-amber-600', badge: 'medium' as const };
    return { label: 'Critical', color: 'text-rose-600', badge: 'unsupported' as const };
  };

  const quality = getQualityLabel(score);

  return (
    <Card className="flex flex-col justify-between group">
      <CardHeader className="pb-2 border-b-0">
        <div className="flex items-center justify-between">
          <CardDescription className="font-semibold text-xs uppercase tracking-wider text-aegis-muted flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-aegis-primary" />
            Faithfulness Health
          </CardDescription>
          <div className="flex items-center space-x-1.5">
            <Badge variant={quality.badge}>{score >= 75 ? 'LOW RISK' : 'HIGH RISK'}</Badge>
            <Badge variant="very-high">{quality.label}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-3 space-y-4">
        {/* Radial Ring Gauge */}
        <FaithfulnessRadialRing score={score} size={135} />

        {/* Mini Sparkline & Trend Stats */}
        <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{trendPercentage}% vs baseline</span>
          </div>

          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="h-6 px-2 text-[11px] text-aegis-muted hover:text-aegis-text group-hover:translate-x-0.5 transition-transform"
            >
              Details
              <ArrowUpRight className="ml-1 w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
