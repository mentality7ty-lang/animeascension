import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FundamentalsClient from './fundamentals-client';

export default async function Page() {
  const db = await createClient();
  const { data: claims } = await db.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: character } = await db
    .from('characters')
    .select('name,power,strength,speed,endurance,focus,rank,world')
    .eq('user_id', userId)
    .maybeSingle();

  if (!character || character.world !== 'frontier' || !character.rank?.toLowerCase().includes('aura initiated')) {
    redirect('/life-frontier');
  }

  return <FundamentalsClient userId={userId} character={character} />;
}
