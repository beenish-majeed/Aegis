import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../badge';

describe('Badge Component', () => {
  it('renders supported badge with correct styles', () => {
    render(<Badge variant="supported">SUPPORTED</Badge>);
    const badge = screen.getByText('SUPPORTED');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-aegis-success-bg');
  });

  it('renders unsupported badge with red alert styles', () => {
    render(<Badge variant="unsupported font-bold">UNSUPPORTED</Badge>);
    const badge = screen.getByText('UNSUPPORTED');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-aegis-danger-bg');
  });
});
