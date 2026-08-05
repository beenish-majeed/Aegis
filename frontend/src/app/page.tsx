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
import { Play, ShieldCheck, Zap, Upload, FileCheck2, BarChart2 } from 'lucide-react';

export default function AIWorkspaceDashboardPage() {
  const { metrics, unsupportedClaims, isLoading, hasDemoData, refreshData } = useDashboardData();
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
        best_chunk: point.sentence,
      };
      selectSentence(sentenceObj);
    },
    [selectSentence]
  );

  return (
    <PageContainer
      title="Aegis RAG Faithfulness Auditor"
      description="Enterprise RAG faithfulness observability platform, evidence relationship tracing, and sentence-level hallucination diagnostics."
      actions={
        <Link href="/scan">
          <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Start Document Scan
          </Button>
        </Link>
      }
    >
      {/* SaaS Hero Welcome Banner */}
      <Card className="mb-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-aegis-surface to-aegis-surface shadow-xl">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="p-3.5 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-aegis-text">Aegis AI Auditor</h3>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  v5.0.0 Enterprise
                </span>
              </div>
              <p className="text-xs text-aegis-muted mt-1.5 max-w-2xl leading-relaxed">
                Empowering AI teams to detect hallucinated claims, compute cosine vector similarity, and verify sentence-level grounding against document contexts.
              </p>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-aegis-border/40 max-w-lg">
                <div className="flex items-center space-x-2 text-xs">
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-aegis-text font-medium">Upload Document</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Play className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-aegis-text font-medium">Trigger Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-aegis-text font-medium">Interactive AI Q&A</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
            <Link href="/scan" className="w-full md:w-auto">
              <Button variant="primary" size="lg" className="w-full md:w-auto h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25">
                <Play className="w-4 h-4 mr-2 fill-current" />
                Upload & Analyze Document
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
                emptyTitle="No Unsupported Claims Detected"
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
