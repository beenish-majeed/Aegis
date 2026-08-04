import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { FaithfulnessReport } from '@/types/scanner';

export function useReportQuery(reportId: string) {
  return useQuery<FaithfulnessReport>({
    queryKey: ['report', reportId],
    queryFn: () => reportService.getReportById(reportId),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 10,
  });
}
