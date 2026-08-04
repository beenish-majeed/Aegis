'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ShieldAlert, FileText, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SentenceResult } from '@/types/scanner';

export interface SentenceInspectorDrawerProps {
  sentence: SentenceResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SentenceInspectorDrawer({
  sentence,
  isOpen,
  onClose,
}: SentenceInspectorDrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!sentence) return null;

  const isSupported = sentence.status === 'SUPPORTED';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-40 backdrop-blur-sm"
          />

          {/* Side Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl border-l border-aegis-border flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                {isSupported ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="text-base font-bold text-aegis-text">Sentence Diagnostic Inspector</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-small text-aegis-muted hover:bg-slate-200 transition-colors"
                aria-label="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Header Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-medium">
                <div>
                  <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Evaluation Status</span>
                  <Badge variant={isSupported ? 'supported' : 'unsupported'} className="mt-0.5">
                    {sentence.status}
                  </Badge>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Confidence Level</span>
                  <Badge variant="very-high" className="mt-0.5">
                    {sentence.confidenceLevel}
                  </Badge>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider block">Similarity</span>
                  <span className="font-mono text-sm font-extrabold text-aegis-primary">
                    {sentence.similarity.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Original Evaluated Sentence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-aegis-muted uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1 text-aegis-primary" />
                  Original Evaluated Sentence
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-medium">
                  <p className="text-sm font-semibold text-aegis-text leading-relaxed">
                    "{sentence.sentence}"
                  </p>
                </div>
              </div>

              {/* Supporting Evidence Match */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-aegis-muted uppercase tracking-wider flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Isolated Supporting Evidence Sentence
                </h4>
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-medium">
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed italic">
                    {sentence.supportingEvidence ? `"${sentence.supportingEvidence}"` : '— No sentence-level evidence met similarity threshold —'}
                  </p>
                </div>
              </div>

              {/* Best Matching Context Chunk */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-aegis-muted uppercase tracking-wider flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Retrieved Context Chunk
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-medium">
                  <p className="text-xs text-slate-700 leading-relaxed font-mono">
                    {sentence.best_chunk || 'No context chunk was retrieved.'}
                  </p>
                </div>
              </div>

              {/* Reason for Classification */}
              {!isSupported && sentence.reason && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-medium space-y-1">
                  <span className="text-xs font-bold text-amber-800 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Classification Reason
                  </span>
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    {sentence.reason}
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                Close Inspector
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
