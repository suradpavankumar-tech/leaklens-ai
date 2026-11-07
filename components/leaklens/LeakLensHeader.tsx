'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface LeakLensHeaderProps {
  isDemoMode: boolean;
  onToggleMode: (demo: boolean) => void;
  activeAnomaliesCount: number;
}

interface HeaderNotification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const headerNotifications: HeaderNotification[] = [
  {
    id: 'h-1',
    type: 'critical',
    title: 'Refund Surge Alert: AI Predictive Add-On',
    description: 'Refund rate reached 38.5% (historical: 3.5%). $4,200 estimated margin drain.',
    time: '4m ago',
    read: false,
  },
  {
    id: 'h-2',
    type: 'warning',
    title: 'Authorization Failure Anomaly',
    description: '12 recurring billing declines detected on Tier-2 subscriptions.',
    time: '18m ago',
    read: false,
  },
  {
    id: 'h-3',
    type: 'info',
    title: 'PayPal Sandbox Connected',
    description: 'Live OAuth2 token active for payments, invoicing, and reporting.',
    time: '1h ago',
    read: false,
  },
];

export function LeakLensHeader({
  isDemoMode,
  onToggleMode,
  activeAnomaliesCount,
}: LeakLensHeaderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>(headerNotifications);

  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <>
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
                <span>{activeAnomaliesCount} Revenue Leak Alerts</span>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => onToggleMode(true)}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  isDemoMode
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Demo Sandbox
              </button>
              <button
                onClick={() => onToggleMode(false)}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  !isDemoMode
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live PayPal API
              </button>
            </div>

            {/* Help Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Help & Architecture Guide"
              aria-label="Open Help"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeWidth="2" strokeLinecap="round" d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5h.01" />
              </svg>
            </button>

            {/* Notifications Button */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9" />
                  <path strokeWidth="2" strokeLinecap="round" d="M10 20a2 2 0 0 0 4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">Live Margin Alerts</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-medium text-cyan-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 divide-y divide-slate-800/80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3.5 transition-colors hover:bg-slate-800/50 cursor-pointer ${
                          notif.read ? 'opacity-60 bg-transparent' : 'bg-cyan-950/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 size-2 rounded-full shrink-0 ${
                              notif.type === 'critical'
                                ? 'bg-rose-500 shadow-sm shadow-rose-500'
                                : notif.type === 'warning'
                                ? 'bg-amber-400 shadow-sm shadow-amber-400'
                                : 'bg-cyan-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-slate-200 truncate">
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {notif.time}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                              {notif.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  ?
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">LeakLens AI Documentation</h3>
                  <p className="text-xs text-slate-400">Grounded financial audit architecture</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200">
                <p className="font-semibold text-white mb-1">Architecture: The LLM Proposes, Code Decides</p>
                All mathematical calculations, standard deviations, and excess loss amounts are computed deterministically in TypeScript. The AI acts strictly as the investigator to contextualize causes and recommend actions.
              </div>

              <div>
                <p className="font-semibold text-white mb-1">AG Grid Evidence Ledger</p>
                <p className="text-slate-400">
                  The evidence table below is powered by AG Grid Community 36. You can filter by status, search arbitrary strings, auto-size columns, or click any anomaly card to cross-filter the relevant transactions.
                </p>
              </div>

              <div>
                <p className="font-semibold text-white mb-1">Quick Links</p>
                <div className="flex gap-2">
                  <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs">
                    AG Studio Dashboard →
                  </Link>
                  <a
                    href="https://developer.paypal.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs"
                  >
                    PayPal Developer Portal ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-800 px-6 py-3 bg-slate-950/50">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
