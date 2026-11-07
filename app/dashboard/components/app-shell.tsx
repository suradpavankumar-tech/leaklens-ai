'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { BellIcon, HelpIcon, CloseIcon, AlertIcon } from './ui/icons';
import { AgStudioLogo } from './ui/logo';

// The app frame, laid out like the PayPal Developer Dashboard: a white top bar, a left sidebar
// and a light canvas. Shared by the dashboard, its loading skeleton and its error page.

function PayPalWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold italic tracking-tight ${className}`}>
      <span className="text-pp-blue-dark">Pay</span>
      <span className="text-pp-sky">Pal</span>
    </span>
  );
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <AgStudioLogo className="-ml-3 h-12 w-auto" />
      <span className="h-6 w-px bg-pp-border" aria-hidden />
      <span className="flex items-baseline gap-1 text-xs text-pp-muted">
        powered by <PayPalWordmark className="text-base" /> APIs
      </span>
    </div>
  );
}

interface NotificationItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'critical',
    title: 'Critical Refund Spike Alert',
    description: 'AI Predictive Add-On refund rate spiked to 38.5% (Baseline: 3.5%). Estimated excess leakage: $4,200.',
    time: '4m ago',
    read: false,
    link: '/leaklens',
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Authorization Failure Anomaly',
    description: '12 recurring billing declines detected on Tier-2 Subscriptions following gateway token refresh.',
    time: '18m ago',
    read: false,
    link: '/leaklens',
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'PayPal Sandbox Connected',
    description: 'Live OAuth2 credentials verified with USD reporting & transaction ledger active.',
    time: '1h ago',
    read: false,
    link: '/leaklens',
  },
];

function TopBar() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
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
      <header className="flex h-16 shrink-0 items-center gap-6 border-b border-pp-border bg-white px-6">
        <BrandLockup />
        <div className="ml-auto flex items-center gap-3 text-pp-navy">
          {/* Flagship Console Link */}
          <Link
            href="/leaklens"
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
            <span>LeakLens AI Console →</span>
          </Link>

          {/* Help Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-pp-highlight text-pp-muted hover:text-pp-navy transition-colors cursor-pointer"
            title="Help & User Guide"
            aria-label="Open documentation and help"
          >
            <HelpIcon />
          </button>

          {/* Notifications Center */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-pp-highlight text-pp-muted hover:text-pp-navy transition-colors relative cursor-pointer"
              title="Notifications & Leak Alerts"
              aria-label="View notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-84 sm:w-96 rounded-xl border border-pp-border bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-pp-border bg-pp-canvas/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-pp-navy">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-pp-blue hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 divide-y divide-pp-border overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 transition-colors hover:bg-pp-highlight ${
                        notif.read ? 'opacity-70 bg-white' : 'bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'critical' ? (
                            <span className="flex size-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                              <AlertIcon className="size-3.5" />
                            </span>
                          ) : notif.type === 'warning' ? (
                            <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                              !
                            </span>
                          ) : (
                            <span className="flex size-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-xs">
                              i
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-pp-navy truncate">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-pp-muted shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-pp-ink/80 leading-relaxed">
                            {notif.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <Link
                              href={notif.link}
                              onClick={() => setIsNotificationsOpen(false)}
                              className="text-[11px] font-semibold text-pp-blue hover:underline flex items-center gap-1"
                            >
                              <span>Investigate in LeakLens</span>
                              <span>→</span>
                            </Link>
                            {!notif.read && (
                              <span className="size-1.5 rounded-full bg-pp-blue" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-pp-border bg-pp-canvas/40 px-4 py-2.5 text-center">
                  <Link
                    href="/leaklens"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs font-semibold text-pp-navy hover:text-pp-blue transition-colors"
                  >
                    Open Autonomous Revenue Investigator →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Popover */}
          <div className="relative ml-2" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-pp-highlight transition-colors cursor-pointer"
              title="Merchant Profile & Settings"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-pp-navy text-sm font-semibold text-white">
                AG
              </span>
              <span className="hidden text-sm font-semibold sm:inline text-pp-navy">
                Demo merchant
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-pp-border bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 border-b border-pp-border pb-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-pp-navy text-sm font-bold text-white">
                    AG
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-pp-navy">PayPal Sandbox Merchant</p>
                    <p className="text-xs text-pp-muted truncate">sandbox-merchant@leaklens.io</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-pp-muted">
                    <span>Integration:</span>
                    <span className="font-semibold text-emerald-600">PayPal REST OAuth 2.0</span>
                  </div>
                  <div className="flex justify-between text-pp-muted">
                    <span>Settlement Currency:</span>
                    <span className="font-semibold text-pp-navy">USD ($)</span>
                  </div>
                  <div className="flex justify-between text-pp-muted">
                    <span>Engine Mode:</span>
                    <span className="font-semibold text-pp-navy">Dual-Mode Broker</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-pp-border pt-3 flex flex-col gap-2">
                  <Link
                    href="/leaklens"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-center rounded-lg bg-pp-highlight hover:bg-blue-100/60 py-1.5 text-xs font-semibold text-pp-navy transition-colors"
                  >
                    Open LeakLens Console
                  </Link>
                  <a
                    href="https://developer.paypal.com/dashboard/applications/sandbox"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center text-[11px] text-pp-muted hover:text-pp-navy hover:underline py-1"
                  >
                    PayPal Developer Portal ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Help & User Guide Modal Dialog */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-2xl border border-pp-border bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pp-border bg-pp-canvas/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-pp-navy text-white">
                  <HelpIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-pp-navy">
                    LeakLens AI & AG Studio Guide
                  </h3>
                  <p className="text-xs text-pp-muted">
                    Autonomous Revenue Leak Investigator for PayPal Merchants
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="rounded-lg p-1.5 text-pp-muted hover:bg-pp-highlight hover:text-pp-navy transition-colors cursor-pointer"
                title="Close Guide"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-6 text-sm text-pp-ink">
              {/* Concept */}
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 border border-blue-100">
                <h4 className="font-bold text-pp-navy text-sm flex items-center gap-2">
                  <span>💡 Core Philosophy: &quot;The LLM Proposes, Code Decides&quot;</span>
                </h4>
                <p className="mt-1.5 text-xs text-pp-muted leading-relaxed">
                  Traditional AI dashboards suffer from mathematical hallucination. LeakLens AI computes all return ratios, capital aging buckets, and delta leak values deterministically in TypeScript. The AI acts strictly as the investigative auditor, contextualizing findings and proposing merchant interventions.
                </p>
              </div>

              {/* How to use the views */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-pp-border p-4 bg-white">
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                    Feature 1
                  </span>
                  <h5 className="font-bold text-pp-navy text-sm mt-1">Revenue Leaks & Radar</h5>
                  <p className="text-xs text-pp-muted mt-1 leading-relaxed">
                    Embedded directly in this AG Studio dashboard. Highlights above-baseline returns, uncollected receivables, and transaction event distribution.
                  </p>
                </div>
                <div className="rounded-xl border border-pp-border p-4 bg-white">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Feature 2
                  </span>
                  <h5 className="font-bold text-pp-navy text-sm mt-1">AG Grid Evidence Ledger</h5>
                  <p className="text-xs text-pp-muted mt-1 leading-relaxed">
                    Located on <Link href="/leaklens" className="text-pp-blue underline">/leaklens</Link>. High-density table featuring quick filtering, auto-sizing columns, and one-click anomaly cross-filtering.
                  </p>
                </div>
              </div>

              {/* Useful Links */}
              <div>
                <h4 className="font-bold text-xs text-pp-navy uppercase tracking-wider mb-2">
                  Official Developer Documentation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href="https://developer.paypal.com/docs/api/overview/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-pp-border hover:bg-pp-highlight hover:border-pp-blue/40 transition-colors text-xs font-medium text-pp-navy"
                  >
                    <span>PayPal API Docs</span>
                    <span className="text-pp-muted">↗</span>
                  </a>
                  <a
                    href="https://www.ag-grid.com/react-data-grid/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-pp-border hover:bg-pp-highlight hover:border-pp-blue/40 transition-colors text-xs font-medium text-pp-navy"
                  >
                    <span>AG Grid Docs</span>
                    <span className="text-pp-muted">↗</span>
                  </a>
                  <a
                    href="https://www.ag-grid.com/ag-studio/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-pp-border hover:bg-pp-highlight hover:border-pp-blue/40 transition-colors text-xs font-medium text-pp-navy"
                  >
                    <span>AG Studio Guide</span>
                    <span className="text-pp-muted">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-pp-border bg-pp-canvas/40 px-6 py-3.5">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 rounded-lg bg-pp-navy hover:bg-pp-navy/90 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Got it, close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col bg-pp-canvas font-paypal text-pp-ink">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-64 shrink-0 flex-col border-r border-pp-border bg-white" aria-label="Reports">
          {sidebar}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
