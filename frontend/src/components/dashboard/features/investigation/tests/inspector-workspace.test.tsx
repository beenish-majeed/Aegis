import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InspectorWorkspace } from '../inspector-workspace';
import { MOCK_UNSUPPORTED_CLAIMS } from '@/data/dashboard/findings';

describe('InspectorWorkspace Feature Component', () => {
  it('renders sentence diagnostic details when sentence is provided', () => {
    render(
      <InspectorWorkspace
        sentence={MOCK_UNSUPPORTED_CLAIMS[0] || null}
        currentIndex={1}
        totalFindings={2}
        onNavigatePrev={vi.fn()}
        onNavigateNext={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText('Diagnostic Workspace')).toBeInTheDocument();
    expect(screen.getByText('Finding 1 of 2')).toBeInTheDocument();
  });

  it('renders no finding selected placeholder when sentence is null', () => {
    render(
      <InspectorWorkspace
        sentence={null}
        currentIndex={1}
        totalFindings={2}
        onNavigatePrev={vi.fn()}
        onNavigateNext={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText('No Finding Selected')).toBeInTheDocument();
  });
});
