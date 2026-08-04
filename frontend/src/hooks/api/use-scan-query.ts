import { useMutation } from '@tanstack/react-query';
import { scanService } from '@/services/scan.service';
import { ScanInput, FaithfulnessReport } from '@/types/scanner';

export function useExecuteScanMutation() {
  return useMutation<FaithfulnessReport, Error, ScanInput>({
    mutationFn: (input: ScanInput) => scanService.executeSingleScan(input),
  });
}
