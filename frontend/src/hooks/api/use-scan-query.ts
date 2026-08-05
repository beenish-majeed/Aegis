import { useMutation } from '@tanstack/react-query';
import { scanService } from '@/services/scan.service';
import { ScanInput, FaithfulnessReport } from '@/types/scanner';

export function useExecuteScanMutation() {
  return useMutation<FaithfulnessReport, Error, ScanInput>({
    mutationFn: (input: ScanInput) => scanService.executeSingleScan(input),
  });
}

export function useExecuteFileUploadMutation() {
  return useMutation<FaithfulnessReport, Error, File>({
    mutationFn: (file: File) => scanService.executeFileUploadScan(file),
  });
}

export function useExecuteBatchScanMutation() {
  return useMutation<FaithfulnessReport[], Error, ScanInput[]>({
    mutationFn: (inputs: ScanInput[]) => scanService.executeBatchScan(inputs),
  });
}
