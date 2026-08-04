export interface AegisUserConfig {
  embeddingModel: string;
  similarityThreshold: number;
  theme: 'light' | 'dark' | 'system';
  defaultExportFormat: 'json' | 'html' | 'text';
  enableBatchVectorization: boolean;
  enableSentenceCaching: boolean;
  maxWorkerThreads: number;
}

export const DEFAULT_USER_CONFIG: AegisUserConfig = {
  embeddingModel: 'all-MiniLM-L6-v2',
  similarityThreshold: 0.75,
  theme: 'light',
  defaultExportFormat: 'html',
  enableBatchVectorization: true,
  enableSentenceCaching: true,
  maxWorkerThreads: 4,
};
