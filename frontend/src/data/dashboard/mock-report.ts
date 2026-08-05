import { FaithfulnessReport } from '@/types/scanner';

export const EMPTY_FAITHFULNESS_REPORT: FaithfulnessReport = {
  id: 'empty-scan',
  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  question: 'No prompt analyzed yet',
  retrieved_chunks: [],
  answer: 'No model answer evaluated yet',
  faithfulness_score: 0,
  summary: {
    total_sentences: 0,
    supported: 0,
    potentially_unsupported: 0,
    faithfulness_score: 0,
  },
  results: [],
};

export const MOCK_FAITHFULNESS_REPORT: FaithfulnessReport = {
  id: 'scan-9021',
  timestamp: '2026-08-04 18:45:12',
  question: 'What is the capital of France and its primary GDP contributors?',
  retrieved_chunks: [
    'Paris is the capital and largest city of France.',
    'The GDP of Paris accounts for nearly 30% of the economy of France.',
  ],
  answer:
    'Paris is the capital of France. The city spans an area of 105 square kilometers. Its official currency is the Euro. The Eiffel tower was constructed in 1642 by Louis XIV.',
  faithfulness_score: 85.7,
  summary: {
    total_sentences: 28,
    supported: 24,
    potentially_unsupported: 4,
    faithfulness_score: 85.7,
  },
  results: [
    {
      sentence: 'Paris is the capital of France.',
      status: 'SUPPORTED',
      similarity: 0.9812,
      confidence: 0.98,
      confidenceLevel: 'Very High',
      supportingEvidence: 'Paris is the capital and largest city of France.',
      reason: null,
      best_chunk: 'Paris is the capital and largest city of France.',
      chunk_index: 0,
    },
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
  ],
};
