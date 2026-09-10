import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VillageClient from './village-client';

export default async function VillagePage(){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId)redirect('/login');
  const {data:character}=await supabase.from('characters').select('name,power,focus,rank').eq('user_id',userId).maybeSingle();
  if(!character)redirect('/');
  const rank=character.rank?.toLowerCase()??'';
  if(!rank.includes('adept'))redirect('/');
  return <VillageClient character={character}/>;
}
