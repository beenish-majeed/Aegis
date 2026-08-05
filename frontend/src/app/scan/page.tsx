'use client';

export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/states/loading-state';
import { ErrorState } from '@/components/ui/states/error-state';
import { EmptyState } from '@/components/ui/states/empty-state';
import { Zap, Upload, FileText, Trash2, Play, Sparkles } from 'lucide-react';
import { useExecuteScanMutation } from '@/hooks/api/use-scan-query';
import { featureFlags } from '@/config/feature-flags';

export default function SingleScanPage() {
  const router = useRouter();
  const scanMutation = useExecuteScanMutation();

  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [contextInput, setContextInput] = React.useState('');
  const [chunks, setChunks] = React.useState<string[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  if (!featureFlags.singleScan) {
    return (
      <PageContainer title="Single Scan Analyzer" description="Feature disabled">
        <EmptyState
          title="Single Scan Disabled"
          message="Single scan analysis is currently disabled in your workspace feature flags configuration."
        />
      </PageContainer>
    );
  }

  const handleAddChunk = () => {
    if (contextInput.trim()) {
      setChunks((prev) => [...prev, contextInput.trim()]);
      setContextInput('');
      setValidationError(null);
    }
  };

  const handleRemoveChunk = (index: number) => {
    setChunks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadSample = () => {
    setQuestion('What is the capital of France and its currency?');
    setAnswer('Paris is the capital of France. The city currency is the Euro. The Eiffel tower was built in 1642 by Louis XIV.');
    setChunks([
      'Paris is the capital and largest city of France.',
      'The official currency of France and the Eurozone is the Euro (€).',
      'Construction of the Eiffel Tower began in 1887 and completed in 1889.',
    ]);
    setValidationError(null);
  };

  const handleClearAll = () => {
    setQuestion('');
    setAnswer('');
    setContextInput('');
    setChunks([]);
    setValidationError(null);
  };

  const handleExecuteScan = async () => {
    if (!question.trim()) {
      setValidationError('Please enter a valid user question/prompt.');
      return;
    }
    if (!answer.trim()) {
      setValidationError('Please enter a valid generated model answer payload.');
      return;
    }
    if (chunks.length === 0) {
      setValidationError('Please add at least one retrieved context chunk.');
      return;
    }

    setValidationError(null);
    try {
      await scanMutation.mutateAsync({
        question,
        answer,
        retrieved_chunks: chunks,
      });
      router.push('/results');
    } catch {
      // Fallback transition to results view
      router.push('/results');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.json')) {
        setValidationError('Invalid file type. Please upload a .json file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.question) setQuestion(json.question);
          if (json.answer) setAnswer(json.answer);
          if (Array.isArray(json.retrieved_chunks)) setChunks(json.retrieved_chunks);
          setValidationError(null);
        } catch {
          setValidationError('Malformed JSON structure inside uploaded file.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (scanMutation.isPending) {
    return (
      <PageContainer title="Scanning Faithfulness Payload..." description="Running vector embedding alignment & similarity analysis.">
        <LoadingState
          title="Executing Faithfulness Audit"
          message="Encoding answer sentences against retrieved context vectors using all-MiniLM-L6-v2..."
        />
      </PageContainer>
    );
  }

  if (scanMutation.isError) {
    return (
      <PageContainer title="Single Scan Analyzer" description="Audit execution error">
        <ErrorState
          title="Failed to Execute Faithfulness Audit"
          message={scanMutation.error?.message || 'An API error occurred during sentence encoding.'}
          onRetry={handleExecuteScan}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Single Scan Analyzer"
      description="Input a question, generated answer payload, and retrieved context chunks to perform live RAG faithfulness auditing."
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleLoadSample}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Load Sample Payload
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClearAll}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Inputs Section (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-medium text-xs font-semibold text-rose-800">
              {validationError}
            </div>
          )}

          {/* Question & Answer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                <Zap className="w-4 h-4 mr-2 text-aegis-primary" />
                Prompt & RAG Answer Payload
              </CardTitle>
              <CardDescription>Input the user prompt question and generated model answer text.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-aegis-muted uppercase tracking-wider block mb-1.5">
                  User Question / Prompt
                </label>
                <TextInput
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g., What is the capital of France and its currency?"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-aegis-muted uppercase tracking-wider">
                    Generated Model Answer
                  </label>
                  <span className="text-[11px] text-aegis-muted font-mono">{answer.length} characters</span>
                </div>
                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  rows={4}
                  placeholder="Paste the LLM answer payload to evaluate for hallucinated or unsupported claims..."
                  className="w-full p-3 rounded-small border border-aegis-border bg-aegis-background text-xs font-mono text-aegis-text placeholder:text-aegis-muted focus:outline-none focus:ring-2 focus:ring-aegis-primary/20 focus:border-aegis-primary transition-all resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Context Chunks Input Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                    Retrieved Context Chunks ({chunks.length})
                  </CardTitle>
                  <CardDescription>Add retrieved context passages that were provided to the model.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <TextInput
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Add retrieved passage chunk..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChunk()}
                />
                <Button variant="secondary" onClick={handleAddChunk}>
                  Add Chunk
                </Button>
              </div>

              {chunks.length > 0 && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {chunks.map((chunk, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-medium text-xs group"
                    >
                      <div className="flex items-start space-x-2 pr-2">
                        <Badge variant="very-high" className="mt-0.5 font-mono">
                          Chunk #{idx + 1}
                        </Badge>
                        <p className="text-slate-700 leading-relaxed font-mono">{chunk}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveChunk(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove chunk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Action & Dropzone Sidebar (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* JSON File Dropzone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-aegis-text">Upload JSON Payload</CardTitle>
              <CardDescription className="text-[11px]">Drag & drop an Aegis scan input JSON file</CardDescription>
            </CardHeader>

            <CardContent>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-large text-center transition-colors cursor-pointer ${
                  dragActive ? 'border-aegis-primary bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-aegis-text">Drop scan.json file here</p>
                <p className="text-[11px] text-aegis-muted mt-1">Supports standard JSON with question, answer & chunks</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Trigger Card */}
          <Card className="bg-slate-900 text-white border-slate-800">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold">Ready to Audit</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click analyze to segment sentences, encode vectors, and compute similarity metrics.
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                disabled={!question.trim() || !answer.trim() || chunks.length === 0}
                onClick={handleExecuteScan}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Analyze Faithfulness
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
