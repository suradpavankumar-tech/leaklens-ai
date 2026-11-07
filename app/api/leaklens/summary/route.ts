import { getLeakLensData } from '@/lib/leaklens/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get('demo') === 'true' || searchParams.get('demo') === '1';

  try {
    const data = await getLeakLensData(forceDemo);
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching LeakLens summary:', error);
    return Response.json(
      { error: 'Failed to compute LeakLens metrics' },
      { status: 500 }
    );
  }
}
