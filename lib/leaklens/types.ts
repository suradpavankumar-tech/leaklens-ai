export type LeakAnomalyType =
  | 'REFUND_SPIKE'
  | 'PAYMENT_FAILURE_SPIKE'
  | 'PRODUCT_REVENUE_DROP'
  | 'CHURN_DRIFT'
  | 'FEE_DISCREPANCY';

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type InvestigationStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface AffectedEntity {
  type: 'PRODUCT' | 'REGION' | 'SUBSCRIPTION' | 'GATEWAY' | 'MERCHANT_ACCOUNT';
  id?: string;
  name: string;
  region?: string;
}

export interface LeakAnomaly {
  id: string;
  type: LeakAnomalyType;
  title: string;
  severity: AnomalySeverity;
  status: InvestigationStatus;
  detectedAt: string;
  affectedPeriod: {
    from: string;
    to: string;
    displayLabel: string;
  };
  affectedEntity: AffectedEntity;
  currency: string;
  actualMetricValue: number;
  baselineMetricValue: number;
  metricUnit: 'PERCENT' | 'CURRENCY' | 'COUNT';
  estimatedExcessLeakAmount: number;
  explanation: string;
  recommendation: string;
  evidenceTransactionIds: string[];
}

export interface NormalizedTransaction {
  id: string;
  date: string;
  currency: string;
  amount: number;
  fee: number;
  net: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'REVERSED';
  eventType: string;
  counterparty: string | null;
  productId?: string;
  productName?: string;
  region?: string;
  isAnomalyRelated?: boolean;
  relatedAnomalyId?: string;
  leakCategory?: string;
  note?: string | null;
}

export interface MerchantKpiSummary {
  currency: string;
  totalGrossSales: number;
  totalNetSales: number;
  totalRefunds: number;
  totalFees: number;
  successfulPaymentsCount: number;
  failedPaymentsCount: number;
  refundRate: number;
  failureRate: number;
  historicalBaselineRefundRate: number;
  historicalBaselineFailureRate: number;
  excessRefundLeakAmount: number;
  estimatedTotalLeakage: number;
  activeAnomaliesCount: number;
  criticalAnomaliesCount: number;
  dataMode: 'PAYPAL_SANDBOX' | 'LEAKLENS_DEMO_SCENARIO';
  scenarioName?: string;
}

export interface ProductPerformanceMetric {
  productId: string;
  productName: string;
  grossRevenue: number;
  refundedAmount: number;
  refundRate: number;
  historicalRefundRate: number;
  excessRefundAmount: number;
  transactionCount: number;
  failedAttemptCount: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL_LEAK';
  primaryIssue?: string;
}

export interface InvestigationQueryResult {
  query: string;
  summary: string;
  identifiedPeriod: string;
  findings: string[];
  affectedProducts: string[];
  affectedRegions: string[];
  quantifiedImpact: {
    excessLeakAmount: number;
    currency: string;
    historicalBaseline: string;
    actualMetric: string;
  };
  supportingEvidenceIds: string[];
  suggestedActionItems: string[];
  recommendedWidgets: {
    widgetType: 'above-baseline-refunds' | 'refund-hotspot' | 'revenue-leak-flow' | 'evidence-grid';
    title: string;
    description: string;
    priority: number;
  }[];
}
