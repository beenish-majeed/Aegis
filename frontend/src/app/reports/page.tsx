'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/states/empty-state';
import { FileText, Download, Eye, Check, Sparkles } from 'lucide-react';
import { MOCK_FAITHFULNESS_REPORT } from '@/data/dashboard/mock-report';
import { reportService } from '@/services/report.service';

const DEMO_REPORTS = [
  {
    id: 'scan-9021',
    date: '2026-08-04 18:45:12',
    question: 'What is the capital of France and its GDP?',
    faithfulnessScore: 85.7,
    status: 'GOOD',
    unsupportedCount: 4,
    totalSentences: 28,
  },
  {
    id: 'scan-9020',
    date: '2026-08-04 14:12:08',
    question: 'Explain quantum computing algorithms and security.',
    faithfulnessScore: 96.4,
    status: 'EXCELLENT',
    unsupportedCount: 1,
    totalSentences: 32,
  },
  {
    id: 'scan-9019',
    date: '2026-08-03 22:04:45',
    question: 'What are the interest rates for 30 year mortgages?',
    faithfulnessScore: 68.2,
    status: 'WARNING',
    unsupportedCount: 9,
    totalSentences: 22,
  },
];

export default function ReportsCenterPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState('ALL');
  const [reports, setReports] = React.useState<typeof DEMO_REPORTS>([]);
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);
  const [selectedReportId, setSelectedReportId] = React.useState<string>('scan-9021');
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const filteredReports = reports.filter(
    (rep) =>
      rep.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (reportId: string, format: 'json' | 'html' | 'text') => {
    try {
      const blob = await reportService.exportReport(reportId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}_report.${format === 'html' ? 'html' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch {
      // Direct client fallback
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MOCK_FAITHFULNESS_REPORT, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${reportId}_report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }
  };

  return (
    <PageContainer
      title="Reports & Export Center"
      description="Manage, preview, and export high-fidelity HTML, JSON, or text audit reports for compliance and model evaluation."
      actions={
        <div className="flex items-center space-x-2">
          {reports.length === 0 ? (
            <Button variant="secondary" size="sm" onClick={() => setReports(DEMO_REPORTS)}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Load Sample Audit Reports
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setReports([])}>
              Clear Reports
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Header Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search report ID or question prompt..."
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                options={[
                  { label: 'All Report Formats', value: 'ALL' },
                  { label: 'JSON Data Format', value: 'JSON' },
                  { label: 'HTML Styled Report', value: 'HTML' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports Table Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text">Audit Reports ({filteredReports.length})</CardTitle>
            <CardDescription>Historical evaluated RAG faithfulness audit reports.</CardDescription>
          </CardHeader>

          <CardContent>
            {filteredReports.length === 0 ? (
              <EmptyState
                title="No Audit Reports Found"
                message="Execute a scan to generate an exportable report or click 'Load Sample Audit Reports' to explore sample exports."
                action={
                  <Button variant="secondary" size="sm" onClick={() => setReports(DEMO_REPORTS)}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Load Sample Audit Reports
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-aegis-text">
                  <thead className="bg-aegis-surface-subtle border-b border-aegis-border text-[11px] font-bold text-aegis-muted uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Report ID</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Evaluated Question</th>
                      <th className="py-3 px-4">Faithfulness</th>
                      <th className="py-3 px-4">Claims Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aegis-border font-medium">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-aegis-surface-hover transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{report.id}</td>
                        <td className="py-3.5 px-4 font-mono text-aegis-muted">{report.date}</td>
                        <td className="py-3.5 px-4 font-medium text-aegis-text max-w-xs truncate">{report.question}</td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{report.faithfulnessScore}%</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={report.unsupportedCount === 0 ? 'supported' : 'unsupported'}>
                            {report.unsupportedCount} Unsupported
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedReportId(report.id); setPreviewModalOpen(true); }} className="h-7 px-2">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Preview
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleDownload(report.id, 'json')} className="h-7 px-2">
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Export
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Preview Modal */}
        <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title={`Audit Report Preview — ${selectedReportId}`}>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-aegis-surface-subtle rounded-medium border border-aegis-border">
              <span className="font-bold text-aegis-muted uppercase tracking-wider block text-[10px]">Evaluated Prompt</span>
              <p className="font-semibold text-aegis-text mt-0.5">{MOCK_FAITHFULNESS_REPORT.question}</p>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-medium flex items-center justify-between">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Faithfulness Score</span>
              <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">{MOCK_FAITHFULNESS_REPORT.faithfulness_score}%</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-aegis-border">
              <Button variant="ghost" onClick={() => setPreviewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => handleDownload(selectedReportId, 'json')}>
                {downloadSuccess ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Download className="w-4 h-4 mr-1" />}
                Download JSON Report
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}
