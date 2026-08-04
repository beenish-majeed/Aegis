import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDashboardFilters } from '../use-dashboard-filters';

describe('useDashboardFilters Custom Hook', () => {
  it('manages status and confidence filters correctly', () => {
    const { result } = renderHook(() => useDashboardFilters());

    expect(result.current.statusFilter).toBe('ALL');
    expect(result.current.confidenceFilter).toBe('ALL');

    act(() => {
      result.current.setStatusFilter('POTENTIALLY_UNSUPPORTED');
      result.current.setConfidenceFilter('Low');
    });

    expect(result.current.statusFilter).toBe('POTENTIALLY_UNSUPPORTED');
    expect(result.current.confidenceFilter).toBe('Low');

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.statusFilter).toBe('ALL');
    expect(result.current.confidenceFilter).toBe('ALL');
  });
});
