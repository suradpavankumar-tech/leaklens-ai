import { getLeakLensData, performAiInvestigation } from '@/lib/leaklens/engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body?.query || 'Why did refunds increase this week?';
    const forceDemo = body?.forceDemo ?? true;

    const dataset = await getLeakLensData(forceDemo);
    const investigationResult = performAiInvestigation(query, dataset);

    return Response.json({
      success: true,
      data: investigationResult,
      meta: {
        isDemoMode: dataset.isDemoMode,
        activeAnomaliesCount: dataset.anomalies.length,
      },
    });
  } catch (error) {
    console.error('Error running LeakLens AI investigation:', error);
    return Response.json(
      { error: 'Failed to process investigation query' },
      { status: 500 }
    );
  }
}
