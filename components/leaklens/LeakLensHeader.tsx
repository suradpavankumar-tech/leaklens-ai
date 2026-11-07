'use client';

import React from 'react';
import Link from 'next/link';

interface LeakLensHeaderProps {
  isDemoMode: boolean;
  onToggleMode: (demo: boolean) => void;
  activeAnomaliesCount: number;
}

export function LeakLensHeader({
  isDemoMode,
  onToggleMode,
  activeAnomaliesCount,
}: LeakLensHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/leaklens" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  LeakLens <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                  PayPal + AG Grid
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Revenue Leak Investigator for PayPal Merchants
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {activeAnomaliesCount > 0 && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>{activeAnomaliesCount} Revenue Leak Alerts Detected</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => onToggleMode(true)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                isDemoMode
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Sandbox
            </button>
            <button
              onClick={() => onToggleMode(false)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                !isDemoMode
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live PayPal API
            </button>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1"
          >
            <span>AG Studio View</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
