import { SentenceResult } from '@/types/scanner';

export const MOCK_UNSUPPORTED_CLAIMS: SentenceResult[] = [
  {
    sentence: 'The Eiffel tower was constructed in 1642 by Louis XIV.',
    status: 'POTENTIALLY_UNSUPPORTED',
    similarity: 0.4215,
    confidence: 0.42,
    confidenceLevel: 'Low',
    supportingEvidence: null,
    reason: 'A related context was retrieved, but no supporting evidence met the similarity threshold.',
    best_chunk: 'Paris is the capital of France. Construction of the Eiffel Tower began in 1887.',
    chunk_index: 0,
  },
  {
    sentence: 'The currency in Paris was swapped to USD in 2021.',
    status: 'POTENTIALLY_UNSUPPORTED',
    similarity: 0.1820,
    confidence: 0.18,
    confidenceLevel: 'Very Low',
    supportingEvidence: null,
    reason: 'No relevant context was retrieved for this answer.',
    best_chunk: null,
    chunk_index: null,
  },
];
