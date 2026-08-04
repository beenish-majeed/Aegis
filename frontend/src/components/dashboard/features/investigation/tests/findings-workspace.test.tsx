import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FindingsWorkspace } from '../findings-workspace';
import { MOCK_UNSUPPORTED_CLAIMS } from '@/data/dashboard/findings';

describe('FindingsWorkspace Feature Component', () => {
  it('renders critical findings list correctly', () => {
    render(
      <FindingsWorkspace
        unsupportedClaims={MOCK_UNSUPPORTED_CLAIMS}
        onInspectSentence={vi.fn()}
      />
    );

    expect(screen.getByText('Critical Findings Panel')).toBeInTheDocument();
    expect(screen.getByText('2 Unsupported Claims Flagged')).toBeInTheDocument();
  });
});
