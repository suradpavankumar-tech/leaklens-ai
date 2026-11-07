import React from 'react';

interface RevenueKpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  baselineComparison?: string;
  trend?: 'healthy' | 'warning' | 'critical' | 'neutral';
  icon?: React.ReactNode;
}

export function RevenueKpiCard({
  label,
  value,
  subtext,
  baselineComparison,
  trend = 'neutral',
  icon,
}: RevenueKpiCardProps) {
  const trendBorder = {
    healthy: 'border-emerald-500/30 hover:border-emerald-500/60',
    warning: 'border-amber-500/30 hover:border-amber-500/60',
    critical: 'border-rose-500/40 hover:border-rose-500/70 shadow-rose-950/20 shadow-lg',
    neutral: 'border-slate-800 hover:border-slate-700',
  }[trend];

  const valueColor = {
    healthy: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400',
    neutral: 'text-slate-100',
  }[trend];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/80 p-5 border ${trendBorder} transition-all duration-200 backdrop-blur-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${valueColor}`}>
          {value}
        </span>
      </div>

      {(subtext || baselineComparison) && (
        <div className="mt-2.5 flex flex-col gap-0.5 text-xs">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {baselineComparison && (
            <span
              className={`font-medium ${
                trend === 'critical'
                  ? 'text-rose-400'
                  : trend === 'warning'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {baselineComparison}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
