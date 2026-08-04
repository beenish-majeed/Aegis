import { apiClient } from '@/lib/api';
import { MOCK_DASHBOARD_METRICS, DashboardMetricsData } from '@/data/dashboard/dashboard-metrics';
import { MOCK_UNSUPPORTED_CLAIMS } from '@/data/dashboard/findings';
import { SentenceResult } from '@/types/scanner';

export interface DashboardOverviewResponse {
  metrics: DashboardMetricsData;
  unsupportedClaims: SentenceResult[];
}

export const dashboardService = {
  async getDashboardOverview(): Promise<DashboardOverviewResponse> {
    try {
      const response = await apiClient.get<DashboardOverviewResponse>('/api/dashboard/overview');
      return response.data;
    } catch {
      // Fallback development data
      return {
        metrics: MOCK_DASHBOARD_METRICS,
        unsupportedClaims: MOCK_UNSUPPORTED_CLAIMS,
      };
    }
  },
};
