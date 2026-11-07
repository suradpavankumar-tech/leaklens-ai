'use client';

import React from 'react';
import type { ProductPerformanceMetric } from '@/lib/leaklens/types';

interface RefundHotspotWidgetProps {
  products: ProductPerformanceMetric[];
  onSelectProduct?: (productId: string) => void;
}

export function RefundHotspotWidget({
  products,
  onSelectProduct,
}: RefundHotspotWidgetProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Product Refund Hotspot Analysis</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              SKU Level
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identifies specific products responsible for disproportionate capital drain
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="pb-2">Catalog Product</th>
              <th className="pb-2 text-right">Gross Sales</th>
              <th className="pb-2 text-right">Refund Rate</th>
              <th className="pb-2 text-right">Excess Loss</th>
              <th className="pb-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.map((p) => {
              const isCritical = p.status === 'CRITICAL_LEAK';
              const isWarning = p.status === 'WARNING';

              return (
                <tr
                  key={p.productId}
                  onClick={() => onSelectProduct?.(p.productId)}
                  className={`group hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    isCritical ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-2.5 font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                      <span>{p.productName}</span>
                    </div>
                    {p.primaryIssue && (
                      <span className="text-[10px] text-rose-400/80 block mt-0.5">
                        {p.primaryIssue}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-300">
                    ${p.grossRevenue.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        isCritical
                          ? 'text-rose-400'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {(p.refundRate * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      base: {(p.historicalRefundRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold">
                    {p.excessRefundAmount > 0 ? (
                      <span className="text-rose-400">
                        +${p.excessRefundAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">$0.00</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
