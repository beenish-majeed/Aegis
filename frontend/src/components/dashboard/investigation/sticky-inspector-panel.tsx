'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { SentenceResult } from '@/types/scanner';

export interface StickyInspectorPanelProps {
  sentence: SentenceResult | null;
  currentIndex?: number;
  totalFindings?: number;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onClear?: () => void;
}

export const StickyInspectorPanel = React.memo(function StickyInspectorPanel({
  sentence,
  currentIndex = 1,
  totalFindings = 1,
  onNavigatePrev,
  onNavigateNext,
  onClear,
}: StickyInspectorPanelProps) {
  const [isChunkExpanded, setIsChunkExpanded] = React.useState(true);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!sentence) {
    return (
      <Card hoverEffect={false} className="sticky top-6 border border-dashed border-slate-300 bg-white/80 shadow-card">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[440px]">
          <div className="p-3.5 mb-3 bg-slate-100 rounded-full text-slate-400">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-aegis-text">No Finding Selected</h3>
          <p className="text-xs text-aegis-muted mt-1 max-w-xs leading-relaxed">
            Select a claim from the Critical Findings panel or similarity timeline to inspect evidence matches and diagnostic reasoning.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isSupported = sentence.status === 'SUPPORTED';
  const evidenceQuality = sentence.supportingEvidence
    ? 'Strong Match'
    : sentence.similarity > 0.5
    ? 'Partial Match'
    : 'No Evidence';

  const severityLevel = isSupported
    ? 'LOW'
    : sentence.similarity < 0.3
    ? 'CRITICAL'
    : 'WARNING';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sentence.sentence}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="sticky top-6"
      >
        <Card hoverEffect={false} className={`border shadow-md overflow-hidden transition-all ${isSupported ? 'border-slate-200 bg-white' : 'border-rose-200 bg-white'}`}>
          {/* Inspector Header with Finding Counter Navigation */}
          <CardHeader className={`pb-3 border-b ${isSupported ? 'border-slate-100 bg-slate-50/60' : 'border-rose-100 bg-rose-50/40'} flex flex-col space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isSupported ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <div>
                  <CardTitle className="text-sm font-bold text-aegis-text">Diagnostic Workspace</CardTitle>
                  <CardDescription className="text-[11px]">Finding {currentIndex} of {totalFindings}</CardDescription>
                </div>
              </div>

              {/* Prev / Next Finding Navigation */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!onNavigatePrev || currentIndex <= 1}
                  onClick={onNavigatePrev}
                  className="h-7 w-7 p-0"
                  aria-label="Previous finding"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono font-bold text-aegis-muted px-1">
                  {currentIndex}/{totalFindings}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!onNavigateNext || currentIndex >= totalFindings}
                  onClick={onNavigateNext}
                  className="h-7 w-7 p-0"
                  aria-label="Next finding"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Severity & Quality Badges Ribbon */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center space-x-2">
                <Badge variant={severityLevel === 'CRITICAL' ? 'unsupported' : severityLevel === 'WARNING' ? 'medium' : 'supported'}>
                  Severity: {severityLevel}
                </Badge>
                <Badge variant="very-high">Quality: {evidenceQuality}</Badge>
              </div>
              {onClear && (
                <Button variant="ghost" size="sm" onClick={onClear} className="h-6 px-2 text-[11px] text-aegis-muted hover:text-aegis-text">
                  Close
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
            {/* 1. Confidence & Similarity Metric Chips */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-medium border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Status</span>
                <Badge variant={isSupported ? 'supported' : 'unsupported'} className="mt-1">
                  {sentence.status}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Confidence</span>
                <Badge variant="very-high" className="mt-1">
                  {sentence.confidenceLevel}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Similarity</span>
                <span className="font-mono text-sm font-extrabold text-aegis-primary block mt-0.5">
                  {sentence.similarity.toFixed(4)}
                </span>
              </div>
            </div>

            {/* 2. Evaluated Claim Sentence */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1 text-aegis-primary" />
                  Evaluated Claim
                </span>
                <button
                  onClick={() => handleCopyText(sentence.sentence, 'sentence')}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title="Copy claim"
                >
                  {copiedField === 'sentence' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className={`p-3.5 rounded-medium border ${isSupported ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/40 border-rose-200'}`}>
                <p className="text-xs font-semibold text-aegis-text leading-relaxed italic">
                  "{sentence.sentence}"
                </p>
              </div>
            </div>

            {/* 3. Supporting Evidence Match */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Supporting Evidence Sentence
                </span>
                {sentence.supportingEvidence && (
                  <button
                    onClick={() => handleCopyText(sentence.supportingEvidence || '', 'evidence')}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title="Copy evidence"
                  >
                    {copiedField === 'evidence' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-medium">
                <p className="text-xs text-emerald-900 font-medium leading-relaxed italic">
                  {sentence.supportingEvidence ? `"${sentence.supportingEvidence}"` : '— No sentence-level evidence met similarity threshold —'}
                </p>
              </div>
            </div>

            {/* 4. Collapsible Context Chunk Section */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsChunkExpanded(!isChunkExpanded)}
                  className="flex items-center space-x-1 text-left focus:outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-aegis-muted uppercase tracking-wider">
                    Retrieved Context Chunk
                  </span>
                  {isChunkExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  )}
                </button>

                {sentence.best_chunk && (
                  <button
                    onClick={() => handleCopyText(sentence.best_chunk || '', 'chunk')}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title="Copy context chunk"
                  >
                    {copiedField === 'chunk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {isChunkExpanded && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-medium max-h-48 overflow-y-auto">
                  <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                    {sentence.best_chunk || 'No context chunk retrieved.'}
                  </p>
                </div>
              )}
            </div>

            {/* 5. Classification Reason */}
            {!isSupported && sentence.reason && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-medium space-y-1">
                <span className="text-[10px] font-bold text-amber-800 flex items-center uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Classification Reason
                </span>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {sentence.reason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});
