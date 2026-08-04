import { create } from 'zustand';
import { ConfidenceLevel, FaithfulnessStatus } from '@/types/scanner';

interface FilterState {
  searchQuery: string;
  statusFilter: FaithfulnessStatus | 'ALL';
  confidenceFilter: ConfidenceLevel | 'ALL';
  selectedSentenceIndex: number | null;
  isDrawerOpen: boolean;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: FaithfulnessStatus | 'ALL') => void;
  setConfidenceFilter: (level: ConfidenceLevel | 'ALL') => void;
  openDrawer: (index: number) => void;
  closeDrawer: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  statusFilter: 'ALL',
  confidenceFilter: 'ALL',
  selectedSentenceIndex: null,
  isDrawerOpen: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setConfidenceFilter: (level) => set({ confidenceFilter: level }),
  openDrawer: (index) => set({ selectedSentenceIndex: index, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedSentenceIndex: null }),
  resetFilters: () =>
    set({
      searchQuery: '',
      statusFilter: 'ALL',
      confidenceFilter: 'ALL',
    }),
}));
