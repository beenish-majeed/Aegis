'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

export interface TimelinePoint {
  sentenceIdx: string;
  similarity: number;
  confidence: number;
  confidenceLevel: string;
  status: 'SUPPORTED' | 'POTENTIALLY_UNSUPPORTED';
  sentence: string;
  reason?: string | null;
}

export interface UpgradedSimilarityTimelineProps {
  data?: TimelinePoint[];
  threshold?: number;
  onSentenceClick?: (point: TimelinePoint) => void;
}

const DEFAULT_TIMELINE_DATA: TimelinePoint[] = [
  {
    sentenceIdx: 'S1',
    similarity: 0.9812,
    confidence: 0.98,
    confidenceLevel: 'Very High',
    status: 'SUPPORTED',
    sentence: 'Paris is the capital and largest city of France.',
    reason: null,
  },
  {
    sentenceIdx: 'S2',
    similarity: 0.9415,
    confidence: 0.94,
    confidenceLevel: 'Very High',
    status: 'SUPPORTED',
    sentence: 'It is the most populous city in France with over 2 million residents.',
    reason: null,
  },
  {
    sentenceIdx: 'S3',
    similarity: 0.8920,
    confidence: 0.89,
    confidenceLevel: 'High',
    status: 'SUPPORTED',
    sentence: 'The city spans an official administrative area of 105 square kilometers.',
    reason: null,
  },
  {
    sentenceIdx: 'S4',
    similarity: 0.7810,
    confidence: 0.78,
    confidenceLevel: 'High',
    status: 'SUPPORTED',
    sentence: 'Its official currency is the Euro.',
    reason: null,
  },
  {
    sentenceIdx: 'S5',
    similarity: 0.4215,
    confidence: 0.42,
    confidenceLevel: 'Low',
    status: 'POTENTIALLY_UNSUPPORTED',
    sentence: 'The Eiffel tower was constructed in 1642 by Louis XIV.',
    reason: 'A related context was retrieved, but no supporting evidence met the similarity threshold.',
  },
  {
    sentenceIdx: 'S6',
    similarity: 0.9140,
    confidence: 0.91,
    confidenceLevel: 'Very High',
    status: 'SUPPORTED',
    sentence: 'The Seine river flows through the historical heart of Paris.',
    reason: null,
  },
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as TimelinePoint;
    if (!data) return null;

    const isSupported = data.status === 'SUPPORTED';

    return (
      <div className="bg-white p-3 rounded-medium border border-aegis-border shadow-lg max-w-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-aegis-primary">{data.sentenceIdx}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isSupported ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {data.status}
          </span>
        </div>
        <p className="text-xs text-aegis-text font-medium line-clamp-2 italic">"{data.sentence}"</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
          <div>
            <span className="text-aegis-muted">Similarity:</span>{' '}
            <strong className="font-mono">{data.similarity.toFixed(4)}</strong>
          </div>
          <div>
            <span className="text-aegis-muted">Level:</span> <strong>{data.confidenceLevel}</strong>
          </div>
        </div>
        {data.reason && (
          <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
            ⚠️ {data.reason}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function UpgradedSimilarityTimeline({
  data = DEFAULT_TIMELINE_DATA,
  threshold = 0.75,
  onSentenceClick,
}: UpgradedSimilarityTimelineProps) {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 15, left: -25, bottom: 0 }}
          onClick={(state) => {
            if (state && state.activePayload && state.activePayload.length && onSentenceClick) {
              onSentenceClick(state.activePayload[0]?.payload as TimelinePoint);
            }
          }}
        >
          <defs>
            <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="sentenceIdx" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="3 3" label={{ value: `Threshold ${threshold}`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="similarity" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#timelineGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
