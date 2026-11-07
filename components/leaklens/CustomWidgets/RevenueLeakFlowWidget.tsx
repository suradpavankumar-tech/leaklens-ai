'use client';

import React from 'react';
import type { MerchantKpiSummary } from '@/lib/leaklens/types';

interface RevenueLeakFlowWidgetProps {
  kpis: MerchantKpiSummary;
}

export function RevenueLeakFlowWidget({ kpis }: RevenueLeakFlowWidgetProps) {
  const gross = kpis.totalGrossSales;
  const refunds = kpis.totalRefunds;
  const net = kpis.totalNetSales;
  const fees = kpis.totalFees;
  const retained = Math.max(0, net - fees);

  const refundPct = gross > 0 ? (refunds / gross) * 100 : 0;
  const feePct = gross > 0 ? (fees / gross) * 100 : 0;
  const retainedPct = gross > 0 ? (retained / gross) * 100 : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Revenue Capital Drain Flow</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Sankey Cash Funnel
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Traces merchant cashflow from checkout volume to uncollected revenue leaks
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Stage 1: Inflow */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-200">1. Gross Checkout Volume</span>
            <span className="font-mono text-cyan-400 font-bold">${gross.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-full" />
          </div>
        </div>

        {/* Funnel Split */}
        <div className="pl-4 border-l-2 border-slate-800 space-y-3.5 my-2">
          {/* Retained Net Cash */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Retained Realized Revenue</span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                ${retained.toLocaleString()} ({retainedPct.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${retainedPct}%` }}
              />
            </div>
          </div>

          {/* Refund Leak Drain */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Refunded &amp; Disputed Capital</span>
              </span>
              <span className="font-mono text-rose-400 font-semibold">
                -${refunds.toLocaleString()} ({refundPct.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${refundPct}%` }}
              />
            </div>
          </div>

          {/* PayPal Processing Fees */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>PayPal Processing &amp; Exchange Fees</span>
              </span>
              <span className="font-mono text-slate-400 font-semibold">
                -${fees.toLocaleString()} ({feePct.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-slate-400 h-full"
                style={{ width: `${feePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Failed Authorizations Callout */}
        {kpis.failedPaymentsCount > 0 && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{kpis.failedPaymentsCount} uncaptured checkout attempts occurred in this period.</span>
            </div>
            <span className="font-mono text-amber-400 font-bold">
              ~${(kpis.failedPaymentsCount * 49.5).toFixed(0)} uncaptured ARR
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
