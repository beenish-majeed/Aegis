import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSkeleton } from '../card';

describe('Card Component System', () => {
  it('renders card title and description correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Faithfulness Score</CardTitle>
          <CardDescription>Evaluation metric summary</CardDescription>
        </CardHeader>
        <CardContent>85.7%</CardContent>
      </Card>
    );

    expect(screen.getByText('Faithfulness Score')).toBeInTheDocument();
    expect(screen.getByText('Evaluation metric summary')).toBeInTheDocument();
    expect(screen.getByText('85.7%')).toBeInTheDocument();
  });

  it('renders CardSkeleton placeholder during loading', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});
