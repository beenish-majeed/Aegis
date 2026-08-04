'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaithfulnessRadialRing } from '../faithfulness-radial-ring';
import { ShieldCheck, ShieldAlert, Activity, AlertTriangle, Layers } from 'lucide-react';

export interface AIReliabilityOverviewProps {
  faithfulnessScore?: number; // 0 to 100
  supportedPercentage?: number;
  unsupportedPercentage?: number;
  avgConfidence?: number;
  riskLevel?: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
}

export function AIReliabilityOverview({
  faithfulnessScore = 85.7,
  supportedPercentage = 85.7,
  unsupportedPercentage = 14.3,
  avgConfidence = 0.91,
  riskLevel = 'LOW RISK',
}: AIReliabilityOverviewProps) {
  const riskBadgeVariant =
    riskLevel === 'LOW RISK'
      ? 'supported'
      : riskLevel === 'MEDIUM RISK'
      ? 'medium'
      : 'unsupported';

  return (
    <Card className="bg-white border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-small">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-aegis-text">AI Reliability Overview</CardTitle>
              <CardDescription>Comprehensive Model Verification & Accuracy Profile</CardDescription>
            </div>
          </div>
          <Badge variant={riskBadgeVariant}>{riskLevel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* 1. Radial Faithfulness Ring */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-medium border border-slate-100">
            <FaithfulnessRadialRing score={faithfulnessScore} size={130} />
            <span className="text-xs font-semibold text-aegis-muted mt-2">Overall Faithfulness</span>
          </div>

          {/* 2. Supported vs Unsupported Breakdown Bars */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Supported Claims
                </span>
                <span>{supportedPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${supportedPercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center text-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  Unsupported Claims
                </span>
                <span>{unsupportedPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${unsupportedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Metric Summary Chips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-medium border border-slate-200">
              <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Avg Confidence</span>
              <span className="text-lg font-extrabold text-aegis-primary block mt-0.5">{avgConfidence.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-medium border border-slate-200">
              <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Threshold</span>
              <span className="text-lg font-extrabold text-aegis-text block mt-0.5">0.75</span>
            </div>

            <div className="col-span-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-medium">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-900 flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Vector Model
                </span>
                <span className="font-mono text-indigo-700 font-bold">all-MiniLM-L6-v2</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
