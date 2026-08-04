'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface ConfidenceHistogramItem {
  level: string;
  count: number;
  color: string;
}

export interface ConfidenceHistogramProps {
  data?: ConfidenceHistogramItem[];
  onSelectLevel?: (level: string) => void;
}

const DEFAULT_HISTOGRAM_DATA: ConfidenceHistogramItem[] = [
  { level: 'Very High', count: 12, color: '#4F46E5' },
  { level: 'High', count: 6, color: '#10B981' },
  { level: 'Medium', count: 3, color: '#F59E0B' },
  { level: 'Low', count: 2, color: '#F97316' },
  { level: 'Very Low', count: 1, color: '#EF4444' },
];

export function ConfidenceHistogram({
  data = DEFAULT_HISTOGRAM_DATA,
  onSelectLevel,
}: ConfidenceHistogramProps) {
  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <XAxis
            dataKey="level"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            onClick={(entry) => onSelectLevel && onSelectLevel(entry.level)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
