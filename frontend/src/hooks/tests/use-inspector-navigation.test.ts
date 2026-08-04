import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useInspectorNavigation } from '../use-inspector-navigation';
import { MOCK_UNSUPPORTED_CLAIMS } from '@/data/dashboard/findings';

describe('useInspectorNavigation Custom Hook', () => {
  it('initializes with first finding selected', () => {
    const { result } = renderHook(() => useInspectorNavigation(MOCK_UNSUPPORTED_CLAIMS));

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.selectedSentence).toEqual(MOCK_UNSUPPORTED_CLAIMS[0]);
  });

  it('navigates next and previous findings correctly', () => {
    const { result } = renderHook(() => useInspectorNavigation(MOCK_UNSUPPORTED_CLAIMS));

    act(() => {
      result.current.navigateNext();
    });
    expect(result.current.selectedIndex).toBe(1);

    act(() => {
      result.current.navigatePrev();
    });
    expect(result.current.selectedIndex).toBe(0);
  });

  it('handles clearing selection', () => {
    const { result } = renderHook(() => useInspectorNavigation(MOCK_UNSUPPORTED_CLAIMS));

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedIndex).toBeNull();
    expect(result.current.selectedSentence).toBeNull();
  });
});
