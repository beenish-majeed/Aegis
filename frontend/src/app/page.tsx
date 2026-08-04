'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/dashboard/layout/dashboard-shell';
import { DashboardGrid } from '@/components/dashboard/layout/dashboard-grid';
import { DashboardSection } from '@/components/dashboard/layout/dashboard-section';
import { ReliabilityOverview } from '@/components/dashboard/features/reliability/reliability-overview';
import { ConfidenceAnalysis } from '@/components/dashboard/features/analytics/confidence-analysis';
import { SimilarityAnalysis } from '@/components/dashboard/features/analytics/similarity-analysis';
import { FindingsWorkspace } from '@/components/dashboard/features/investigation/findings-workspace';
import { InspectorWorkspace } from '@/components/dashboard/features/investigation/inspector-workspace';
import { AuditHistory } from '@/components/dashboard/features/history/audit-history';
import { TimelinePoint } from '@/components/dashboard/analytics/upgraded-similarity-timeline';
import { SentenceResult } from '@/types/scanner';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useInspectorNavigation } from '@/hooks/use-inspector-navigation';
import { useDashboardFilters } from '@/hooks/use-dashboard-filters';
import { RefreshCw } from 'lucide-react';

export default function AIWorkspaceDashboardPage() {
  const { metrics, unsupportedClaims, isLoading, refreshData } = useDashboardData();
  const {
    selectedIndex,
    selectedSentence,
    totalFindings,
    selectSentence,
    navigatePrev,
    navigateNext,
    clearSelection,
  } = useInspectorNavigation(unsupportedClaims);
  const { confidenceFilter, setConfidenceFilter } = useDashboardFilters();

  const handleTimelineSentenceClick = React.useCallback(
    (point: TimelinePoint) => {
      const sentenceObj: SentenceResult = {
        sentence: point.sentence,
        status: point.status,
        similarity: point.similarity,
        confidence: point.confidence,
        confidenceLevel: point.confidenceLevel as any,
        supportingEvidence: point.status === 'SUPPORTED' ? point.sentence : null,
        reason: point.reason || null,
        best_chunk:
          point.status === 'SUPPORTED'
            ? 'Paris is the capital and largest city of France.'
            : 'Paris is the capital of France.',
      };
      selectSentence(sentenceObj);
    },
    [selectSentence]
  );

  return (
    <PageContainer
      title="Aegis AI Evaluation Workspace"
      description="Production RAG faithfulness observability dashboard, evidence relationship tracing, and sentence diagnostics."
      actions={
        <Button
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          onClick={refreshData}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Metrics
        </Button>
      }
    >
      <DashboardShell>
        {/* 1. Macro AI Reliability Overview Feature */}
        <DashboardSection isLoading={isLoading}>
          <ReliabilityOverview metrics={metrics} />
        </DashboardSection>

        {/* 2. 12-Column Responsive Workspace Grid */}
        <DashboardGrid
          mainContent={
            <>
              {/* Critical Findings Feature */}
              <DashboardSection isLoading={isLoading} isEmpty={unsupportedClaims.length === 0} emptyTitle="No Unsupported Claims">
                <FindingsWorkspace
                  unsupportedClaims={unsupportedClaims}
                  onInspectSentence={selectSentence}
                />
              </DashboardSection>

              {/* Confidence Analysis Feature */}
              <DashboardSection isLoading={isLoading}>
                <ConfidenceAnalysis
                  score={metrics.faithfulnessScore}
                  confidenceStatus={metrics.confidenceStatus}
                  trendPercentage={metrics.trendPercentage}
                  activeFilter={confidenceFilter === 'ALL' ? null : confidenceFilter}
                  onSelectFilter={(level) =>
                    setConfidenceFilter(level === null ? 'ALL' : (level as any))
                  }
                />
              </DashboardSection>

              {/* Similarity Sequence Analysis Feature */}
              <DashboardSection isLoading={isLoading}>
                <SimilarityAnalysis onSentenceClick={handleTimelineSentenceClick} />
              </DashboardSection>

              {/* Audit History Log Feature */}
              <DashboardSection isLoading={isLoading}>
                <AuditHistory />
              </DashboardSection>
            </>
          }
          sideContent={
            <InspectorWorkspace
              sentence={selectedSentence}
              currentIndex={selectedIndex !== null ? selectedIndex + 1 : 1}
              totalFindings={totalFindings}
              onNavigatePrev={navigatePrev}
              onNavigateNext={navigateNext}
              onClear={clearSelection}
            />
          }
        />
      </DashboardShell>
    </PageContainer>
  );
}
