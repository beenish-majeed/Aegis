import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardOverviewResponse } from '@/services/dashboard.service';

export function useDashboardQuery() {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getDashboardOverview(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
  });
}
