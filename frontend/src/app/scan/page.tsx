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
import { EmptyState } from '@/components/ui/states/empty-state';
import { Zap, Upload, FileText, Trash2, Play, Sparkles } from 'lucide-react';
import { useExecuteScanMutation, useExecuteFileUploadMutation } from '@/hooks/api/use-scan-query';
import { featureFlags } from '@/config/feature-flags';

function extractScanInputFromClientJson(json: any): { question: string; answer: string; retrieved_chunks: string[] } {
  if (json.question && json.answer) {
    const chunks = Array.isArray(json.retrieved_chunks) ? json.retrieved_chunks.map(String) : [String(json.retrieved_chunks || '')];
    return { question: String(json.question), answer: String(json.answer), retrieved_chunks: chunks };
  }

  if (json.student && typeof json.student === 'object') {
    const std = json.student;
    const name = std.name || 'Student';
    const prog = std.program || 'Computer Science';
    const about = std.about || '';
    const skills = Array.isArray(std.skills) ? std.skills.join(', ') : '';
    const projects = Array.isArray(std.projects) ? std.projects : [];
    const achievements = Array.isArray(std.achievements) ? std.achievements : [];

    const question = `Audit academic profile and project faithfulness for ${name} (${prog})`;
    const answer = `${name} is a ${prog} student at ${std.university || 'University'}. ${about} Skills include ${skills}.`;
    const chunks = [
      `${name} is a student enrolled in ${prog} at ${std.university || 'University'} with CGPA ${std.cgpa || '3.95'}.`,
      `${name} is skilled in ${skills}.`,
      `About ${name}: ${about}`,
    ];
    projects.forEach((p: any) => {
      if (p && typeof p === 'object') chunks.push(`Project '${p.title}': ${p.description}`);
    });
    achievements.forEach((a: any) => chunks.push(`Achievement: ${a}`));

    return { question, answer, retrieved_chunks: chunks };
  }

  const question = 'Evaluate dataset payload';
  const chunks: string[] = [];
  const answerParts: string[] = [];

  Object.entries(json).forEach(([k, v]) => {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      answerParts.push(`${k}: ${v}`);
      chunks.push(`${k} is ${v}.`);
    } else if (Array.isArray(v)) {
      answerParts.push(`${k}: ${v.map(String).join(', ')}`);
      chunks.push(`${k} list contains ${v.length} items.`);
    }
  });

  const answer = answerParts.join(' ') || JSON.stringify(json);
  return { question, answer, retrieved_chunks: chunks.length > 0 ? chunks : [JSON.stringify(json)] };
}

export default function SingleScanPage() {
  const router = useRouter();
  const scanMutation = useExecuteScanMutation();
  const fileUploadMutation = useExecuteFileUploadMutation();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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
      const res = await scanMutation.mutateAsync({
        question,
        answer,
        retrieved_chunks: chunks,
      });
      if (res && typeof window !== 'undefined') {
        localStorage.setItem('aegis_latest_report', JSON.stringify(res));
      }
      router.push('/results');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to execute scan on backend.');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setValidationError('Invalid file type. Please upload a .json file.');
      return;
    }

    setValidationError(null);
    try {
      const res = await fileUploadMutation.mutateAsync(file);
      if (res && typeof window !== 'undefined') {
        localStorage.setItem('aegis_latest_report', JSON.stringify(res));
      }
      router.push('/results');
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const parsedInput = extractScanInputFromClientJson(json);
          const fallbackRes = await scanMutation.mutateAsync(parsedInput);
          if (fallbackRes && typeof window !== 'undefined') {
            localStorage.setItem('aegis_latest_report', JSON.stringify(fallbackRes));
          }
          router.push('/results');
        } catch {
          setValidationError('Malformed JSON structure inside uploaded file.');
        }
      };
      reader.readAsText(file);
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const isPending = scanMutation.isPending || fileUploadMutation.isPending;

  if (isPending) {
    return (
      <PageContainer title="Scanning Faithfulness Payload..." description="Running vector embedding alignment & similarity analysis.">
        <LoadingState
          title="Executing Faithfulness Audit"
          message="Encoding answer sentences against retrieved context vectors using FastAPI backend..."
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
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-medium text-xs font-semibold text-rose-600 dark:text-rose-400">
              {validationError}
            </div>
          )}

          {/* Question & Answer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                <Zap className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
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
                    <FileText className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
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
                      className="flex items-start justify-between p-3 bg-aegis-surface-subtle border border-aegis-border rounded-medium text-xs group"
                    >
                      <div className="flex items-start space-x-2 pr-2">
                        <Badge variant="very-high" className="mt-0.5 font-mono">
                          Chunk #{idx + 1}
                        </Badge>
                        <p className="text-aegis-text leading-relaxed font-mono">{chunk}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveChunk(idx)}
                        className="text-aegis-muted hover:text-rose-600 transition-colors p-1"
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-large text-center transition-colors cursor-pointer ${
                  dragActive ? 'border-aegis-primary bg-indigo-500/10' : 'border-aegis-border hover:border-indigo-500/40 bg-aegis-surface-subtle'
                }`}
              >
                <Upload className="w-8 h-8 text-aegis-muted mx-auto mb-2" />
                <p className="text-xs font-bold text-aegis-text">Drop scan.json file here or click to browse</p>
                <p className="text-[11px] text-aegis-muted mt-1">Sends file directly to FastAPI backend endpoint</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Trigger Card */}
          <Card className="bg-aegis-surface border-indigo-500/30 glow-hover">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-aegis-text">Ready to Audit</h3>
                <p className="text-xs text-aegis-muted mt-0.5">
                  Click analyze to segment sentences, encode vectors, and compute similarity metrics.
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25"
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
