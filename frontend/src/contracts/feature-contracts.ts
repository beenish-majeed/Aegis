import { SentenceResult } from '@/types/scanner';

export interface ReliabilityFeatureProps {
  healthScore: number;
  riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  confidenceStatus: string;
  trendPercentage: number;
  faithfulnessScore: number;
  summaryText: string;
  unsupportedCount: number;
  mainFailureReason: string;
  recommendedAction: string;
}

export interface FindingsFeatureProps {
  unsupportedClaims: SentenceResult[];
  onInspectSentence: (sentence: SentenceResult) => void;
}

export interface InspectorFeatureProps {
  sentence: SentenceResult | null;
  currentIndex: number;
  totalFindings: number;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onClear: () => void;
}
