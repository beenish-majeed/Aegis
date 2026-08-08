import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardData } from '../use-dashboard-data';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDashboardData Custom Hook', () => {
  it('returns default zero state metrics when no scan data is loaded', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    expect(result.current.metrics.healthScore).toBe(0);
    expect(result.current.unsupportedClaims.length).toBe(0);
  });

  it('loads demo data when loadDemoData is invoked', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    act(() => {
      result.current.loadDemoData();
    });

    expect(result.current.metrics.healthScore).toBe(94.2);
    expect(result.current.unsupportedClaims.length).toBeGreaterThan(0);
  });
});

