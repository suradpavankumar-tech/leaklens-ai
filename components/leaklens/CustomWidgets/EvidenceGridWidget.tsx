'use client';

import React, { useMemo, useState, useRef } from 'react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  DateFilterModule,
  NumberFilterModule,
  PaginationModule,
  QuickFilterModule,
  TextFilterModule,
  themeQuartz,
  type ColDef,
  type ValueFormatterParams,
} from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import type { NormalizedTransaction } from '@/lib/leaklens/types';

const modules = [
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  QuickFilterModule,
  ColumnAutoSizeModule,
  PaginationModule,
  CellStyleModule,
  CsvExportModule,
];

// Dark midnight theme for LeakLens
const leakLensGridTheme = themeQuartz.withParams({
  fontFamily: 'Inter, system-ui, sans-serif',
  accentColor: '#06b6d4',
  backgroundColor: '#0f172a',
  foregroundColor: '#e2e8f0',
  borderColor: '#1e293b',
  headerBackgroundColor: '#090d16',
  headerTextColor: '#94a3b8',
  rowHoverColor: '#1e293b',
});

interface EvidenceGridWidgetProps {
  transactions: NormalizedTransaction[];
  selectedAnomalyId?: string;
}

export function EvidenceGridWidget({
  transactions,
  selectedAnomalyId,
}: EvidenceGridWidgetProps) {
  const gridRef = useRef<{ api: { exportDataAsCsv: (params?: { fileName?: string }) => void } } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'flagged' | 'failed'>(
    selectedAnomalyId ? 'flagged' : 'all'
  );
  const [quickFilterText, setQuickFilterText] = useState('');

  const handleExportCsv = () => {
    try {
      gridRef.current?.api?.exportDataAsCsv({
        fileName: `paypal-leaklens-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
      });
    } catch (e) {
      console.warn('Export CSV fallback', e);
    }
  };

  const rowData = useMemo(() => {
    if (filterType === 'flagged') {
      return transactions.filter(
        (t) => t.isAnomalyRelated || t.status === 'REFUNDED'
      );
    }
    if (filterType === 'failed') {
      return transactions.filter((t) => t.status === 'FAILED');
    }
    return transactions;
  }, [transactions, filterType]);

  const colDefs = useMemo<ColDef<NormalizedTransaction>[]>(() => {
    return [
      {
        field: 'id',
        headerName: 'Transaction ID',
        filter: 'agTextColumnFilter',
        width: 160,
        cellRenderer: (params: { value: string; data?: NormalizedTransaction }) => {
          const isFlagged = params.data?.isAnomalyRelated;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {isFlagged && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
                  title="Correlated to Revenue Leak"
                />
              )}
              <span className={isFlagged ? 'text-rose-300 font-semibold' : 'text-slate-300'}>
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: 'date',
        headerName: 'Date / Time',
        filter: 'agDateColumnFilter',
        width: 170,
        valueFormatter: (p: ValueFormatterParams) =>
          p.value ? new Date(p.value).toLocaleString() : '—',
      },
      {
        field: 'productName',
        headerName: 'Catalog Item',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 180,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: (params: { value: string }) => {
          const s = params.value;
          const style =
            s === 'REFUNDED'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : s === 'FAILED'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${style}`}>
              {s}
            </span>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'Gross Amount',
        filter: 'agNumberColumnFilter',
        width: 130,
        cellClass: 'text-right font-mono',
        valueFormatter: (p: ValueFormatterParams) => {
          const val = Number(p.value);
          const sign = p.data?.status === 'REFUNDED' ? '-' : '';
          return `${sign}$${Math.abs(val).toFixed(2)}`;
        },
      },
      {
        field: 'region',
        headerName: 'Region',
        width: 130,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'note',
        headerName: 'PayPal Dispute / Event Note',
        flex: 1.5,
        minWidth: 260,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { value?: string }) => (
          <span className="text-xs text-slate-400 italic">
            {params.value || 'Normal settlement'}
          </span>
        ),
      },
    ];
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>AG Grid Investigation Evidence Ledger</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive Grid
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full audit log supporting AI anomaly detection and leak quantification
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('flagged')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === 'flagged'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flagged Leaks
            </button>
            <button
              onClick={() => setFilterType('failed')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === 'failed'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Declined
            </button>
          </div>

          <input
            type="text"
            placeholder="Search records..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
          />
          <button
            onClick={handleExportCsv}
            title="Download audit records as CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="mt-4 h-[380px] w-full rounded-lg overflow-hidden border border-slate-800">
        <AgGridProvider modules={modules}>
          <AgGridReact
            ref={gridRef as any}
            theme={leakLensGridTheme}
            rowData={rowData}
            columnDefs={colDefs}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50]}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
          />
        </AgGridProvider>
      </div>
    </div>
  );
}
