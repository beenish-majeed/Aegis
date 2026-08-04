import { useQuery } from '@tanstack/react-query';
import { healthService, HealthStatusResponse } from '@/services/health.service';

export function useHealthQuery() {
  return useQuery<HealthStatusResponse>({
    queryKey: ['system', 'health'],
    queryFn: () => healthService.getSystemHealth(),
    staleTime: 1000 * 30, // 30 seconds cache
    refetchInterval: 1000 * 60, // Refetch every 1 min
  });
}
