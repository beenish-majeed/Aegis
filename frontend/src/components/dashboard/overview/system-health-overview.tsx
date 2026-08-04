'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, TrendingUp, Zap, FolderOpen, Activity, AlertCircle } from 'lucide-react';

export interface SystemHealthOverviewProps {
  healthScore?: number;
  riskLevel?: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  confidenceStatus?: string;
  trendPercentage?: number;
  onNewScan?: () => void;
  onBatchScan?: () => void;
}

export function SystemHealthOverview({
  healthScore = 94.2,
  riskLevel = 'LOW RISK',
  confidenceStatus = 'Very High',
  trendPercentage = 2.4,
  onNewScan,
  onBatchScan,
}: SystemHealthOverviewProps) {
  const riskBadgeVariant =
    riskLevel === 'LOW RISK'
      ? 'supported'
      : riskLevel === 'MEDIUM RISK'
      ? 'medium'
      : 'unsupported';

  return (
    <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left System Info */}
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-large text-indigo-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold tracking-tight">System Health Overview</h2>
                <Badge variant={riskBadgeVariant}>{riskLevel}</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Aegis evaluation engine running on <span className="text-indigo-300 font-mono font-semibold">all-MiniLM-L6-v2</span>.
                Baseline faithfulness score meets production deployment criteria.
              </p>
            </div>
          </div>

          {/* Center Metric Chips */}
          <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Health Score</span>
              <span className="text-2xl font-extrabold text-white">{healthScore.toFixed(1)}%</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Confidence</span>
              <span className="text-sm font-bold text-emerald-400">{confidenceStatus}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Baseline Trend</span>
              <span className="text-sm font-bold text-indigo-300 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +{trendPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link href="/batch">
              <Button variant="secondary" onClick={onBatchScan} className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                <FolderOpen className="w-4 h-4 mr-2 text-slate-400" />
                Batch Scan
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="primary" onClick={onNewScan} className="bg-indigo-600 hover:bg-indigo-500 shadow-glow">
                <Zap className="w-4 h-4 mr-2" />
                New Scan
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
