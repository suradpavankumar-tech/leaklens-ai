import type { NormalizedTransaction, ProductPerformanceMetric } from './types';

export interface LeakScenarioDataset {
  scenarioName: string;
  description: string;
  currency: string;
  historicalRefundBaselineRate: number;
  historicalFailureBaselineRate: number;
  transactions: NormalizedTransaction[];
  products: {
    id: string;
    name: string;
    category: string;
    price: number;
  }[];
}

export function generateRealisticLeakScenario(): LeakScenarioDataset {
  const currency = 'USD';
  const products = [
    { id: 'prod-saas-core', name: 'CloudScale SaaS Platform', category: 'Software Subscription', price: 99.0 },
    { id: 'prod-ai-addon', name: 'NeuralPredict AI Add-on', category: 'Usage Add-on', price: 249.0 },
    { id: 'prod-api-ent', name: 'Enterprise Gateway License', category: 'Annual Enterprise', price: 1200.0 },
    { id: 'prod-support-sla', name: '24/7 Dedicated Support SLA', category: 'Services', price: 450.0 },
  ];

  const transactions: NormalizedTransaction[] = [];
  let txIdCounter = 10000;

  const now = new Date();
  const getRandomDate = (daysAgo: number) => {
    const d = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 43200000);
    return d.toISOString();
  };

  const regions = ['North America', 'Western Europe', 'Asia Pacific', 'Latin America'];

  // 1. Regular healthy transactions for CloudScale SaaS Platform (prod-saas-core)
  for (let i = 0; i < 95; i++) {
    const id = `TX-PP-${txIdCounter++}`;
    const daysAgo = Math.floor(Math.random() * 28) + 1;
    const region = regions[i % regions.length];
    transactions.push({
      id,
      date: getRandomDate(daysAgo),
      currency,
      amount: 99.0,
      fee: -3.17, // standard 2.9% + $0.30
      net: 95.83,
      status: 'SUCCESS',
      eventType: 'T0006',
      counterparty: `customer_${100 + i}@enterprise.io`,
      productId: 'prod-saas-core',
      productName: 'CloudScale SaaS Platform',
      region,
      note: 'Monthly subscription automated billing',
    });
  }

  // A couple of normal refunds on prod-saas-core (baseline ~3%)
  for (let i = 0; i < 3; i++) {
    const id = `TX-PP-${txIdCounter++}`;
    transactions.push({
      id,
      date: getRandomDate(i * 5 + 2),
      currency,
      amount: -99.0,
      fee: 0,
      net: -99.0,
      status: 'REFUNDED',
      eventType: 'T1107',
      counterparty: `refund_user_${i}@example.com`,
      productId: 'prod-saas-core',
      productName: 'CloudScale SaaS Platform',
      region: 'North America',
      note: 'Buyer cancellation within 7-day remorse window',
    });
  }

  // 2. THE ANOMALY: "NeuralPredict AI Add-on" (prod-ai-addon)
  // Severe refund spike: 40 purchases, but 16 refunds (40% return rate!) due to API latency/integration issues!
  for (let i = 0; i < 38; i++) {
    const id = `TX-PP-${txIdCounter++}`;
    const daysAgo = Math.floor(Math.random() * 12) + 1;
    transactions.push({
      id,
      date: getRandomDate(daysAgo),
      currency,
      amount: 249.0,
      fee: -7.52,
      net: 241.48,
      status: 'SUCCESS',
      eventType: 'T0006',
      counterparty: `ai_subscriber_${i}@techcorp.com`,
      productId: 'prod-ai-addon',
      productName: 'NeuralPredict AI Add-on',
      region: i % 2 === 0 ? 'Western Europe' : 'North America',
      note: 'NeuralPredict v2.4 upgrade license',
    });
  }

  // 15 massive refunds concentrated in the last 10 days for prod-ai-addon
  for (let i = 0; i < 15; i++) {
    const id = `TX-PP-${txIdCounter++}`;
    const daysAgo = Math.floor(Math.random() * 8) + 1;
    transactions.push({
      id,
      date: getRandomDate(daysAgo),
      currency,
      amount: -249.0,
      fee: 0,
      net: -249.0,
      status: 'REFUNDED',
      eventType: 'T1107',
      counterparty: `refund_ai_${i}@clientgroup.de`,
      productId: 'prod-ai-addon',
      productName: 'NeuralPredict AI Add-on',
      region: 'Western Europe',
      isAnomalyRelated: true,
      relatedAnomalyId: 'anom-refund-prod-prod-ai-addon',
      leakCategory: 'Critical Product Defect / Integration Latency',
      note: 'Dispute reason: API rate limits exceeded SLA; persistent gateway timeout during webhook sync',
    });
  }

  // 3. Enterprise Gateway License (prod-api-ent)
  for (let i = 0; i < 8; i++) {
    const id = `TX-PP-${txIdCounter++}`;
    transactions.push({
      id,
      date: getRandomDate(i * 3 + 1),
      currency,
      amount: 1200.0,
      fee: -35.1,
      net: 1164.9,
      status: 'SUCCESS',
      eventType: 'T0006',
      counterparty: `corp_finance_${i}@globalbank.com`,
      productId: 'prod-api-ent',
      productName: 'Enterprise Gateway License',
      region: 'North America',
      note: 'Annual dedicated node license fee',
    });
  }

  // 4. Involuntary Churn & Authorization Failure Surge (12 failed recurring checkout attempts)
  for (let i = 0; i < 12; i++) {
    const id = `TX-FAIL-${txIdCounter++}`;
    const daysAgo = Math.floor(Math.random() * 6) + 1;
    transactions.push({
      id,
      date: getRandomDate(daysAgo),
      currency,
      amount: 99.0,
      fee: 0,
      net: 0,
      status: 'FAILED',
      eventType: 'T0000_FAILED',
      counterparty: `declined_customer_${i}@domain.com`,
      productId: 'prod-saas-core',
      productName: 'CloudScale SaaS Platform',
      region: 'North America',
      isAnomalyRelated: true,
      relatedAnomalyId: 'anom-gateway-timeout',
      leakCategory: 'Vaulted Card Expired / Webhook Retry Exhaustion',
      note: 'PayPal error: INSTRUMENT_DECLINED / Payment source could not be settled',
    });
  }

  return {
    scenarioName: 'Q4 Revenue Leak Investigation: NeuralPredict Refund Surge & Churn Anomaly',
    description:
      'Synthetic merchant snapshot exhibiting an extreme 38.5% refund spike on the NeuralPredict AI Add-on ($3,735 excess leak) and 12 authorization failures.',
    currency,
    historicalRefundBaselineRate: 0.035, // 3.5%
    historicalFailureBaselineRate: 0.02, // 2.0%
    transactions: transactions.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    products,
  };
}
