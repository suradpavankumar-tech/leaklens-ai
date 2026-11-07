import type { Metadata } from 'next';
import { getLeakLensData } from '@/lib/leaklens/engine';
import { LeakLensClient } from './leaklens-client';

export const metadata: Metadata = {
  title: 'Command Center · LeakLens AI',
  description: 'Autonomous Revenue Leak Investigator for PayPal Merchants',
};

export default async function LeakLensPage() {
  const initialData = await getLeakLensData(true);

  return <LeakLensClient initialData={initialData} />;
}
