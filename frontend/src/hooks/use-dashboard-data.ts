import * as React from 'react';
import { useDashboardQuery } from '@/hooks/api/use-dashboard-query';
import { MOCK_DASHBOARD_METRICS, ZERO_DASHBOARD_METRICS, DashboardMetricsData } from '@/data/dashboard/dashboard-metrics';
import { MOCK_UNSUPPORTED_CLAIMS } from '@/data/dashboard/findings';
import { MOCK_FAITHFULNESS_REPORT, EMPTY_FAITHFULNESS_REPORT } from '@/data/dashboard/mock-report';
import { SentenceResult, FaithfulnessReport } from '@/types/scanner';

export interface UseDashboardDataResult {
  metrics: DashboardMetricsData;
  unsupportedClaims: SentenceResult[];
  report: FaithfulnessReport;
  isLoading: boolean;
  hasDemoData: boolean;
  loadDemoData: () => void;
  clearData: () => void;
  refreshData: () => void;
}

export function useDashboardData(): UseDashboardDataResult {
  const { data: backendData, isLoading: isQueryLoading, refetch } = useDashboardQuery();
  const [hasDemoData, setHasDemoData] = React.useState(false);
  const [latestReport, setLatestReport] = React.useState<FaithfulnessReport | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_latest_report');
      if (stored) {
        try {
          setLatestReport(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, [backendData]);

  const loadDemoData = React.useCallback(() => {
    setHasDemoData(true);
  }, []);

  const clearData = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aegis_latest_report');
    }
    setLatestReport(null);
    setHasDemoData(false);
  }, []);

  const refreshData = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const hasRealBackendData = Boolean(
    (backendData && backendData.metrics && backendData.metrics.totalSentences > 0) || latestReport
  );

  let metrics = ZERO_DASHBOARD_METRICS;
  let unsupportedClaims: SentenceResult[] = [];
  let report: FaithfulnessReport = EMPTY_FAITHFULNESS_REPORT;

  if (latestReport) {
    const unsupp = (latestReport.results || []).filter((r) => r.status === 'POTENTIALLY_UNSUPPORTED');
    const totalS = (latestReport.results || []).length;
    const suppCount = totalS - unsupp.length;

    metrics = {
      healthScore: latestReport.faithfulness_score,
      riskLevel: latestReport.faithfulness_score >= 85 ? 'LOW RISK' : latestReport.faithfulness_score >= 70 ? 'MEDIUM RISK' : 'HIGH RISK',
      confidenceStatus: 'High',
      trendPercentage: 2.4,
      faithfulnessScore: latestReport.faithfulness_score,
      totalSentences: totalS,
      supportedCount: suppCount,
      unsupportedCount: unsupp.length,
      avgConfidence: 0.88,
      threshold: 0.75,
      summaryText: `Evaluated ${totalS} sentence(s). Faithfulness Score: ${latestReport.faithfulness_score}%.`,
      mainFailureReason: unsupp.length > 0 ? 'Unsupported claim detected in answer payload.' : 'All claims fully supported by context.',
      recommendedAction: unsupp.length > 0 ? 'Review unverified claims in findings inspector.' : 'No action needed.',
    };

    unsupportedClaims = unsupp;
    report = latestReport;
  } else if (backendData && backendData.metrics && backendData.metrics.totalSentences > 0) {
    metrics = backendData.metrics;
    unsupportedClaims = backendData.unsupportedClaims;
  } else if (hasDemoData) {
    metrics = MOCK_DASHBOARD_METRICS;
    unsupportedClaims = MOCK_UNSUPPORTED_CLAIMS;
    report = MOCK_FAITHFULNESS_REPORT;
  }

  return {
    metrics,
    unsupportedClaims,
    report,
    isLoading: isQueryLoading,
    hasDemoData: hasRealBackendData || hasDemoData,
    loadDemoData,
    clearData,
    refreshData,
  };
}
