import { apiClient } from '@/lib/api';
import { FaithfulnessReport, ScanInput } from '@/types/scanner';

export const scanService = {
  async executeSingleScan(input: ScanInput): Promise<FaithfulnessReport> {
    const response = await apiClient.post<FaithfulnessReport>('/api/scan', input);
    return response.data;
  },

  async executeBatchScan(inputs: ScanInput[]): Promise<FaithfulnessReport[]> {
    const response = await apiClient.post<FaithfulnessReport[]>('/api/scan/batch', { inputs });
    return response.data;
  },
};
