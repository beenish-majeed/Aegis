import { create } from 'zustand';
import { AegisUserConfig, DEFAULT_USER_CONFIG } from '@/types/config';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  activeModal: string | null;
  config: AegisUserConfig;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  updateConfig: (newConfig: Partial<AegisUserConfig>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  isSidebarOpen: true,
  activeModal: null,
  config: DEFAULT_USER_CONFIG,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
}));
