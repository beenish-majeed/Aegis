'use client';

import * as React from 'react';
import { RecentAuditsTable } from '@/components/dashboard/history/recent-audits-table';

export function AuditHistory() {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <h2 className="text-lg font-bold text-aegis-text">Audit History Log</h2>
      <RecentAuditsTable />
    </div>
  );
}
