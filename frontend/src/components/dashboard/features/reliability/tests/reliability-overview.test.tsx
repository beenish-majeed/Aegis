import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReliabilityOverview } from '../reliability-overview';
import { MOCK_DASHBOARD_METRICS } from '@/data/dashboard/dashboard-metrics';

describe('ReliabilityOverview Feature Component', () => {
  it('renders health score and evaluation summary correctly', () => {
    render(<ReliabilityOverview metrics={MOCK_DASHBOARD_METRICS} />);

    expect(screen.getByText('System Health Overview')).toBeInTheDocument();
    expect(screen.getByText('AI Reliability Overview')).toBeInTheDocument();
    expect(screen.getByText('AI Evaluation Summary')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
  });
});
