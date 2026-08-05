'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { RefreshCw, Play, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function AIWorkspaceDashboardPage() {
  const { metrics, unsupportedClaims, isLoading, hasDemoData, loadDemoData, clearData, refreshData } = useDashboardData();
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
        <div className="flex items-center space-x-2">
          {!hasDemoData ? (
            <>
              <Link href="/scan">
                <Button variant="primary" size="sm">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Run First Scan
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoading}
                onClick={loadDemoData}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                Load Demo Data
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoading}
                onClick={refreshData}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh Metrics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearData}
                className="text-xs text-aegis-muted hover:text-aegis-text"
              >
                Reset Zero State
              </Button>
            </>
          )}
        </div>
      }
    >
      {!hasDemoData && (
        <Card className="mb-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-pink-900/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 glow-hover">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-large">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-aegis-text flex items-center gap-2">
                  Welcome to Aegis RAG Faithfulness Auditor
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    v5.0.0
                  </span>
                </h3>
                <p className="text-xs text-aegis-muted mt-1 max-w-xl leading-relaxed">
                  No evaluation scans recorded in this workspace yet. Execute a live RAG scan to detect hallucinated claims or click below to populate the workspace with interactive sample datasets for review.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
              <Link href="/scan" className="w-full md:w-auto">
                <Button variant="primary" className="w-full md:w-auto shadow-lg shadow-indigo-500/20">
                  <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                  Run First Scan
                </Button>
              </Link>
              <Button variant="secondary" onClick={loadDemoData} className="w-full md:w-auto">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" />
                Load Demo Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              <DashboardSection
                isLoading={isLoading}
                isEmpty={unsupportedClaims.length === 0}
                emptyTitle="No Unsupported Claims"
              >
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
