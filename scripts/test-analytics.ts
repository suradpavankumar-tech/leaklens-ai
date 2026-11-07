import {
  calculateMerchantKpis,
  calculateProductMetrics,
  detectDeterministicAnomalies,
} from '../lib/leaklens/analytics';
import { generateRealisticLeakScenario } from '../lib/leaklens/mock-data';

function runTests() {
  console.log('=== LEAKLENS AI ANALYTICS ENGINE TEST SUITE ===\n');

  // Test 1: Scenario 2 - Refund Spike verification
  console.log('--- TEST 1: Refund Spike Scenario Validation ---');
  const scenario = generateRealisticLeakScenario();
  const kpis = calculateMerchantKpis(
    scenario.transactions,
    scenario.currency,
    scenario.historicalRefundBaselineRate,
    scenario.historicalFailureBaselineRate,
  );

  console.log(`Gross Sales: $${kpis.totalGrossSales.toLocaleString()}`);
  console.log(`Observed Refunds: $${kpis.totalRefunds.toLocaleString()}`);
  console.log(`Observed Refund Rate: ${(kpis.refundRate * 100).toFixed(1)}%`);
  console.log(`Historical Baseline: ${(kpis.historicalBaselineRefundRate * 100).toFixed(1)}%`);
  console.log(`Excess Refund Drain: +$${kpis.excessRefundLeakAmount.toLocaleString()}`);

  if (kpis.excessRefundLeakAmount > 0) {
    console.log('✅ TEST 1 PASSED: Excess refund drain correctly identified deterministically.');
  } else {
    console.error('❌ TEST 1 FAILED: Expected positive excess refund drain.');
  }

  // Test 2: Product Metrics Ranking
  console.log('\n--- TEST 2: Product Hotspot Attribution ---');
  const products = calculateProductMetrics(
    scenario.transactions,
    scenario.historicalRefundBaselineRate,
  );

  for (const p of products) {
    console.log(
      `- ${p.productName}: Gross $${p.grossRevenue.toLocaleString()} | Return Rate ${(p.refundRate * 100).toFixed(1)}% | Status: [${p.status}]`
    );
  }

  const criticalProd = products.find((p) => p.status === 'CRITICAL_LEAK');
  if (criticalProd && criticalProd.productId === 'prod-ai-addon') {
    console.log(`✅ TEST 2 PASSED: Critical leak correctly isolated to ${criticalProd.productName}.`);
  } else {
    console.error('❌ TEST 2 FAILED: Expected prod-ai-addon to be flagged as CRITICAL_LEAK.');
  }

  // Test 3: Anomaly Detection Generation
  console.log('\n--- TEST 3: Anomaly Record Structure ---');
  const anomalies = detectDeterministicAnomalies(
    scenario.transactions,
    scenario.currency,
    scenario.historicalRefundBaselineRate,
    scenario.historicalFailureBaselineRate,
  );

  console.log(`Total anomalies detected: ${anomalies.length}`);
  for (const a of anomalies) {
    console.log(`- [${a.severity}] ${a.title} | Excess: +$${a.estimatedExcessLeakAmount.toLocaleString()}`);
  }

  if (anomalies.length >= 2) {
    console.log('✅ TEST 3 PASSED: Expected multi-anomaly detection achieved.');
  } else {
    console.error('❌ TEST 3 FAILED: Less than 2 anomalies detected.');
  }

  console.log('\n=== ALL TEST CHECKS FINISHED ===');
}

runTests();
