'use client';

import React from 'react';
import type { MerchantKpiSummary } from '@/lib/leaklens/types';

interface AboveBaselineRefundsWidgetProps {
  kpis: MerchantKpiSummary;
}

export function AboveBaselineRefundsWidget({ kpis }: AboveBaselineRefundsWidgetProps) {
  const expectedRefunds = kpis.totalGrossSales * kpis.historicalBaselineRefundRate;
  const excess = kpis.excessRefundLeakAmount;
  const actualRefunds = kpis.totalRefunds;

  const actualPct = (kpis.refundRate * 100).toFixed(1);
  const baselinePct = (kpis.historicalBaselineRefundRate * 100).toFixed(1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Above-Baseline Capital Loss</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Deterministic Delta
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares observed PayPal returns against the 30-day historical baseline
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-rose-400 tracking-tight">
            +${excess.toLocaleString()}
          </span>
          <span className="block text-[11px] text-slate-400 font-medium">Excess Drain</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
          <span className="text-xs text-slate-400 block">Observed Returns</span>
          <span className="text-lg font-bold text-slate-100 mt-1 block">
            ${actualRefunds.toLocaleString()}
          </span>
          <span className="text-[11px] text-rose-400 font-medium">
            {actualPct}% of gross sales
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
          <span className="text-xs text-slate-400 block">Expected Baseline</span>
          <span className="text-lg font-bold text-slate-100 mt-1 block">
            ${expectedRefunds.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">
            {baselinePct}% historical average
          </span>
        </div>

        <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3">
          <span className="text-xs text-rose-300 block">Severe Variance</span>
          <span className="text-lg font-bold text-rose-400 mt-1 block">
            +{((kpis.refundRate / kpis.historicalBaselineRefundRate - 1) * 100).toFixed(0)}%
          </span>
          <span className="text-[11px] text-rose-300 font-medium">
            Above normal threshold
          </span>
        </div>
      </div>

      <div className="mt-4 bg-slate-950/40 rounded-lg p-3 border border-slate-800/40">
        <div className="flex justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-400">Baseline Target (3.5%)</span>
          <span className="text-rose-400 font-bold">Observed Surge ({actualPct}%)</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${Math.min(100, (expectedRefunds / actualRefunds) * 100)}%` }}
            title="Expected Baseline"
          />
          <div
            className="bg-rose-500 h-full animate-pulse"
            style={{ width: `${Math.max(0, 100 - (expectedRefunds / actualRefunds) * 100)}%` }}
            title="Above-Baseline Leakage"
          />
        </div>
      </div>
    </div>
  );
}
