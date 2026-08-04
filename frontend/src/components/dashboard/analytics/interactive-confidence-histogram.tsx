'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { FolderX } from 'lucide-react';

export interface ConfidenceHistogramItem {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

export interface InteractiveConfidenceHistogramProps {
  data?: ConfidenceHistogramItem[];
  onSelectLevel?: (level: string) => void;
  activeLevel?: string | null;
}

const DEFAULT_HISTOGRAM_DATA: ConfidenceHistogramItem[] = [
  { level: 'Very High', count: 12, percentage: 50.0, color: '#4F46E5' },
  { level: 'High', count: 6, percentage: 25.0, color: '#10B981' },
  { level: 'Medium', count: 3, percentage: 12.5, color: '#F59E0B' },
  { level: 'Low', count: 2, percentage: 8.3, color: '#F97316' },
  { level: 'Very Low', count: 1, percentage: 4.2, color: '#EF4444' },
];

export function InteractiveConfidenceHistogram({
  data = DEFAULT_HISTOGRAM_DATA,
  onSelectLevel,
  activeLevel,
}: InteractiveConfidenceHistogramProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-medium border border-dashed border-slate-200">
        <FolderX className="w-6 h-6 text-slate-400 mb-2" />
        <p className="text-xs font-semibold text-aegis-text">No Histogram Data Available</p>
        <p className="text-[11px] text-aegis-muted mt-0.5">Run an audit scan to generate sentence confidence distributions.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-48 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
          <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} sentences (${props.payload.percentage.toFixed(1)}%)`,
              'Count',
            ]}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            onClick={(entry) => onSelectLevel && onSelectLevel(entry.level)}
          >
            <LabelList dataKey="percentage" position="top" formatter={(val: number) => `${val.toFixed(0)}%`} style={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
            {data.map((entry, index) => {
              const isSelected = activeLevel === entry.level;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeLevel ? (isSelected ? 1 : 0.35) : 1}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
