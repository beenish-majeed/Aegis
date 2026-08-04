import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatConfidenceScore(value: number): string {
  return value.toFixed(2);
}

export function formatSimilarityScore(value: number): string {
  return value.toFixed(4);
}
