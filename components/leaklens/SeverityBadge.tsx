import React from 'react';
import type { AnomalySeverity, InvestigationStatus } from '@/lib/leaklens/types';

export function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  const styles: Record<AnomalySeverity, string> = {
    CRITICAL: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    HIGH: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    MEDIUM: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    LOW: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[severity]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: InvestigationStatus }) {
  const styles: Record<InvestigationStatus, string> = {
    NEW: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    INVESTIGATING: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    DISMISSED: 'bg-slate-700 text-slate-400 border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
}
