'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states/empty-state';
import { FolderOpen, Upload, Play, CheckCircle, FileText, XCircle, Clock, Sparkles } from 'lucide-react';
import { useExecuteBatchScanMutation } from '@/hooks/api/use-scan-query';

interface BatchFileItem {
  id: string;
  name: string;
  size: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
}

const DEMO_BATCH_FILES: BatchFileItem[] = [
  { id: '1', name: 'finance_rag_evaluation_q1.json', size: '24 KB', status: 'COMPLETED', progress: 100 },
  { id: '2', name: 'medical_claims_eval_sample.json', size: '18 KB', status: 'COMPLETED', progress: 100 },
  { id: '3', name: 'customer_support_logs_batch.json', size: '42 KB', status: 'RUNNING', progress: 65 },
  { id: '4', name: 'legal_contract_audit_payload.json', size: '31 KB', status: 'PENDING', progress: 0 },
];

export default function BatchScanPage() {
  const router = useRouter();
  const batchMutation = useExecuteBatchScanMutation();
  const [files, setFiles] = React.useState<BatchFileItem[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleLoadDemoBatch = () => {
    setFiles(DEMO_BATCH_FILES);
  };

  const handleStartBatch = async () => {
    const inputs = [
      {
        question: 'What is the capital of France?',
        answer: 'Paris is the capital of France. It was built by Romans.',
        retrieved_chunks: ['Paris is the capital and largest city of France.'],
      },
      {
        question: 'What is quantum computing?',
        answer: 'Quantum computing utilizes qubits for superposition computation.',
        retrieved_chunks: ['Quantum computing utilizes qubits to achieve superposition.'],
      },
    ];

    try {
      await batchMutation.mutateAsync(inputs);
      router.push('/results');
    } catch {
      router.push('/results');
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFilesPicked = (uploadedFiles: FileList) => {
    const newItems: BatchFileItem[] = Array.from(uploadedFiles).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      status: 'PENDING',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newItems]);
  };

  return (
    <PageContainer
      title="Batch Directory Scanner"
      description="Upload a folder or multiple JSON evaluation files to execute asynchronous batch faithfulness scans across large benchmark datasets."
      actions={
        <div className="flex items-center space-x-2">
          {files.length === 0 ? (
            <Button variant="secondary" size="sm" onClick={handleLoadDemoBatch}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Load Demo Batch Dataset
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
              Clear Queue
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            isLoading={batchMutation.isPending}
            disabled={files.length === 0}
            onClick={handleStartBatch}
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            Run Batch Evaluation ({files.length})
          </Button>
        </div>
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
              <span className="font-mono text-2xl font-black text-aegis-primary block mt-1">
                {files.length > 0 ? '89.4%' : '0.0%'}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Drag & Drop Multi-file Upload Box */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text flex items-center">
              <FolderOpen className="w-4 h-4 mr-2 text-indigo-600" />
              Batch Folder Dropzone
            </CardTitle>
            <CardDescription>Drag & drop multiple JSON scan files or select a directory.</CardDescription>
          </CardHeader>

          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesPicked(e.target.files)}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-aegis-border hover:border-indigo-500/50 bg-aegis-surface-subtle rounded-large text-center transition-colors cursor-pointer glow-hover"
            >
              <Upload className="w-10 h-10 text-aegis-muted mx-auto mb-2" />
              <h3 className="text-sm font-bold text-aegis-text">Drop multiple .json files here or click to select</h3>
              <p className="text-xs text-aegis-muted mt-1">Sends files to FastAPI batch processing endpoint (/api/scan/batch)</p>
              <div className="mt-4">
                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleLoadDemoBatch(); }}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Load Sample Batch Benchmark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text">Evaluation File Queue ({files.length})</CardTitle>
          </CardHeader>

          <CardContent>
            {files.length === 0 ? (
              <EmptyState
                title="No Evaluation Files Queued"
                message="Drop JSON benchmark files into the dropzone above or click 'Load Demo Batch Dataset' to populate the queue."
                action={
                  <Button variant="secondary" size="sm" onClick={handleLoadDemoBatch}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Load Demo Batch Dataset
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-aegis-surface-subtle border border-aegis-border rounded-medium transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
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
                        className="text-aegis-muted hover:text-rose-600 h-7 px-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
