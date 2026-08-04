import axios from 'axios';
import { FaithfulnessReport, ScanHistoryItem } from '@/types/scanner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scannerApi = {
  scanSinglePayload: async (payload: {
    question: string;
    retrieved_chunks: string[];
    answer: string;
    threshold?: number;
  }): Promise<FaithfulnessReport> => {
    const { data } = await api.post<FaithfulnessReport>('/scan', payload);
    return data;
  },

  fetchScanHistory: async (): Promise<ScanHistoryItem[]> => {
    const { data } = await api.get<ScanHistoryItem[]>('/history');
    return data;
  },

  fetchScanById: async (id: string): Promise<FaithfulnessReport> => {
    const { data } = await api.get<FaithfulnessReport>(`/scans/${id}`);
    return data;
  },
};
