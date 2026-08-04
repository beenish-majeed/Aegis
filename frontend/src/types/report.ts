export type ExportFormat = 'json' | 'html' | 'text' | 'csv';

export interface ReportExportOptions {
  format: ExportFormat;
  includeEmbeddings: boolean;
  includeSupportingEvidence: boolean;
  includeUnsupportedReasons: boolean;
  includeConfidenceLevels: boolean;
}

export interface ReportPreviewData {
  format: ExportFormat;
  content: string;
  filename: string;
}
