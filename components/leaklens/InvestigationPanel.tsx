'use client';

import React, { useState } from 'react';
import type { InvestigationQueryResult } from '@/lib/leaklens/types';

interface InvestigationPanelProps {
  onRunQuery: (query: string) => Promise<InvestigationQueryResult | null>;
  activeResult: InvestigationQueryResult | null;
  loading: boolean;
}

const SUGGESTED_QUERIES = [
  'Why did refunds increase this week?',
  'Which product has the highest refund leak?',
  'Investigate failed recurring authorization dropoff',
  'Audit Western Europe regional return anomalies',
];

export function InvestigationPanel({
  onRunQuery,
  activeResult,
  loading,
}: InvestigationPanelProps) {
  const [inputQuery, setInputQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;
    onRunQuery(inputQuery);
  };

  const handleSelectSuggested = (q: string) => {
    setInputQuery(q);
    onRunQuery(q);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Revenue Leak Investigator</h3>
            <p className="text-xs text-slate-400">
              Deterministic evidence retrieval + AG Studio widget orchestration
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Studio Agent Framework
        </span>
      </div>

      {/* Query input */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask the investigator (e.g. 'Why did refunds spike on NeuralPredict?')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-24 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-xs rounded-md transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Investigate</span>
            )}
          </button>
        </div>
      </form>

      {/* Suggested prompts */}
      <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-slate-500 font-medium">Quick Prompts:</span>
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSelectSuggested(q)}
            className="text-[11px] bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 px-2.5 py-1 rounded-md border border-slate-800/80 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Output results */}
      {activeResult && (
        <div className="mt-5 border-t border-slate-800/80 pt-4 space-y-4">
          <div className="bg-slate-950/70 border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                  Autonomous Findings
                </span>
                <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                  {activeResult.summary}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-mono">Excess Capital Loss</span>
                <span className="text-lg font-black text-rose-400">
                  +${activeResult.quantifiedImpact.excessLeakAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-900">
              <div>
                <span className="text-[11px] text-slate-500">Historical Target:</span>
                <span className="ml-1.5 font-mono text-emerald-400 font-medium">
                  {activeResult.quantifiedImpact.historicalBaseline}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Observed Rate:</span>
                <span className="ml-1.5 font-mono text-rose-400 font-medium">
                  {activeResult.quantifiedImpact.actualMetric}
                </span>
              </div>
            </div>
          </div>

          {/* Root cause findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Discovered Root Causes
            </h4>
            <ul className="space-y-1.5">
              {activeResult.findings.map((f, i) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  <span className="text-cyan-400 font-bold shrink-0">#{i + 1}</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Action Items */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Recommended Remediation Steps
            </h4>
            <div className="space-y-1.5">
              {activeResult.suggestedActionItems.map((action, i) => (
                <div key={i} className="text-xs text-emerald-300/90 flex items-center gap-2 bg-emerald-950/10 border border-emerald-900/30 p-2 rounded">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended AG Studio Widgets */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Configured AG Studio Widgets
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeResult.recommendedWidgets.length} Active Widgets
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeResult.recommendedWidgets.map((w, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg text-xs">
                  <span className="font-semibold text-slate-200 block">{w.title}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{w.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
