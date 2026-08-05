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

  const loadDemoData = React.useCallback(() => {
    setHasDemoData(true);
  }, []);

  const clearData = React.useCallback(() => {
    setHasDemoData(false);
  }, []);

  const refreshData = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // If backend returns scanned metrics from FastAPI, prioritize real backend response!
  const hasRealBackendData = Boolean(
    backendData && backendData.metrics && backendData.metrics.totalSentences > 0
  );

  const metrics = hasRealBackendData
    ? backendData!.metrics
    : hasDemoData
    ? MOCK_DASHBOARD_METRICS
    : ZERO_DASHBOARD_METRICS;

  const unsupportedClaims = hasRealBackendData
    ? backendData!.unsupportedClaims
    : hasDemoData
    ? MOCK_UNSUPPORTED_CLAIMS
    : [];

  const report = hasDemoData ? MOCK_FAITHFULNESS_REPORT : EMPTY_FAITHFULNESS_REPORT;

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
