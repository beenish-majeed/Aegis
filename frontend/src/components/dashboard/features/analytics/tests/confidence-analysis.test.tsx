import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfidenceAnalysis } from '../confidence-analysis';

describe('ConfidenceAnalysis Feature Component', () => {
  it('renders score card and histogram title', () => {
    render(
      <ConfidenceAnalysis
        score={85.7}
        confidenceStatus="Very High"
        trendPercentage={1.8}
        activeFilter={null}
        onSelectFilter={vi.fn()}
      />
    );

    expect(screen.getByText('Faithfulness Health')).toBeInTheDocument();
    expect(screen.getByText('Confidence Histogram')).toBeInTheDocument();
  });
});
