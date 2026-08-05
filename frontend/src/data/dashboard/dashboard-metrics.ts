export interface DashboardMetricsData {
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
}

export const ZERO_DASHBOARD_METRICS: DashboardMetricsData = {
  healthScore: 0,
  riskLevel: 'LOW RISK',
  confidenceStatus: 'No Data',
  trendPercentage: 0,
  faithfulnessScore: 0,
  totalSentences: 0,
  supportedCount: 0,
  unsupportedCount: 0,
  avgConfidence: 0,
  threshold: 0.75,
  summaryText:
    'No evaluation scans recorded yet in this workspace. Run a single scan or click "Load Demo Data" to populate workspace analytics.',
  mainFailureReason: 'No scan data evaluated yet in current workspace context.',
  recommendedAction:
    'Click "Run First Scan" or "Load Demo Data" to populate RAG observability metrics.',
};

export const MOCK_DASHBOARD_METRICS: DashboardMetricsData = {
  healthScore: 94.2,
  riskLevel: 'LOW RISK',
  confidenceStatus: 'Very High',
  trendPercentage: 2.4,
  faithfulnessScore: 85.7,
  totalSentences: 28,
  supportedCount: 24,
  unsupportedCount: 4,
  avgConfidence: 0.91,
  threshold: 0.75,
  summaryText:
    'The evaluated RAG answer demonstrates strong overall faithfulness (85.7%). Out of 28 sentences, 24 met the similarity threshold. 4 claims were flagged for context extrapolation.',
  mainFailureReason:
    'Retrieved context chunks had insufficient similarity to support out-of-context extrapolation.',
  recommendedAction:
    'Increase retriever top_k from 3 to 5 or recalibrate sentence segmentation bounds.',
};
