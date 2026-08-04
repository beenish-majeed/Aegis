'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface AIEvaluationSummaryCardProps {
  summaryText?: string;
  unsupportedCount?: number;
  mainFailureReason?: string;
  recommendedAction?: string;
}

export function AIEvaluationSummaryCard({
  summaryText = 'The evaluated answer demonstrates high overall faithfulness (85.7%), supported by 24 out of 28 sentences. Vector embeddings confirm strong alignment across core factual claims.',
  unsupportedCount = 4,
  mainFailureReason = 'Retrieved context chunks had insufficient similarity to support out-of-context extrapolation.',
  recommendedAction = 'Increase retriever top_k from 3 to 5 or recalibrate sentence segmentation bounds.',
}: AIEvaluationSummaryCardProps) {
  return (
    <Card className="bg-white border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-small">
              <Sparkles className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-aegis-text">AI Evaluation Summary</CardTitle>
          </div>
          <Badge variant={unsupportedCount === 0 ? 'supported' : 'unsupported'}>
            {unsupportedCount} Unsupported {unsupportedCount === 1 ? 'Claim' : 'Claims'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Human Readable Summary */}
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {summaryText}
        </p>

        {/* Main Failure Reason & Recommended Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-medium space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center">
              <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
              Primary Failure Reason
            </span>
            <p className="text-xs text-amber-900 font-medium leading-snug">
              {mainFailureReason}
            </p>
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-medium space-y-1">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center">
              <ArrowRight className="w-3 h-3 mr-1 text-indigo-600" />
              Recommended Next Action
            </span>
            <p className="text-xs text-indigo-900 font-medium leading-snug">
              {recommendedAction}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
