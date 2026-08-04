import * as React from 'react';
import { MOCK_DASHBOARD_METRICS, DashboardMetricsData } from '@/data/dashboard/dashboard-metrics';
import { MOCK_UNSUPPORTED_CLAIMS } from '@/data/dashboard/findings';
import { MOCK_FAITHFULNESS_REPORT } from '@/data/dashboard/mock-report';
import { SentenceResult, FaithfulnessReport } from '@/types/scanner';

export interface UseDashboardDataResult {
  metrics: DashboardMetricsData;
  unsupportedClaims: SentenceResult[];
  report: FaithfulnessReport;
  isLoading: boolean;
  refreshData: () => void;
}

export function useDashboardData(): UseDashboardDataResult {
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshData = React.useCallback(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return {
    metrics: MOCK_DASHBOARD_METRICS,
    unsupportedClaims: MOCK_UNSUPPORTED_CLAIMS,
    report: MOCK_FAITHFULNESS_REPORT,
    isLoading,
    refreshData,
  };
}
