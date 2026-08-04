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
} from 'recharts';

export interface SequencePoint {
  sentenceIdx: string;
  similarity: number;
  confidence: number;
  sentence: string;
}

export interface SimilaritySequenceChartProps {
  data?: SequencePoint[];
  threshold?: number;
}

const DEFAULT_SEQUENCE_DATA: SequencePoint[] = [
  { sentenceIdx: 'S1', similarity: 0.98, confidence: 0.98, sentence: 'Paris is the capital of France.' },
  { sentenceIdx: 'S2', similarity: 0.94, confidence: 0.94, sentence: 'It is the most populous city in France.' },
  { sentenceIdx: 'S3', similarity: 0.89, confidence: 0.89, sentence: 'The city spans an area of 105 square kilometers.' },
  { sentenceIdx: 'S4', similarity: 0.78, confidence: 0.78, sentence: 'Its official currency is the Euro.' },
  { sentenceIdx: 'S5', similarity: 0.42, confidence: 0.42, sentence: 'The Eiffel tower was built in 1642.' },
  { sentenceIdx: 'S6', similarity: 0.91, confidence: 0.91, sentence: 'The Seine river flows through the heart of Paris.' },
];

export function SimilaritySequenceChart({
  data = DEFAULT_SEQUENCE_DATA,
  threshold = 0.75,
}: SimilaritySequenceChartProps) {
  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="similarityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="sentenceIdx"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine
            y={threshold}
            stroke="#EF4444"
            strokeDasharray="3 3"
            label={{
              value: `Threshold ${threshold}`,
              fill: '#EF4444',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Similarity']}
          />
          <Area
            type="monotone"
            dataKey="similarity"
            stroke="#4F46E5"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#similarityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
