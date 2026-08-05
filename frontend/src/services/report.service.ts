import { apiClient } from '@/lib/api';
import { FaithfulnessReport } from '@/types/scanner';
import { MOCK_FAITHFULNESS_REPORT } from '@/data/dashboard/mock-report';

export const reportService = {
  async getAllReports(): Promise<FaithfulnessReport[]> {
    try {
      const response = await apiClient.get<FaithfulnessReport[]>('/api/reports');
      return response.data;
    } catch {
      return [];
    }
  },

  async getReportById(id: string): Promise<FaithfulnessReport> {
    try {
      const response = await apiClient.get<FaithfulnessReport>(`/api/reports/${id}`);
      return response.data;
    } catch {
      return MOCK_FAITHFULNESS_REPORT;
    }
  },

  async exportReport(id: string, format: 'json' | 'html' | 'text'): Promise<Blob> {
    const response = await apiClient.get(`/api/reports/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
