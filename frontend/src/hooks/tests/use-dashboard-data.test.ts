import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDashboardData } from '../use-dashboard-data';

describe('useDashboardData Custom Hook', () => {
  it('returns default metrics and claims', () => {
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.metrics.healthScore).toBe(94.2);
    expect(result.current.unsupportedClaims.length).toBeGreaterThan(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles refresh state', () => {
    const { result } = renderHook(() => useDashboardData());

    act(() => {
      result.current.refreshData();
    });

    expect(result.current.isLoading).toBe(true);
  });
});
