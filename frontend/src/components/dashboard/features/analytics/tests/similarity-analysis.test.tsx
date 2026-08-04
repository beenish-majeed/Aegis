import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SimilarityAnalysis } from '../similarity-analysis';

describe('SimilarityAnalysis Feature Component', () => {
  it('renders similarity timeline header', () => {
    render(<SimilarityAnalysis onSentenceClick={vi.fn()} />);

    expect(screen.getByText('Sentence Similarity Timeline')).toBeInTheDocument();
  });
});
