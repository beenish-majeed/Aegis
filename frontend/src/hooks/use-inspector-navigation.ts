import * as React from 'react';
import { SentenceResult } from '@/types/scanner';

export interface UseInspectorNavigationResult {
  selectedIndex: number | null;
  selectedSentence: SentenceResult | null;
  totalFindings: number;
  selectSentence: (sentence: SentenceResult) => void;
  selectIndex: (index: number | null) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
  clearSelection: () => void;
}

export function useInspectorNavigation(
  findings: SentenceResult[]
): UseInspectorNavigationResult {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(0);

  const totalFindings = findings.length;
  const selectedSentence =
    selectedIndex !== null && selectedIndex >= 0 && selectedIndex < totalFindings
      ? findings[selectedIndex] || null
      : null;

  const selectSentence = React.useCallback(
    (sentence: SentenceResult) => {
      const idx = findings.findIndex((item) => item.sentence === sentence.sentence);
      setSelectedIndex(idx !== -1 ? idx : 0);
    },
    [findings]
  );

  const selectIndex = React.useCallback((index: number | null) => {
    setSelectedIndex(index);
  }, []);

  const navigatePrev = React.useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
  }, []);

  const navigateNext = React.useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null && prev < totalFindings - 1 ? prev + 1 : prev
    );
  }, [totalFindings]);

  const clearSelection = React.useCallback(() => {
    setSelectedIndex(null);
  }, []);

  return {
    selectedIndex,
    selectedSentence,
    totalFindings,
    selectSentence,
    selectIndex,
    navigatePrev,
    navigateNext,
    clearSelection,
  };
}
