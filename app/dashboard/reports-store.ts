// Saved reports, kept in this browser's localStorage. Studio's state has no page names, so each
// report carries its page titles alongside the AG Studio state.
//
// The built-in report comes from ./studio/initial-report.ts until it is saved;
// after that the saved copy wins until it is reset to default.

import type { AgReportState } from 'ag-studio';
import { dashboardReport } from './studio/initial-report';

export type SavedReport = {
  id: string;
  name: string;
  builtIn?: boolean;
  pageTitles: Record<string, string>;
  state: AgReportState;
  updatedAt: string;
};

export type StoredReports = { reports: SavedReport[]; activeId: string };

const STORAGE_KEY = 'ag-paypal-demo:reports:v2';

export const BUILT_IN_ID = 'paypal-overview';

// Sidebar titles for the built-in report's pages, keyed by page id in initial-report.ts.
const defaultPageTitles: Record<string, string> = {
  'revenue-leaks': '⚡ Revenue Leaks & Radar',
  revenue: 'Revenue',
  receivables: 'Receivables',
  cash: 'Cash & payouts',
  catalogue: 'Catalogue',
};

export const defaultReport = (): SavedReport => ({
  id: BUILT_IN_ID,
  name: 'PayPal overview',
  builtIn: true,
  pageTitles: defaultPageTitles,
  state: dashboardReport,
  updatedAt: new Date(0).toISOString(),
});

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export function blankReport(name: string): SavedReport {
  const pageId = newId('page');
  return {
    id: newId('report'),
    name,
    pageTitles: { [pageId]: 'Page 1' },
    state: { selectedPageId: pageId, pages: [{ id: pageId }] },
    updatedAt: new Date().toISOString(),
  };
}

// A copy of a report under a new id. Copies of the built-in report are ordinary reports.
export const copyOf = (source: SavedReport): SavedReport => ({
  ...source,
  id: newId('report'),
  name: `${source.name} (copy)`,
  builtIn: undefined,
  updatedAt: new Date().toISOString(),
});

export const initialReports = (): StoredReports => ({
  reports: [defaultReport()],
  activeId: BUILT_IN_ID,
});

export function loadReports(): StoredReports {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialReports();
    const stored = JSON.parse(raw) as StoredReports;
    if (!stored.reports?.length) return initialReports();
    return stored;
  } catch (err) {
    console.warn('[AG Studio] failed to read saved reports from localStorage, resetting', err);
    return initialReports();
  }
}

export function saveReports(stored: StoredReports): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.warn('[AG Studio] failed to save reports to localStorage', err);
  }
}

export const findReport = (reports: SavedReport[], id: string) => reports.find((r) => r.id === id);

export function upsert(current: StoredReports, report: SavedReport): StoredReports {
  const index = current.reports.findIndex((r) => r.id === report.id);
  const reports = index === -1 ? [...current.reports, report] : current.reports.with(index, report);
  return { ...current, reports };
}

export function remove(current: StoredReports, id: string): StoredReports {
  const reports = current.reports.filter((r) => r.id !== id);
  if (!reports.length) return initialReports();
  const activeId = current.activeId === id ? reports[0].id : current.activeId;
  return { reports, activeId };
}
