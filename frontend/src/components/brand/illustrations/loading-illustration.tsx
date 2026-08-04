'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export function LoadingIllustration({ className }: { className?: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="45" stroke="#E2E8F0" strokeWidth="4" />
      <motion.circle
        cx="60"
        cy="60"
        r="45"
        stroke="#4F46E5"
        strokeWidth="4"
        strokeDasharray="70 200"
        strokeLinecap="round"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <circle cx="60" cy="60" r="8" fill="#4F46E5" />
    </svg>
  );
}
