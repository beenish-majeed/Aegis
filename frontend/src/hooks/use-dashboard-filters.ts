import * as React from 'react';
import { ConfidenceLevel, FaithfulnessStatus } from '@/types/scanner';

export interface UseDashboardFiltersResult {
  searchQuery: string;
  statusFilter: FaithfulnessStatus | 'ALL';
  confidenceFilter: ConfidenceLevel | 'ALL';
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: FaithfulnessStatus | 'ALL') => void;
  setConfidenceFilter: (level: ConfidenceLevel | 'ALL') => void;
  resetFilters: () => void;
}

export function useDashboardFilters(): UseDashboardFiltersResult {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<FaithfulnessStatus | 'ALL'>('ALL');
  const [confidenceFilter, setConfidenceFilter] = React.useState<ConfidenceLevel | 'ALL'>('ALL');

  const resetFilters = React.useCallback(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setConfidenceFilter('ALL');
  }, []);

  return {
    searchQuery,
    statusFilter,
    confidenceFilter,
    setSearchQuery,
    setStatusFilter,
    setConfidenceFilter,
    resetFilters,
  };
}
