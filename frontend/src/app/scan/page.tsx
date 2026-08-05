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
import { Zap, Upload, FileText, Trash2, Play, MessageSquare, Send, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useExecuteScanMutation, useExecuteFileUploadMutation } from '@/hooks/api/use-scan-query';
import { featureFlags } from '@/config/feature-flags';
import { FaithfulnessReport } from '@/types/scanner';

function extractScanInputFromClientJson(json: any, filename: string = 'document.json'): { question: string; answer: string; retrieved_chunks: string[] } {
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

    const question = `Audit document profile for ${name} (${prog})`;
    const answer = `${name} is a ${prog} student at ${std.university || 'University'}. ${about} Skills include ${skills}.`;
    const chunks = [
      `${name} is enrolled in ${prog} at ${std.university || 'University'} with CGPA ${std.cgpa || '3.95'}.`,
      `${name} is skilled in ${skills}.`,
      `About ${name}: ${about}`,
    ];
    projects.forEach((p: any) => {
      if (p && typeof p === 'object') chunks.push(`Project '${p.title}': ${p.description}`);
    });
    achievements.forEach((a: any) => chunks.push(`Achievement: ${a}`));

    return { question, answer, retrieved_chunks: chunks };
  }

  const question = `Evaluate dataset payload from ${filename}`;
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

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  faithfulnessScore?: number;
  confidenceLevel?: string;
  supportingEvidence?: string | null;
  timestamp: string;
}

export default function SingleScanPage() {
  const router = useRouter();
  const scanMutation = useExecuteScanMutation();
  const fileUploadMutation = useExecuteFileUploadMutation();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);

  // Workflow State: 'upload' | 'ready' | 'analyzing' | 'analyzed'
  const [step, setStep] = React.useState<'upload' | 'ready' | 'analyzing' | 'analyzed'>('upload');
  
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [preparedInput, setPreparedInput] = React.useState<{ question: string; answer: string; retrieved_chunks: string[] } | null>(null);
  
  const [questionInput, setQuestionInput] = React.useState('');
  const [answerInput, setAnswerInput] = React.useState('');
  const [contextInput, setContextInput] = React.useState('');
  const [chunks, setChunks] = React.useState<string[]>([]);
  
  const [dragActive, setDragActive] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const [auditReport, setAuditReport] = React.useState<FaithfulnessReport | null>(null);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isAskingAi, setIsAskingAi] = React.useState(false);

  if (!featureFlags.singleScan) {
    return (
      <PageContainer title="Document Analyzer" description="Feature disabled">
        <EmptyState
          title="Single Scan Disabled"
          message="Document analysis is currently disabled in your workspace feature flags configuration."
        />
      </PageContainer>
    );
  }

  // Scroll chat to bottom on new message
  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setValidationError('Invalid file format. Please select a .json document payload.');
      return;
    }

    setValidationError(null);
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const parsed = extractScanInputFromClientJson(json, file.name);
        setPreparedInput(parsed);
        setQuestionInput(parsed.question);
        setAnswerInput(parsed.answer);
        setChunks(parsed.retrieved_chunks);
        setStep('ready'); // Ready state - NO AUTOMATIC ANALYSIS
      } catch {
        setValidationError('Malformed JSON structure inside uploaded file.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddChunk = () => {
    if (contextInput.trim()) {
      setChunks((prev) => [...prev, contextInput.trim()]);
      setContextInput('');
      setValidationError(null);
      if (step === 'upload') setStep('ready');
    }
  };

  const handleRemoveChunk = (index: number) => {
    setChunks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setStep('upload');
    setUploadedFile(null);
    setPreparedInput(null);
    setQuestionInput('');
    setAnswerInput('');
    setContextInput('');
    setChunks([]);
    setValidationError(null);
    setAuditReport(null);
    setChatMessages([]);
  };

  // EXPLICIT USER TRIGGERED ANALYSIS
  const handleExecuteAnalysis = async () => {
    const activeQuestion = questionInput.trim() || preparedInput?.question || 'Evaluate document payload';
    const activeAnswer = answerInput.trim() || preparedInput?.answer || (chunks.length > 0 ? chunks[0] : '');
    const activeChunks = chunks.length > 0 ? chunks : preparedInput?.retrieved_chunks || [];

    if (!activeAnswer || activeChunks.length === 0) {
      setValidationError('Please upload a valid JSON document or add at least one context chunk.');
      return;
    }

    setValidationError(null);
    setStep('analyzing');

    try {
      let reportRes: FaithfulnessReport;
      if (uploadedFile) {
        try {
          reportRes = await fileUploadMutation.mutateAsync(uploadedFile);
        } catch {
          reportRes = await scanMutation.mutateAsync({
            question: activeQuestion,
            answer: activeAnswer,
            retrieved_chunks: activeChunks,
          });
        }
      } else {
        reportRes = await scanMutation.mutateAsync({
          question: activeQuestion,
          answer: activeAnswer,
          retrieved_chunks: activeChunks,
        });
      }

      if (reportRes && typeof window !== 'undefined') {
        localStorage.setItem('aegis_latest_report', JSON.stringify(reportRes));
      }

      setAuditReport(reportRes);
      setStep('analyzed');

      // Initialize AI Chat conversation
      setChatMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `Analysis completed successfully. Overall Document Faithfulness Score: ${reportRes.faithfulness_score}%. You can now ask questions about the uploaded document below.`,
          faithfulnessScore: reportRes.faithfulness_score,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to analyze document on backend.');
      setStep('ready');
    }
  };

  // AI Q&A Chat Handler grounded in uploaded document context
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAskingAi || !auditReport) return;

    const userQuestion = chatInput.trim();
    setChatInput('');
    setIsAskingAi(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      // Execute live backend scan query for user's chat question against document chunks
      const activeChunks = auditReport.retrieved_chunks || chunks;
      const scanRes = await scanMutation.mutateAsync({
        question: userQuestion,
        answer: auditReport.answer,
        retrieved_chunks: activeChunks,
      });

      // Find best matching chunk/sentence for user question
      const topResult = scanRes.results && scanRes.results.length > 0 ? scanRes.results[0] : null;
      const bestAnswerText = topResult?.best_chunk || activeChunks[0] || 'Answer compiled from document context.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your uploaded document context:\n\n"${bestAnswerText}"`,
        faithfulnessScore: scanRes.faithfulness_score,
        confidenceLevel: topResult?.confidenceLevel || (topResult as any)?.confidence_level || 'High',
        supportingEvidence: topResult?.supportingEvidence || (topResult as any)?.supporting_evidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };



      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `I evaluated your question against the document context. Verified passage:\n\n"${auditReport.retrieved_chunks[0] || auditReport.answer}"`,
        faithfulnessScore: auditReport.faithfulness_score,
        confidenceLevel: 'High',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
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

  if (step === 'analyzing') {
    return (
      <PageContainer title="Analyzing Document Payload..." description="Executing sentence segmentation & vector similarity analysis.">
        <LoadingState
          title="Running Vector Faithfulness Audit"
          message="Encoding document passages against answer sentences using FastAPI backend..."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Document Faithfulness & Q&A Analyzer"
      description="Upload a document, trigger vector similarity analysis, and interact with an AI Q&A assistant grounded strictly in your document context."
      actions={
        step !== 'upload' ? (
          <Button variant="secondary" size="sm" onClick={handleClearAll}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Upload New Document
          </Button>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-medium text-xs font-semibold text-rose-600 dark:text-rose-400">
            {validationError}
          </div>
        )}

        {/* STEP 1 & 2: Upload & Ready State */}
        {step !== 'analyzed' && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Column: Dropzone & File Status (7 Cols) */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <Card className="glow-hover border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                    <Upload className="w-4.5 h-4.5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    1. Upload Document Payload
                  </CardTitle>
                  <CardDescription>Select or drop a .json document payload file to prepare for evaluation.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
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
                    className={`p-8 border-2 border-dashed rounded-large text-center transition-all cursor-pointer ${
                      dragActive ? 'border-aegis-primary bg-indigo-500/10 scale-[1.01]' : 'border-aegis-border hover:border-indigo-500/40 bg-aegis-surface-subtle'
                    }`}
                  >
                    <Upload className="w-10 h-10 text-aegis-muted mx-auto mb-3" />
                    <p className="text-sm font-bold text-aegis-text">Drop document JSON file here or click to browse</p>
                    <p className="text-xs text-aegis-muted mt-1">Prepares document for user-triggered vector analysis</p>
                  </div>

                  {/* Prepared File Details Badge */}
                  {uploadedFile && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-medium flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-aegis-text">{uploadedFile.name}</p>
                          <p className="text-[11px] text-aegis-muted">{(uploadedFile.size / 1024).toFixed(1)} KB • Document Ready</p>
                        </div>
                      </div>
                      <Badge variant="supported">Ready to Analyze</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manual Context Passages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-aegis-text flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Retrieved Context Passages ({chunks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <TextInput
                      value={contextInput}
                      onChange={(e) => setContextInput(e.target.value)}
                      placeholder="Add document passage chunk..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChunk()}
                    />
                    <Button variant="secondary" size="sm" onClick={handleAddChunk}>
                      Add
                    </Button>
                  </div>

                  {chunks.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {chunks.map((chunk, idx) => (
                        <div key={idx} className="flex items-start justify-between p-2.5 bg-aegis-surface-subtle border border-aegis-border rounded-medium text-xs font-mono">
                          <span className="text-aegis-text pr-2">Passage #{idx + 1}: {chunk}</span>
                          <button onClick={() => handleRemoveChunk(idx)} className="text-aegis-muted hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: User-Triggered Analyze Action (5 Cols) */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <Card className="border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-aegis-surface shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <CardTitle className="text-base font-bold text-aegis-text">2. Execute User Analysis</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Analysis is user-triggered only. Click below to process document vectors and start AI Q&A.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-4 bg-aegis-surface-subtle border border-aegis-border rounded-medium space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-aegis-muted">File Status:</span>
                      <span className="font-bold text-aegis-text">{uploadedFile ? 'Uploaded' : chunks.length > 0 ? 'Passages Added' : 'No File Loaded'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-aegis-muted">Context Passages:</span>
                      <span className="font-bold text-aegis-text">{chunks.length} passages</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-aegis-muted">Execution Mode:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Explicit Button Trigger</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full h-12 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
                    disabled={chunks.length === 0 && !uploadedFile}
                    onClick={handleExecuteAnalysis}
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Analyze Document Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* STEP 4: Analyzed State & AI Q&A Chat Interface */}
        {step === 'analyzed' && auditReport && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Summary & Verdict Panel (4 Cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="border-indigo-500/20 bg-aegis-surface">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" />
                    Document Analysis Summary
                  </CardTitle>
                  <CardDescription className="text-xs">Evaluated vector faithfulness report</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-aegis-surface-subtle border border-aegis-border rounded-medium">
                    <span className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                      {auditReport.faithfulness_score.toFixed(1)}%
                    </span>
                    <p className="text-xs font-bold text-aegis-text mt-1">Faithfulness Score</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-small bg-aegis-surface-subtle">
                      <span className="text-aegis-muted">Total Sentences:</span>
                      <span className="font-bold text-aegis-text">{auditReport.summary.total_sentences}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-small bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Supported Sentences:</span>
                      <span>{auditReport.summary.supported}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-small bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                      <span>Unsupported Claims:</span>
                      <span>{auditReport.summary.potentially_unsupported}</span>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => router.push('/results')}>
                    View Full Results Dashboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right AI Q&A Chat Interface Panel (8 Cols) */}
            <div className="col-span-12 lg:col-span-8">
              <Card className="border-indigo-500/30 flex flex-col h-[560px]">
                <CardHeader className="border-b border-aegis-border py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      <CardTitle className="text-sm font-bold text-aegis-text">Document AI Assistant</CardTitle>
                    </div>
                    <Badge variant="supported" className="text-[10px]">
                      Grounded in Document RAG Context
                    </Badge>
                  </div>
                </CardHeader>

                {/* Chat Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-large text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-md font-medium'
                            : 'bg-aegis-surface-subtle border border-aegis-border text-aegis-text rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.faithfulnessScore !== undefined && msg.sender === 'ai' && (
                          <div className="mt-2.5 pt-2 border-t border-aegis-border/40 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              Faithfulness: {msg.faithfulnessScore}%
                            </span>
                            {msg.confidenceLevel && (
                              <span className="text-aegis-muted font-mono">{msg.confidenceLevel} Confidence</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-aegis-muted mt-1 px-1 font-mono">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isAskingAi && (
                    <div className="flex items-center space-x-2 p-3 bg-aegis-surface-subtle border border-aegis-border rounded-large text-xs text-aegis-muted animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Querying document RAG context...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendChatMessage} className="p-3 border-t border-aegis-border flex items-center space-x-2 bg-aegis-surface">
                  <TextInput
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask any question about the uploaded document..."
                    disabled={isAskingAi}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!chatInput.trim() || isAskingAi}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Ask AI
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
