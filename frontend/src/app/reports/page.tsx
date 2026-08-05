'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { FileText, Download, Eye, Trash2, ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { MOCK_FAITHFULNESS_REPORT } from '@/data/dashboard/mock-report';

export default function ReportsCenterPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState('ALL');
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const mockReports = [
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

  const filteredReports = mockReports.filter(
    (rep) =>
      rep.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (format: string) => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <PageContainer
      title="Reports & Export Center"
      description="Manage, preview, and export high-fidelity HTML, JSON, or text audit reports for compliance and model evaluation."
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-aegis-text">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-aegis-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Report ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Evaluated Question</th>
                    <th className="py-3 px-4">Faithfulness</th>
                    <th className="py-3 px-4">Claims Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-aegis-primary">{report.id}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{report.date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">{report.question}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600">{report.faithfulnessScore}%</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={report.unsupportedCount === 0 ? 'supported' : 'unsupported'}>
                          {report.unsupportedCount} Unsupported
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setPreviewModalOpen(true)} className="h-7 px-2">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleDownload('json')} className="h-7 px-2">
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
          </CardContent>
        </Card>

        {/* Report Preview Modal */}
        <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title="Audit Report Preview — scan-9021">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-medium border border-slate-200">
              <span className="font-bold text-aegis-muted uppercase tracking-wider block text-[10px]">Evaluated Prompt</span>
              <p className="font-semibold text-aegis-text mt-0.5">{MOCK_FAITHFULNESS_REPORT.question}</p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-medium flex items-center justify-between">
              <span className="font-bold text-emerald-900">Faithfulness Score</span>
              <span className="font-mono text-base font-black text-emerald-700">{MOCK_FAITHFULNESS_REPORT.faithfulness_score}%</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setPreviewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => handleDownload('json')}>
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
