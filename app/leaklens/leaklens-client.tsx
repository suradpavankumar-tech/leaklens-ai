'use client';

import React, { useState } from 'react';
import { LeakLensHeader } from '@/components/leaklens/LeakLensHeader';
import { RevenueKpiCard } from '@/components/leaklens/RevenueKpiCard';
import { SeverityBadge, StatusBadge } from '@/components/leaklens/SeverityBadge';
import { AboveBaselineRefundsWidget } from '@/components/leaklens/CustomWidgets/AboveBaselineRefundsWidget';
import { RefundHotspotWidget } from '@/components/leaklens/CustomWidgets/RefundHotspotWidget';
import { RevenueLeakFlowWidget } from '@/components/leaklens/CustomWidgets/RevenueLeakFlowWidget';
import { EvidenceGridWidget } from '@/components/leaklens/CustomWidgets/EvidenceGridWidget';
import { InvestigationPanel } from '@/components/leaklens/InvestigationPanel';
import type { LeakLensDataPayload } from '@/lib/leaklens/engine';
import type {
  InvestigationQueryResult,
  LeakAnomaly,
  MerchantKpiSummary,
  NormalizedTransaction,
  ProductPerformanceMetric,
} from '@/lib/leaklens/types';

interface LeakLensClientProps {
  initialData: LeakLensDataPayload;
}

export function LeakLensClient({ initialData }: LeakLensClientProps) {
  const [isDemoMode, setIsDemoMode] = useState(initialData.isDemoMode);
  const [investigating, setInvestigating] = useState(false);

  const [kpis, setKpis] = useState<MerchantKpiSummary | null>(initialData.kpis);
  const [products, setProducts] = useState<ProductPerformanceMetric[]>(initialData.products);
  const [anomalies, setAnomalies] = useState<LeakAnomaly[]>(initialData.anomalies);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>(initialData.transactions);
  const [activeInvestigation, setActiveInvestigation] = useState<InvestigationQueryResult | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<LeakAnomaly | null>(
    initialData.anomalies.length > 0 ? initialData.anomalies[0] : null
  );

  const handleToggleMode = async (demo: boolean) => {
    setIsDemoMode(demo);
    try {
      const res = await fetch(`/api/leaklens/summary?demo=${demo ? '1' : '0'}`);
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis);
        setProducts(data.products || []);
        setAnomalies(data.anomalies || []);
        setTransactions(data.transactions || []);
        if (data.anomalies?.length > 0) {
          setSelectedAnomaly(data.anomalies[0]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle LeakLens mode:', err);
    }
  };

  const handleRunInvestigation = async (query: string) => {
    setInvestigating(true);
    document.getElementById('investigation-section')?.scrollIntoView({ behavior: 'smooth' });
    try {
      const res = await fetch('/api/leaklens/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, forceDemo: isDemoMode }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setActiveInvestigation(json.data);
          return json.data;
        }
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setInvestigating(false);
    }
  };

  const scrollToLedger = () => {
    document.getElementById('evidence-ledger')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToWidgets = () => {
    document.getElementById('widgets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      <LeakLensHeader
        isDemoMode={isDemoMode}
        onToggleMode={handleToggleMode}
        activeAnomaliesCount={anomalies.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Info Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {isDemoMode ? 'Synthetic Audit Scenario' : 'Live PayPal Sandbox REST Ingestion'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  Targeting AG Grid &quot;Best Use of AG Grid&quot; Award
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Autonomous Revenue Leak Command Center
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Continuous deterministic inspection of PayPal checkout funnels, dispute velocity,
                recurring churn drift, and SKU return baselines with AI investigation orchestration.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() =>
                  handleRunInvestigation('Why did refunds increase on NeuralPredict this week?')
                }
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Trigger AI Investigation</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RevenueKpiCard
              label="Gross Transaction Volume"
              value={`$${kpis.totalGrossSales.toLocaleString()}`}
              subtext={`${kpis.successfulPaymentsCount} captured settlements`}
              trend="healthy"
              onClick={scrollToWidgets}
            />
            <RevenueKpiCard
              label="Realized Retained Cash"
              value={`$${kpis.totalNetSales.toLocaleString()}`}
              subtext="After fees & return deductions"
              trend="neutral"
              onClick={scrollToWidgets}
            />
            <RevenueKpiCard
              label="Observed Refund Rate"
              value={`${(kpis.refundRate * 100).toFixed(1)}%`}
              baselineComparison={`Historical baseline: ${(kpis.historicalBaselineRefundRate * 100).toFixed(1)}%`}
              trend={kpis.refundRate > 0.08 ? 'critical' : 'warning'}
              onClick={scrollToLedger}
            />
            <RevenueKpiCard
              label="Excess Capital Leakage"
              value={`+$${kpis.excessRefundLeakAmount.toLocaleString()}`}
              baselineComparison="Above expected baseline drain"
              trend="critical"
              onClick={scrollToLedger}
            />
          </div>
        )}

        {/* Critical Anomaly Alert Box */}
        {selectedAnomaly && (
          <div className="border border-rose-500/30 bg-rose-950/20 rounded-xl p-5 shadow-lg backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={selectedAnomaly.severity} />
                    <StatusBadge status={selectedAnomaly.status} />
                    <span className="text-xs font-mono text-slate-400">
                      ID: {selectedAnomaly.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">
                    {selectedAnomaly.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    {selectedAnomaly.explanation}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={scrollToLedger}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span>Audit Evidence in AG Grid Ledger</span>
                    </button>
                    <button
                      onClick={() => handleRunInvestigation(`Why did ${selectedAnomaly.title} occur and how to fix it?`)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Investigate Root Cause with AI</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-mono text-slate-400">Quantified Drain</span>
                <span className="text-xl font-black text-rose-400">
                  +${selectedAnomaly.estimatedExcessLeakAmount.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedAnomaly.actualMetricValue}% observed vs {selectedAnomaly.baselineMetricValue}% base
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Investigation Panel */}
        <section id="investigation-section">
          <InvestigationPanel
            onRunQuery={handleRunInvestigation}
            activeResult={activeInvestigation}
            loading={investigating}
          />
        </section>

        {/* Analytical Visualization Grid */}
        <div id="widgets-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {kpis && <AboveBaselineRefundsWidget kpis={kpis} />}
          {kpis && <RevenueLeakFlowWidget kpis={kpis} />}
        </div>

        {/* Product Hotspot Table */}
        <section>
          <RefundHotspotWidget
            products={products}
            onSelectProduct={(pId) => {
              const anom = anomalies.find((a) => a.affectedEntity.id === pId);
              if (anom) setSelectedAnomaly(anom);
            }}
          />
        </section>

        {/* AG Grid Evidence Ledger */}
        <section id="evidence-ledger">
          <EvidenceGridWidget
            transactions={transactions}
            selectedAnomalyId={selectedAnomaly?.id}
          />
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          LeakLens AI • Official Hackathon Entry for PayPal AI Hackathon 2026 • Powered by AG Grid &amp; AG Studio
        </p>
      </footer>
    </div>
  );
}
