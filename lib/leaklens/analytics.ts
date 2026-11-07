import type {
  LeakAnomaly,
  MerchantKpiSummary,
  NormalizedTransaction,
  ProductPerformanceMetric,
} from './types';

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateMerchantKpis(
  transactions: NormalizedTransaction[],
  currency = 'USD',
  historicalRefundBaselineRate = 0.035, // 3.5%
  historicalFailureBaselineRate = 0.02, // 2.0%
): MerchantKpiSummary {
  const currencyTxs = transactions.filter((t) => !t.currency || t.currency === currency);

  let grossSales = 0;
  let refunds = 0;
  let fees = 0;
  let successfulCount = 0;
  let failedCount = 0;

  for (const t of currencyTxs) {
    if (t.status === 'SUCCESS') {
      if (t.amount > 0) {
        grossSales += t.amount;
        successfulCount++;
      }
      fees += Math.abs(t.fee);
    } else if (t.status === 'REFUNDED') {
      refunds += Math.abs(t.amount);
      fees += Math.abs(t.fee);
    } else if (t.status === 'FAILED') {
      failedCount++;
    }
  }

  const netSales = round2(grossSales - refunds);
  const refundRate = grossSales > 0 ? round2(refunds / grossSales) : 0;
  const totalAttempts = successfulCount + failedCount;
  const failureRate = totalAttempts > 0 ? round2(failedCount / totalAttempts) : 0;

  // Deterministic excess calculation: max(0, actualRefunds - (grossSales * baselineRate))
  const expectedRefunds = grossSales * historicalRefundBaselineRate;
  const excessRefundLeak = round2(Math.max(0, refunds - expectedRefunds));

  // Estimate total leakage (excess refunds + estimated uncaptured/failed order value)
  const avgOrderValue = successfulCount > 0 ? grossSales / successfulCount : 50;
  const estimatedLostFailedRevenue = round2(failedCount * avgOrderValue * 0.4); // 40% would have converted
  const estimatedTotalLeakage = round2(excessRefundLeak + estimatedLostFailedRevenue);

  return {
    currency,
    totalGrossSales: round2(grossSales),
    totalNetSales: netSales,
    totalRefunds: round2(refunds),
    totalFees: round2(fees),
    successfulPaymentsCount: successfulCount,
    failedPaymentsCount: failedCount,
    refundRate,
    failureRate,
    historicalBaselineRefundRate: historicalRefundBaselineRate,
    historicalBaselineFailureRate: historicalFailureBaselineRate,
    excessRefundLeakAmount: excessRefundLeak,
    estimatedTotalLeakage,
    activeAnomaliesCount: 0, // Populated after anomaly detection
    criticalAnomaliesCount: 0,
    dataMode: 'LEAKLENS_DEMO_SCENARIO',
  };
}

export function calculateProductMetrics(
  transactions: NormalizedTransaction[],
  historicalBaselineRate = 0.035,
): ProductPerformanceMetric[] {
  const map = new Map<
    string,
    {
      id: string;
      name: string;
      gross: number;
      refunds: number;
      txCount: number;
      failedCount: number;
    }
  >();

  for (const t of transactions) {
    const pId = t.productId ?? 'uncategorized';
    const pName = t.productName ?? 'General Catalog Item';

    if (!map.has(pId)) {
      map.set(pId, { id: pId, name: pName, gross: 0, refunds: 0, txCount: 0, failedCount: 0 });
    }
    const entry = map.get(pId)!;

    if (t.status === 'SUCCESS' && t.amount > 0) {
      entry.gross += t.amount;
      entry.txCount++;
    } else if (t.status === 'REFUNDED') {
      entry.refunds += Math.abs(t.amount);
    } else if (t.status === 'FAILED') {
      entry.failedCount++;
    }
  }

  const results: ProductPerformanceMetric[] = [];
  for (const entry of map.values()) {
    const refundRate = entry.gross > 0 ? round2(entry.refunds / entry.gross) : 0;
    const expected = entry.gross * historicalBaselineRate;
    const excess = round2(Math.max(0, entry.refunds - expected));

    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL_LEAK' = 'HEALTHY';
    let primaryIssue: string | undefined;

    if (refundRate > 0.12 && excess > 500) {
      status = 'CRITICAL_LEAK';
      primaryIssue = `Refund rate of ${(refundRate * 100).toFixed(1)}% exceeds ${(historicalBaselineRate * 100).toFixed(1)}% baseline by $${excess.toLocaleString()}`;
    } else if (refundRate > 0.06 || excess > 200) {
      status = 'WARNING';
      primaryIssue = `Elevated refund rate of ${(refundRate * 100).toFixed(1)}% (Historical: ${(historicalBaselineRate * 100).toFixed(1)}%)`;
    }

    results.push({
      productId: entry.id,
      productName: entry.name,
      grossRevenue: round2(entry.gross),
      refundedAmount: round2(entry.refunds),
      refundRate,
      historicalRefundRate: historicalBaselineRate,
      excessRefundAmount: excess,
      transactionCount: entry.txCount,
      failedAttemptCount: entry.failedCount,
      status,
      primaryIssue,
    });
  }

  return results.sort((a, b) => b.excessRefundAmount - a.excessRefundAmount);
}

export function detectDeterministicAnomalies(
  transactions: NormalizedTransaction[],
  currency = 'USD',
  historicalRefundBaselineRate = 0.035,
  historicalFailureBaselineRate = 0.02,
): LeakAnomaly[] {
  const anomalies: LeakAnomaly[] = [];
  const productMetrics = calculateProductMetrics(transactions, historicalRefundBaselineRate);

  // 1. Check Product-Level Refund Spikes
  for (const pm of productMetrics) {
    if (pm.status === 'CRITICAL_LEAK') {
      const evidence = transactions
        .filter((t) => t.productId === pm.productId && t.status === 'REFUNDED')
        .map((t) => t.id);

      anomalies.push({
        id: `anom-refund-prod-${pm.productId}`,
        type: 'REFUND_SPIKE',
        title: `Abnormal Refund Spike on ${pm.productName}`,
        severity: 'CRITICAL',
        status: 'NEW',
        detectedAt: new Date().toISOString(),
        affectedPeriod: {
          from: 'Past 14 Days',
          to: 'Today',
          displayLabel: 'Last 14 Days Moving Window',
        },
        affectedEntity: {
          type: 'PRODUCT',
          id: pm.productId,
          name: pm.productName,
        },
        currency,
        actualMetricValue: round2(pm.refundRate * 100),
        baselineMetricValue: round2(historicalRefundBaselineRate * 100),
        metricUnit: 'PERCENT',
        estimatedExcessLeakAmount: pm.excessRefundAmount,
        explanation: `${pm.productName} experienced a severe surge in customer returns with an observed refund rate of ${(pm.refundRate * 100).toFixed(1)}%, compared to the historical baseline of ${(historicalRefundBaselineRate * 100).toFixed(1)}%. This represents $${pm.excessRefundAmount.toLocaleString()} in above-baseline capital loss.`,
        recommendation:
          'Audit product packaging, inspect customer return dispute notes for defect descriptions, and consider pausing PayPal recurring promotions until fulfillment QA is verified.',
        evidenceTransactionIds: evidence,
      });
    }
  }

  // 2. Check Regional Concentration
  const regionalRefunds = new Map<string, { gross: number; refunds: number; txs: string[] }>();
  for (const t of transactions) {
    const reg = t.region ?? 'Global';
    if (!regionalRefunds.has(reg)) {
      regionalRefunds.set(reg, { gross: 0, refunds: 0, txs: [] });
    }
    const r = regionalRefunds.get(reg)!;
    if (t.status === 'SUCCESS' && t.amount > 0) r.gross += t.amount;
    if (t.status === 'REFUNDED') {
      r.refunds += Math.abs(t.amount);
      r.txs.push(t.id);
    }
  }

  for (const [reg, data] of regionalRefunds.entries()) {
    const rate = data.gross > 0 ? data.refunds / data.gross : 0;
    if (rate > 0.15 && data.refunds > 800) {
      const excess = round2(Math.max(0, data.refunds - data.gross * historicalRefundBaselineRate));
      anomalies.push({
        id: `anom-region-${reg.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'REFUND_SPIKE',
        title: `Geographic Refund Anomaly: ${reg}`,
        severity: 'HIGH',
        status: 'NEW',
        detectedAt: new Date().toISOString(),
        affectedPeriod: {
          from: 'Current Billing Cycle',
          to: 'Today',
          displayLabel: 'Current Month',
        },
        affectedEntity: {
          type: 'REGION',
          name: reg,
          region: reg,
        },
        currency,
        actualMetricValue: round2(rate * 100),
        baselineMetricValue: round2(historicalRefundBaselineRate * 100),
        metricUnit: 'PERCENT',
        estimatedExcessLeakAmount: excess,
        explanation: `Transactions originated from ${reg} exhibit an extraordinary return rate of ${(rate * 100).toFixed(1)}%, significantly skewing portfolio metrics.`,
        recommendation:
          'Investigate regional customs/shipping delays, currency conversion rate friction, and review localized chargeback reasons.',
        evidenceTransactionIds: data.txs,
      });
    }
  }

  // 3. Check Payment Gateway / Involuntary Churn Failures
  const failedTxs = transactions.filter((t) => t.status === 'FAILED');
  if (failedTxs.length >= 8) {
    const totalTxs = transactions.length;
    const failRate = totalTxs > 0 ? failedTxs.length / totalTxs : 0;
    if (failRate > historicalFailureBaselineRate * 2) {
      const estimatedLoss = round2(failedTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0) * 0.5);
      anomalies.push({
        id: 'anom-gateway-timeout',
        type: 'PAYMENT_FAILURE_SPIKE',
        title: 'Subscription Authorization & Webhook Failure Surge',
        severity: 'HIGH',
        status: 'NEW',
        detectedAt: new Date().toISOString(),
        affectedPeriod: {
          from: 'Last 7 Days',
          to: 'Today',
          displayLabel: 'Last 7 Days',
        },
        affectedEntity: {
          type: 'GATEWAY',
          name: 'PayPal Smart Payment Buttons & Subscriptions',
        },
        currency,
        actualMetricValue: round2(failRate * 100),
        baselineMetricValue: round2(historicalFailureBaselineRate * 100),
        metricUnit: 'PERCENT',
        estimatedExcessLeakAmount: estimatedLoss,
        explanation: `Detected ${failedTxs.length} failed authorization attempts (${(failRate * 100).toFixed(1)}% attempt failure rate vs ${(historicalFailureBaselineRate * 100).toFixed(1)}% baseline). A majority correlate with expired vaulted cards and unhandled token refresh timeouts.`,
        recommendation:
          'Deploy PayPal Automated Account Updater (AAU) and configure aggressive 3-day dunning webhook retries before cancelling active subscriptions.',
        evidenceTransactionIds: failedTxs.map((t) => t.id),
      });
    }
  }

  return anomalies.sort((a, b) => b.estimatedExcessLeakAmount - a.estimatedExcessLeakAmount);
}
