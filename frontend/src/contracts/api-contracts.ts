import { SentenceResult, AuditSummary, FaithfulnessReport, ScanInput } from '@/types/scanner';

export interface ScanApiRequest {
  question: string;
  retrieved_chunks: string[];
  answer: string;
  threshold?: number;
}

export interface ScanApiResponse {
  success: boolean;
  report: FaithfulnessReport;
}

export interface BatchScanApiRequest {
  inputs: ScanInput[];
  threshold?: number;
}

export interface BatchScanApiResponse {
  success: boolean;
  totalScans: number;
  reports: FaithfulnessReport[];
}

export interface DashboardOverviewApiResponse {
  healthScore: number;
  riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  confidenceStatus: string;
  trendPercentage: number;
  faithfulnessScore: number;
  totalSentences: number;
  supportedCount: number;
  unsupportedCount: number;
  avgConfidence: number;
  threshold: number;
  summaryText: string;
  mainFailureReason: string;
  recommendedAction: string;
  unsupportedClaims: SentenceResult[];
}

export interface SystemHealthApiResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  model: string;
  uptime: number;
}
