export type FaithfulnessStatus = 'SUPPORTED' | 'POTENTIALLY_UNSUPPORTED';

export type ConfidenceLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';

export interface ScanInput {
  question: string;
  answer: string;
  retrieved_chunks: string[];
  threshold?: number;
}

export interface SentenceResult {
  sentence: string;
  status: FaithfulnessStatus;
  similarity: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  supportingEvidence: string | null;
  reason: string | null;
  best_chunk?: string | null;
  chunk_index?: number | null;
}

export interface AuditSummary {
  total_sentences: number;
  supported: number;
  potentially_unsupported: number;
  faithfulness_score: number;
}

export interface FaithfulnessReport {
  id: string;
  timestamp: string;
  question: string;
  retrieved_chunks: string[];
  answer: string;
  faithfulness_score: number;
  summary: AuditSummary;
  results: SentenceResult[];
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  question: string;
  total_sentences: number;
  faithfulness_score: number;
  status: FaithfulnessStatus;
}
