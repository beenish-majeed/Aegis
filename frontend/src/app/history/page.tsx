'use client';

export const dynamic = 'force-dynamic';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { RecentAuditsTable } from '@/components/dashboard/recent-audits-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { History, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();

  const handleSelectScan = (scanId: string) => {
    router.push('/results');
  };

  return (
    <PageContainer
      title="Audit History Logs"
      description="View, inspect, and export all historical RAG faithfulness scan evaluations recorded by Aegis."
    >
      <div className="space-y-6">
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-aegis-surface to-aegis-surface">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-aegis-text flex items-center">
                  Audit Log Registry
                  <ShieldCheck className="w-4 h-4 ml-2 text-emerald-500" />
                </CardTitle>
                <CardDescription className="text-xs text-aegis-muted">
                  Chronological record of vector similarity scans, faithfulness scores, and exported compliance documents.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <RecentAuditsTable onSelectScan={handleSelectScan} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
