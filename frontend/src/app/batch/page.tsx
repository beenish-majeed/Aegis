'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Upload, Play, CheckCircle, FileText, XCircle, Clock } from 'lucide-react';

interface BatchFileItem {
  id: string;
  name: string;
  size: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
}

export default function BatchScanPage() {
  const router = useRouter();
  const [files, setFiles] = React.useState<BatchFileItem[]>([
    { id: '1', name: 'finance_rag_evaluation_q1.json', size: '24 KB', status: 'COMPLETED', progress: 100 },
    { id: '2', name: 'medical_claims_eval_sample.json', size: '18 KB', status: 'COMPLETED', progress: 100 },
    { id: '3', name: 'customer_support_logs_batch.json', size: '42 KB', status: 'RUNNING', progress: 65 },
    { id: '4', name: 'legal_contract_audit_payload.json', size: '31 KB', status: 'PENDING', progress: 0 },
  ]);

  const [isExecuting, setIsExecuting] = React.useState(false);

  const handleStartBatch = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      router.push('/results');
    }, 2000);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <PageContainer
      title="Batch Directory Scanner"
      description="Upload a folder or multiple JSON evaluation files to execute asynchronous batch faithfulness scans across large benchmark datasets."
      actions={
        <Button
          variant="primary"
          isLoading={isExecuting}
          disabled={files.length === 0}
          onClick={handleStartBatch}
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          Run Batch Evaluation ({files.length})
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Batch Overview Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-5">
              <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider block">Total Files Queue</span>
              <span className="font-mono text-2xl font-black text-aegis-text block mt-1">{files.length} Files</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider block">Completed Scans</span>
              <span className="font-mono text-2xl font-black text-emerald-600 block mt-1">
                {files.filter((f) => f.status === 'COMPLETED').length}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider block">In Progress</span>
              <span className="font-mono text-2xl font-black text-amber-600 block mt-1">
                {files.filter((f) => f.status === 'RUNNING').length}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider block">Avg Faithfulness</span>
              <span className="font-mono text-2xl font-black text-aegis-primary block mt-1">89.4%</span>
            </CardContent>
          </Card>
        </div>

        {/* Drag & Drop Multi-file Upload Box */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text flex items-center">
              <FolderOpen className="w-4 h-4 mr-2 text-aegis-primary" />
              Batch Folder Dropzone
            </CardTitle>
            <CardDescription>Drag & drop multiple JSON scan files or select a directory.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="p-8 border-2 border-dashed border-slate-300 hover:border-aegis-primary bg-slate-50/50 rounded-large text-center transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-aegis-text">Drop multiple .json files here</h3>
              <p className="text-xs text-aegis-muted mt-1">Supports multi-file evaluation benchmarks up to 500 JSON files per batch scan.</p>
            </div>
          </CardContent>
        </Card>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text">Evaluation File Queue ({files.length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-medium transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-aegis-text">{file.name}</p>
                      <span className="text-[11px] text-aegis-muted font-mono">{file.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status Badge */}
                    <div className="flex items-center space-x-2">
                      {file.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {file.status === 'RUNNING' && <Clock className="w-4 h-4 text-amber-600 animate-spin" />}
                      {file.status === 'FAILED' && <XCircle className="w-4 h-4 text-rose-600" />}
                      <Badge
                        variant={
                          file.status === 'COMPLETED'
                            ? 'supported'
                            : file.status === 'RUNNING'
                            ? 'medium'
                            : 'very-high'
                        }
                      >
                        {file.status}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-400 hover:text-rose-600 h-7 px-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
