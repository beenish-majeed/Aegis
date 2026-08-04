'use client';

import * as React from 'react';
import { SystemHealthOverview } from '@/components/dashboard/overview/system-health-overview';
import { AIReliabilityOverview } from '@/components/dashboard/analytics/ai-reliability-overview';
import { AIEvaluationSummaryCard } from '@/components/dashboard/overview/ai-evaluation-summary-card';
import { DashboardMetricsData } from '@/data/dashboard/dashboard-metrics';

export interface ReliabilityOverviewProps {
  metrics: DashboardMetricsData;
}

export function ReliabilityOverview({ metrics }: ReliabilityOverviewProps) {
  return (
    <div className="space-y-8">
      <SystemHealthOverview
        healthScore={metrics.healthScore}
        riskLevel={metrics.riskLevel}
        confidenceStatus={metrics.confidenceStatus}
        trendPercentage={metrics.trendPercentage}
      />

      <AIReliabilityOverview
        faithfulnessScore={metrics.faithfulnessScore}
        supportedPercentage={metrics.faithfulnessScore}
        unsupportedPercentage={100 - metrics.faithfulnessScore}
        avgConfidence={metrics.avgConfidence}
        riskLevel={metrics.riskLevel}
      />

      <AIEvaluationSummaryCard
        summaryText={metrics.summaryText}
        unsupportedCount={metrics.unsupportedCount}
        mainFailureReason={metrics.mainFailureReason}
        recommendedAction={metrics.recommendedAction}
      />
    </div>
  );
}
