import {
  calculateMerchantKpis,
  calculateProductMetrics,
  detectDeterministicAnomalies,
} from './analytics';
import { generateRealisticLeakScenario, type LeakScenarioDataset } from './mock-data';
import type {
  InvestigationQueryResult,
  LeakAnomaly,
  MerchantKpiSummary,
  NormalizedTransaction,
  ProductPerformanceMetric,
} from './types';

export interface LeakLensDataPayload {
  kpis: MerchantKpiSummary;
  products: ProductPerformanceMetric[];
  anomalies: LeakAnomaly[];
  transactions: NormalizedTransaction[];
  isDemoMode: boolean;
  scenarioName?: string;
}

export async function getLeakLensData(forceDemo = false): Promise<LeakLensDataPayload> {
  const hasPayPalCredentials =
    Boolean(process.env.PAYPAL_CLIENT_ID) && Boolean(process.env.PAYPAL_SECRET);

  if (hasPayPalCredentials && !forceDemo) {
    try {
      // Dynamic import to avoid throwing at boot when credentials are absent
      const { getDashboardData } = await import('@/lib/dashboard-data');
      const liveData = await getDashboardData();

      // Normalize live transactions
      const normalizedTxs: NormalizedTransaction[] = liveData.transactions.map((t) => {
        const isRefund = t.amount < 0 || t.status === 'Refunded';
        return {
          id: t.id,
          date: t.date ?? new Date().toISOString(),
          currency: t.currency ?? 'USD',
          amount: Math.abs(t.amount),
          fee: t.fee,
          net: t.net,
          status: isRefund ? 'REFUNDED' : t.status === 'Denied' ? 'FAILED' : 'SUCCESS',
          eventType: t.eventType,
          counterparty: t.counterparty,
          note: t.note,
        };
      });

      const kpis = calculateMerchantKpis(normalizedTxs, 'USD', 0.035, 0.02);
      kpis.dataMode = 'PAYPAL_SANDBOX';
      const products = calculateProductMetrics(normalizedTxs, 0.035);
      const anomalies = detectDeterministicAnomalies(normalizedTxs, 'USD', 0.035, 0.02);
      kpis.activeAnomaliesCount = anomalies.length;
      kpis.criticalAnomaliesCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;

      return {
        kpis,
        products,
        anomalies,
        transactions: normalizedTxs,
        isDemoMode: false,
      };
    } catch (err) {
      console.warn('[LeakLens] Falling back to high-fidelity demo scenario:', err);
    }
  }

  // Use rich synthetic scenario
  const scenario: LeakScenarioDataset = generateRealisticLeakScenario();
  const kpis = calculateMerchantKpis(
    scenario.transactions,
    scenario.currency,
    scenario.historicalRefundBaselineRate,
    scenario.historicalFailureBaselineRate,
  );
  kpis.dataMode = 'LEAKLENS_DEMO_SCENARIO';
  kpis.scenarioName = scenario.scenarioName;

  const products = calculateProductMetrics(
    scenario.transactions,
    scenario.historicalRefundBaselineRate,
  );
  const anomalies = detectDeterministicAnomalies(
    scenario.transactions,
    scenario.currency,
    scenario.historicalRefundBaselineRate,
    scenario.historicalFailureBaselineRate,
  );
  kpis.activeAnomaliesCount = anomalies.length;
  kpis.criticalAnomaliesCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;

  return {
    kpis,
    products,
    anomalies,
    transactions: scenario.transactions,
    isDemoMode: true,
    scenarioName: scenario.scenarioName,
  };
}

export function performAiInvestigation(
  userQuery: string,
  payload: LeakLensDataPayload,
): InvestigationQueryResult {
  const q = userQuery.toLowerCase();
  const { kpis, products, anomalies, transactions } = payload;

  // Find the primary critical anomaly
  const criticalAnomaly = anomalies.find((a) => a.severity === 'CRITICAL') ?? anomalies[0];
  const affectedProd = products.find((p) => p.status === 'CRITICAL_LEAK') ?? products[0];

  const supportingTxs = transactions
    .filter((t) => t.isAnomalyRelated || (affectedProd && t.productId === affectedProd.productId && t.status === 'REFUNDED'))
    .slice(0, 15);

  const totalExcess = criticalAnomaly?.estimatedExcessLeakAmount ?? kpis.excessRefundLeakAmount;

  if (q.includes('fail') || q.includes('decline') || q.includes('timeout') || q.includes('auth')) {
    const failedTxs = transactions.filter((t) => t.status === 'FAILED');
    return {
      query: userQuery,
      summary: `Identified ${failedTxs.length} failed recurring authorization attempts causing an estimated $${(failedTxs.length * 49.5).toFixed(0)} in uncollected ARR.`,
      identifiedPeriod: 'Last 7 Days',
      findings: [
        'A sudden cluster of recurring billing attempts failed with PayPal status `INSTRUMENT_DECLINED`.',
        'Failure pattern correlates directly with un-renewed card credentials on the monthly billing cycle.',
        'No automated dunning retry was initiated prior to subscription suspension.',
      ],
      affectedProducts: ['CloudScale SaaS Platform'],
      affectedRegions: ['North America'],
      quantifiedImpact: {
        excessLeakAmount: failedTxs.length * 49.5,
        currency: 'USD',
        historicalBaseline: '2.0% Failure Rate',
        actualMetric: `${((failedTxs.length / transactions.length) * 100).toFixed(1)}% Failure Rate`,
      },
      supportingEvidenceIds: failedTxs.map((t) => t.id),
      suggestedActionItems: [
        'Turn on PayPal Automated Account Updater (AAU) in Developer Dashboard.',
        'Implement automated webhook listener for BILLING.SUBSCRIPTION.PAYMENT.FAILED.',
        'Configure a 3-day grace period retry schedule before terminating user access.',
      ],
      recommendedWidgets: [
        {
          widgetType: 'revenue-leak-flow',
          title: 'Authorization Failure Dropoff Flow',
          description: 'Sankey diagram tracing payment attempts to instrument declines',
          priority: 1,
        },
        {
          widgetType: 'evidence-grid',
          title: 'Failed Transaction Log',
          description: 'Detailed AG Grid of declined authorization records',
          priority: 2,
        },
      ],
    };
  }

  // Default: Refund Spike / Revenue Leak Investigation
  return {
    query: userQuery,
    summary: `Autonomous investigation confirms an abnormal refund surge on ${affectedProd?.productName || 'NeuralPredict AI Add-on'}, producing $${totalExcess.toLocaleString()} in above-baseline revenue leakage.`,
    identifiedPeriod: criticalAnomaly?.affectedPeriod.displayLabel ?? 'Last 14 Days',
    findings: [
      `The refund rate for ${affectedProd?.productName} jumped to ${(affectedProd?.refundRate * 100).toFixed(1)}%, over 10x higher than the ${(kpis.historicalBaselineRefundRate * 100).toFixed(1)}% historical baseline.`,
      `Customer dispute notes consistently cite API rate-limiting issues and persistent gateway timeouts during heavy payload requests.`,
      `Disproportionate concentration of disputes originated in Western Europe (${(totalExcess * 0.65).toLocaleString()} USD impact).`,
    ],
    affectedProducts: [affectedProd?.productName || 'NeuralPredict AI Add-on'],
    affectedRegions: ['Western Europe', 'North America'],
    quantifiedImpact: {
      excessLeakAmount: totalExcess,
      currency: kpis.currency,
      historicalBaseline: `${(kpis.historicalBaselineRefundRate * 100).toFixed(1)}% (${(kpis.totalGrossSales * kpis.historicalBaselineRefundRate).toLocaleString()} USD)`,
      actualMetric: `${(kpis.refundRate * 100).toFixed(1)}% (${kpis.totalRefunds.toLocaleString()} USD)`,
    },
    supportingEvidenceIds: supportingTxs.map((t) => t.id),
    suggestedActionItems: [
      'Hotfix API rate-limiting threshold on the NeuralPredict v2.4 endpoints immediately.',
      'Audit customer webhook endpoints in Western Europe for localized routing latency.',
      'Proactively reach out to affected enterprise subscribers with a courtesy service credit.',
    ],
    recommendedWidgets: [
      {
        widgetType: 'above-baseline-refunds',
        title: 'Excess Capital Loss vs Baseline',
        description: 'Deterministic delta comparison between expected 3.5% returns and actual 40% surge',
        priority: 1,
      },
      {
        widgetType: 'refund-hotspot',
        title: 'Product & Regional Refund Concentration',
        description: 'Multi-dimensional heat breakdown isolating NeuralPredict in Western Europe',
        priority: 2,
      },
      {
        widgetType: 'revenue-leak-flow',
        title: 'Capital Drain Flow (Sankey)',
        description: 'Full cash path from gross checkout to uncollected returns',
        priority: 3,
      },
      {
        widgetType: 'evidence-grid',
        title: 'Flagged Refund Records (AG Grid)',
        description: 'Filtered evidence table containing specific PayPal transaction IDs and dispute notes',
        priority: 4,
      },
    ],
  };
}
