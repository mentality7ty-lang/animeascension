import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GameClient from './game/game-client';

export default async function Home() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect('/login');

  const { data: character } = await supabase
    .from('characters')
    .select('id,name,power,strength,speed,endurance,focus,stamina,rank,world')
    .eq('user_id', userId)
    .maybeSingle();

  return <GameClient userId={userId} initialCharacter={character ?? null} />;
}
