'use client';

import * as React from 'react';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { ScanHistoryItem } from '@/types/scanner';
import { FileText, ExternalLink, Download, MoreHorizontal, Filter } from 'lucide-react';

export interface RecentAuditsTableProps {
  onSelectScan?: (scanId: string) => void;
}

const SAMPLE_AUDITS: ScanHistoryItem[] = [
  {
    id: 'scan-9021',
    timestamp: '2026-08-04 18:45:12',
    question: 'What is the capital of France and its primary GDP contributors?',
    total_sentences: 7,
    faithfulness_score: 85.7,
    status: 'SUPPORTED',
  },
  {
    id: 'scan-9020',
    timestamp: '2026-08-04 17:30:05',
    question: 'Explain quantum computing encryption key distribution security.',
    total_sentences: 12,
    faithfulness_score: 58.3,
    status: 'POTENTIALLY_UNSUPPORTED',
  },
  {
    id: 'scan-9019',
    timestamp: '2026-08-04 16:15:40',
    question: 'List the medical side effects of acetaminophen in clinical trials.',
    total_sentences: 5,
    faithfulness_score: 100.0,
    status: 'SUPPORTED',
  },
  {
    id: 'scan-9018',
    timestamp: '2026-08-04 14:02:11',
    question: 'What are the main architectural layers of Next.js 14 App Router?',
    total_sentences: 8,
    faithfulness_score: 92.5,
    status: 'SUPPORTED',
  },
];

export function RecentAuditsTable({ onSelectScan }: RecentAuditsTableProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'SUPPORTED' | 'POTENTIALLY_UNSUPPORTED'>('ALL');

  const filteredData = React.useMemo(() => {
    return SAMPLE_AUDITS.filter((item) => {
      const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const columns: Column<ScanHistoryItem>[] = [
    {
      key: 'id',
      header: 'Scan ID',
      width: '120px',
      accessor: (row) => <span className="font-mono text-xs font-bold text-aegis-primary">{row.id}</span>,
      sortable: true,
    },
    {
      key: 'question',
      header: 'Evaluated Prompt / Question',
      accessor: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-aegis-text truncate">{row.question}</p>
          <p className="text-[11px] text-aegis-muted">{row.total_sentences} Sentences Analyzed</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Audit Status',
      align: 'center',
      width: '180px',
      accessor: (row) => (
        <Badge variant={row.status === 'SUPPORTED' ? 'supported' : 'unsupported'}>
          {row.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'faithfulness_score',
      header: 'Faithfulness',
      align: 'right',
      width: '120px',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-aegis-text">
          {row.faithfulness_score.toFixed(1)}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      width: '180px',
      accessor: (row) => <span className="text-xs text-aegis-muted font-mono">{row.timestamp}</span>,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      width: '80px',
      accessor: (row) => (
        <Dropdown
          trigger={
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'View Dashboard',
              icon: <ExternalLink className="w-3.5 h-3.5" />,
              onClick: () => onSelectScan && onSelectScan(row.id),
            },
            {
              label: 'Export HTML Report',
              icon: <FileText className="w-3.5 h-3.5" />,
              onClick: () => {},
            },
            {
              label: 'Export JSON',
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: () => {},
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Table Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt or scan ID..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-aegis-muted" />
          <div className="inline-flex rounded-small border border-aegis-border bg-aegis-surface p-0.5 text-xs">
            {(['ALL', 'SUPPORTED', 'POTENTIALLY_UNSUPPORTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 font-medium rounded-small transition-colors ${
                  statusFilter === status
                    ? 'bg-aegis-primary text-white shadow-2xs'
                    : 'text-aegis-muted hover:text-aegis-text'
                }`}
              >
                {status === 'ALL' ? 'All Audits' : status === 'SUPPORTED' ? 'Supported' : 'Unsupported'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Audit History Table */}
      <Table
        columns={columns}
        data={filteredData}
        emptyTitle="No audit records match your query"
        emptyDescription="Try clearing search keywords or switching status filter tabs."
        onRowClick={(row) => onSelectScan && onSelectScan(row.id)}
      />
    </div>
  );
}
