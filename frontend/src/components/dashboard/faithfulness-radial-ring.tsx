'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export interface FaithfulnessRadialRingProps {
  score: number; // 0 to 100
  size?: number;
}

export function FaithfulnessRadialRing({ score, size = 140 }: FaithfulnessRadialRingProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const isPassing = score >= 75;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-slate-100 dark:text-slate-800"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className={isPassing ? 'text-emerald-500' : 'text-rose-500'}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      {/* Center Percentage Display */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-aegis-text tracking-tight">
          {score.toFixed(1)}%
        </span>
        <span className="text-[10px] font-bold text-aegis-muted uppercase tracking-wider mt-0.5">
          Faithfulness
        </span>
      </div>
    </div>
  );
}
